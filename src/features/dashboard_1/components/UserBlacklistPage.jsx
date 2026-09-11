import React, { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { CalendarDays, RotateCcw } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createAdminBlacklistUser,
  getAdminBlacklistUsers,
  getUsers,
  removeAdminBlacklistUser,
} from "../services/adminEmployeeService";
import DashboardSuccessModal from "./DashboardSuccessModal";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const UserBlacklistPage = ({ searchQuery = "" }) => {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    mobile: "",
    blockedBy: "Admin",
    riskType: "LOGIN_RISK",
    reason: "",
  });
  const [blacklistUsers, setBlacklistUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmittingBlacklist, setIsSubmittingBlacklist] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const rowsPerPage = 10;
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadBlacklistUsers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const normalizedResponse = await fetchBlacklistPage({
          currentPage: isLocalFilterActive ? 1 : currentPage,
          rowsPerPage,
          search: searchQuery,
        });
        const normalizedRows = [...normalizedResponse.rows];

        if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
          const remainingResponses = await Promise.all(
            Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
              fetchBlacklistPage({
                currentPage: index + 2,
                rowsPerPage,
                search: searchQuery,
              }),
            ),
          );

          remainingResponses.forEach((pageResponse) => {
            normalizedRows.push(...pageResponse.rows);
          });
        }

        if (!isActive) return;

        setBlacklistUsers(normalizedRows);
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalApiPages(normalizedResponse.totalPages);
      } catch (error) {
        if (!isActive) return;

        setBlacklistUsers([]);
        setTotalRecords(0);
        setTotalApiPages(1);
        setErrorMessage(
          getAuthErrorMessage(
            error,
            "Unable to load blacklist users. Please try again.",
          ),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadBlacklistUsers();

    return () => {
      isActive = false;
    };
  }, [currentPage, isLocalFilterActive, searchQuery]);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    let isActive = true;

    async function loadUsers() {
      setIsLoadingUsers(true);
      setErrorMessage("");

      try {
        const response = await getUsers({ page: 0, size: 10 });
        const normalizedUsers = normalizeUsersResponse(response.data);

        if (isActive) {
          setUsers(normalizedUsers);
        }
      } catch (error) {
        if (isActive) {
          setUsers([]);
          setErrorMessage(
            getAuthErrorMessage(error, "Unable to load users. Please try again."),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [isModalOpen]);

  const currentData = blacklistUsers.filter((item) =>
    isDateWithinRange(item.createdAt, fromDate, toDate, year),
  );
  const effectiveTotalRecords = isLocalFilterActive ? currentData.length : totalRecords;
  const totalPages = isLocalFilterActive
    ? Math.max(Math.ceil(effectiveTotalRecords / rowsPerPage), 1)
    : totalApiPages;
  const visibleData = isLocalFilterActive
    ? currentData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : currentData;
  const showingFrom = effectiveTotalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, effectiveTotalRecords);
  const closeModal = () => setIsModalOpen(false);

  const handleYearChange = (value) => {
    setYear(value);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleFormChange = (field) => (event) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: event.target.value,
    }));
  };

  const handleUserSelect = (event) => {
    const selectedUserId = event.target.value;
    const selectedUser = users.find(
      (user) => String(user.id) === String(selectedUserId),
    );

    setFormData((currentData) => ({
      ...currentData,
      userId: selectedUserId,
      userName: selectedUser?.name ?? "",
      mobile: selectedUser?.mobile ?? "",
    }));
  };

  const handleSubmitBlacklistForm = async () => {
    const userId = Number(formData.userId);

    setErrorMessage("");
    setSuccessMessage("");

    if (!Number.isFinite(userId)) {
      setErrorMessage("Please select a valid user.");
      return;
    }

    if (!formData.reason.trim()) {
      setErrorMessage("Please enter a reason.");
      return;
    }

    setIsSubmittingBlacklist(true);

    try {
      const response = await createAdminBlacklistUser({
        userId,
        reason: formData.reason.trim(),
        riskType: formData.riskType,
      });
      const normalizedResponse = await fetchBlacklistPage({
        currentPage,
        rowsPerPage,
        search: searchQuery,
      });

      setBlacklistUsers(normalizedResponse.rows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalApiPages(normalizedResponse.totalPages);
      setIsModalOpen(false);
      setFormData({
        userId: "",
        userName: "",
        mobile: "",
        blockedBy: "Admin",
        riskType: "LOGIN_RISK",
        reason: "",
      });
      setSuccessMessage(
        response.data?.responseMessage || "User blacklisted successfully.",
      );
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to blacklist user. Please try again."),
      );
    } finally {
      setIsSubmittingBlacklist(false);
    }
  };

  const handleRemoveBlacklistUser = async (item) => {
    const userId = Number(item.userId);

    if (!Number.isFinite(userId)) {
      setErrorMessage("Unable to unblock user because the selected user is missing.");
      return;
    }

    setRemovingUserId(item.userId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await removeAdminBlacklistUser({
        userId,
      });
      const normalizedResponse = await fetchBlacklistPage({
        currentPage,
        rowsPerPage,
        search: searchQuery,
      });
      const refreshedRows = normalizedResponse.rows.filter(
        (blacklistUser) => Number(blacklistUser.userId) !== userId,
      );
      const removedFromRefreshedPage =
        refreshedRows.length !== normalizedResponse.rows.length;

      setBlacklistUsers(refreshedRows);
      setTotalRecords(
        Math.max(
          normalizedResponse.totalRecords - (removedFromRefreshedPage ? 1 : 0),
          0,
        ),
      );
      setTotalApiPages(normalizedResponse.totalPages);
      setSuccessMessage(
        response.data?.responseMessage || "User unblocked successfully.",
      );
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to unblock user. Please try again."),
      );
    } finally {
      setRemovingUserId(null);
    }
  };

  const styles = {
    page: {
      background: "#F6F8FC",
      minHeight: "100vh",
      padding: "25px 50px 25px 25px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E7E7E7",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      paddingBottom: "16px",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
    },

    title: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#333",
    },

    filters: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    dateInput: {
      width: "110px",
      height: "38px",
      border: "1px solid #E5E7EB",
      borderRadius: "6px",
      background: "#FFFFFF",
      color: "#111827",
      colorScheme: "light",
      padding: "0 12px",
      outline: "none",
      fontSize: "13px",
    },

    dateButton: {
      width: "110px",
      height: "38px",
      border: "1px solid #E5E7EB",
      borderRadius: "6px",
      background: "#FFFFFF",
      color: "#808080",
      padding: "0 12px",
      outline: "none",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
    },

    searchBox: {
      width: "200px",
      height: "38px",
      border: "1px solid #E5E7EB",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      background: "#fff",
    },

    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      marginLeft: "8px",
      fontSize: "13px",
      background: "#FFFFFF",
      color: "#111827",
    },

    addButton: {
      height: "38px",
      padding: "0 18px",
      borderRadius: "8px",
      border: "1px solid #FF4D4F",
      background: "#FFFFFF",
      color: "#FF4D4F",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    tableContainer: {
      margin: "0 10px",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflowX: "auto",
      background: "#FFFFFF",
    },

    table: {
      width: "100%",
      minWidth: "1180px",
      borderCollapse: "collapse",
    },

    tableHead: {
      background: "#FAFAFA",
      height: "48px",
      borderBottom: "1px solid #ECECEC",
    },

    th: {
      textAlign: "left",
      padding: "12px 16px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#444",
      whiteSpace: "nowrap",
    },

    tr: {
      height: "48px",
      borderBottom: "1px solid #F2F2F2",
    },

    td: {
      padding: "10px 16px",
      fontSize: "12px",
      color: "#555",
      whiteSpace: "nowrap",
    },

    status: {
      color: "#FF3B30",
      fontWeight: 600,
    },

    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "76px",
      borderRadius: "999px",
      padding: "5px 12px",
      fontSize: "11px",
      fontWeight: 700,
    },

    activeStatusBadge: {
      background: "#E7F8EF",
      color: "#27AE60",
    },

    inactiveStatusBadge: {
      background: "#FEECEC",
      color: "#EB5757",
    },

    createdDate: {
      color: "#2F80ED",
      fontSize: "12px",
      fontWeight: 500,
    },

    createdTime: {
      color: "#27AE60",
      fontSize: "12px",
    },

    removeButton: {
      padding: "7px 14px",
      border: "none",
      borderRadius: "20px",
      background: "#EFEFEF",
      color: "#666",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 500,
    },

    footerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px 0",
    },

    footerText: {
      fontSize: "12px",
      color: "#666",
    },

    pagination: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    alert: {
      margin: "0 20px 16px",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "13px",
      fontWeight: 600,
    },

    errorAlert: {
      background: "#FEF3F2",
      color: "#D92D20",
    },

    successAlert: {
      background: "#ECFDF3",
      color: "#027A48",
    },

    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(20, 20, 20, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },

    modalCard: {
      width: "770px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "14px",
      padding: "36px 40px 40px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      position: "relative",
    },

    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "28px",
    },

    modalTitle: {
      fontSize: "19px",
      fontWeight: 700,
      color: "#1A1A1A",
      marginBottom: "6px",
    },

    modalSubtitle: {
      fontSize: "13px",
      color: "#8C8C8C",
      fontWeight: 400,
    },

    closeButton: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      background: "#111111",
      color: "#FFFFFF",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: "24px",
      rowGap: "22px",
      marginBottom: "22px",
    },

    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    fieldLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#333",
    },

    fieldInput: {
      height: "46px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
      background: "#FFFFFF",
    },

    fieldSelect: {
      height: "46px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
      background: "#FFFFFF",
      appearance: "auto",
    },

    fieldTextarea: {
      minHeight: "110px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "12px 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
      background: "#FFFFFF",
      resize: "vertical",
      fontFamily: "Inter, sans-serif",
    },

    submitButton: {
      height: "48px",
      padding: "0 32px",
      borderRadius: "8px",
      border: "none",
      background: "#6B6B6B",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
    },
  };

  const getRiskStyle = (risk) => {
    switch (risk) {
      case "Low Risk":
        return {
          background: "#DFF6DD",
          color: "#2E7D32",
        };

      case "Medium Risk":
        return {
          background: "#FFE7C7",
          color: "#F57C00",
        };

      default:
        return {
          background: "#FFD9D9",
          color: "#D32F2F",
        };
    }
  };

  const renderDateTime = (dateTime) => {
    if (!dateTime) return null;
    const spaceIndex = dateTime.indexOf(" ");
    if (spaceIndex === -1) {
      return <span style={styles.createdDate}>{dateTime}</span>;
    }
    const datePart = dateTime.slice(0, spaceIndex);
    const timePart = dateTime.slice(spaceIndex + 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", lineHeight: "20px" }}>
        <span style={styles.createdDate}>{datePart}</span>
        <span style={styles.createdTime}>{timePart}</span>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>

          <div style={styles.title}>
            All Blacklist Employee
          </div>

          <div style={styles.filters}>
            <div style={{ position: "relative" }}>
              <select
                onChange={(event) => handleYearChange(event.target.value)}
                style={{
                  ...styles.dateButton,
                  appearance: "none",
                  color: "#202224",
                  paddingRight: "32px",
                }}
                value={year}
              >
                <option value="">Year</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <FiChevronDown
                size={15}
                style={{
                  color: "#808080",
                  pointerEvents: "none",
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>

            <input
              ref={fromInputRef}
              type="date"
              value={fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={(event) => openDashboardDatePicker(fromInputRef.current, event.currentTarget)}
              style={styles.dateButton}
            >
              <span>{fromDate || "From"}</span>
              <CalendarDays size={15} />
            </button>

            <input
              ref={toInputRef}
              type="date"
              value={toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={(event) => openDashboardDatePicker(toInputRef.current, event.currentTarget)}
              style={styles.dateButton}
            >
              <span>{toDate || "To"}</span>
              <CalendarDays size={15} />
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
              <FiPlus />
              Add Blacklist
            </button>

          </div>

        </div>

        {errorMessage && (
          <div style={{ ...styles.alert, ...styles.errorAlert }}>
            {errorMessage}
          </div>
        )}

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead style={styles.tableHead}>
              <tr>

                <th style={styles.th}>Sr No</th>
                <th style={styles.th}>Employee Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Reason</th>
                <th style={styles.th}>Risk Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Updated At</th>
                <th style={styles.th}>Action</th>

              </tr>
            </thead>

            <tbody>

              {isLoading && (
                <tr style={styles.tr}>
                  <td colSpan={11} style={{ ...styles.td, textAlign: "center" }}>
                    Loading blacklist users...
                  </td>
                </tr>
              )}

              {!isLoading && visibleData.length === 0 && (
                <tr style={styles.tr}>
                  <td colSpan={11} style={{ ...styles.td, textAlign: "center" }}>
                    No blacklist users found.
                  </td>
                </tr>
              )}

              {!isLoading && visibleData.map((item, index) => (

                <tr key={item.id} style={styles.tr}>

                  <td style={styles.td}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  <td style={styles.td}>{item.employeeName}</td>

                  <td style={styles.td}>{item.email}</td>

                  <td style={styles.td}>{item.mobile}</td>

                  <td style={styles.td}>
                    {item.reason}
                  </td>

                  <td style={styles.td}>

                    <span
                      style={{
                        ...getRiskStyle(item.riskType),
                        padding: "4px 10px",
                        borderRadius: "14px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {item.riskType}
                    </span>

                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(isActiveStatus(item.status)
                          ? styles.activeStatusBadge
                          : styles.inactiveStatusBadge),
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {item.createdBy}
                  </td>

                  <td style={styles.td}>
                    {renderDateTime(item.createdAt)}
                  </td>

                  <td style={styles.td}>
                    {renderDateTime(item.updatedAt)}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.removeButton,
                        ...(removingUserId === item.userId
                          ? { cursor: "not-allowed", opacity: 0.7 }
                          : {}),
                      }}
                      disabled={removingUserId === item.userId}
                      onClick={() => handleRemoveBlacklistUser(item)}
                    >
                      {removingUserId === item.userId ? "Unblocking..." : "Unblock"}
                    </button>
                  </td>

                </tr>
                              ))}

            </tbody>

          </table>

        </div>

        {/* Footer + Pagination */}

        <div style={styles.footerRow}>

          <div style={styles.footerText}>
            Showing{" "}
            <strong>
              {showingFrom}
            </strong>{" "}
            -
            <strong>
              {" "}{showingTo}
            </strong>{" "}
            of <strong>{effectiveTotalRecords}</strong> transactions
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() =>
                currentPage > 1 &&
                setCurrentPage(currentPage - 1)
              }
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                      page === currentPage
                        ? "bg-[#F3F4F6] text-[#111827]"
                        : "text-[#6B7280] hover:bg-[#F8F8F8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

            <button
              onClick={() =>
                currentPage < totalPages &&
                setCurrentPage(currentPage + 1)
              }
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <FiChevronRight />
            </button>
          </div>

        </div>

      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>Add User Blacklist</div>
                <div style={styles.modalSubtitle}>
                  Fill all fields to blacklist user
                </div>
              </div>
              <button style={styles.closeButton} onClick={closeModal} type="button">
                <FiX size={16} />
              </button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>User</label>
                <select
                  disabled={isLoadingUsers}
                  onChange={handleUserSelect}
                  style={styles.fieldSelect}
                  value={formData.userId}
                >
                  <option value="">
                    {isLoadingUsers ? "Loading users..." : "Select User"}
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.id}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>User Name</label>
                <input
                  placeholder="Enter Name"
                  readOnly
                  style={styles.fieldInput}
                  value={formData.userName}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Mobile No</label>
                <input
                  placeholder="Enter User Mobile no"
                  readOnly
                  style={styles.fieldInput}
                  value={formData.mobile}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Blocked By</label>
                <select
                  onChange={handleFormChange("blockedBy")}
                  style={styles.fieldSelect}
                  value={formData.blockedBy}
                >
                  <option value="Admin">Admin</option>
                  <option value="System">System</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Risk Type</label>
                <select
                  onChange={handleFormChange("riskType")}
                  style={styles.fieldSelect}
                  value={formData.riskType}
                >
                  <option value="LOGIN_RISK">LOGIN_RISK</option>
                  <option value="TRANSACTION_RISK">TRANSACTION_RISK</option>
                  <option value="ACCOUNT_RISK">ACCOUNT_RISK</option>
                  <option value="DEVICE_RISK">DEVICE_RISK</option>
                </select>
              </div>
            </div>

            <div style={{ ...styles.fieldGroup, marginBottom: "28px" }}>
              <label style={styles.fieldLabel}>Reason</label>
              <textarea
                onChange={handleFormChange("reason")}
                placeholder="Write a Reason"
                style={styles.fieldTextarea}
                value={formData.reason}
              />
            </div>

            <button
              onClick={handleSubmitBlacklistForm}
              disabled={isSubmittingBlacklist}
              style={{
                ...styles.submitButton,
                cursor: isSubmittingBlacklist ? "not-allowed" : "pointer",
                opacity: isSubmittingBlacklist ? 0.7 : 1,
              }}
              type="button"
            >
              {isSubmittingBlacklist ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <DashboardSuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
};

export default UserBlacklistPage;

async function fetchBlacklistPage({
  currentPage,
  rowsPerPage,
  search = "",
}) {
  const response = await getAdminBlacklistUsers({
    page: currentPage - 1,
    size: rowsPerPage,
    search,
  });

  return normalizeBlacklistResponse(response.data, rowsPerPage);
}

function normalizeBlacklistResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload)
    .map(normalizeBlacklistRow)
    .filter((row) => row.hasIdentity && row.isBlocked);
  const totalRecords = rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeUsersResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  return findFirstArray(payload)
    .map(normalizeUserOption)
    .filter((user) => user.id !== "");
}

function normalizeUserOption(row) {
  const firstName = row.firstName ?? row.first_name ?? "";
  const lastName = row.lastName ?? row.last_name ?? "";
  const name =
    row.name ??
    row.fullName ??
    row.employeeName ??
    [firstName, lastName].filter(Boolean).join(" ");

  return {
    id: row.id ?? row.userId ?? row.employeeId ?? "",
    name: name || "-",
    mobile: row.phoneNumber ?? row.mobile ?? row.phone ?? "-",
  };
}

function normalizeBlacklistRow(row, index) {
  const firstName = row.firstName ?? row.first_name ?? row.user?.firstName ?? "";
  const lastName = row.lastName ?? row.last_name ?? row.user?.lastName ?? "";
  const employeeName =
    row.employeeName ??
    row.name ??
    row.fullName ??
    row.user?.name ??
    [firstName, lastName].filter(Boolean).join(" ");

  return {
    id: row.id ?? row.blacklistId ?? index + 1,
    userId: row.userId ?? row.user?.id ?? row.employeeId ?? "-",
    hasIdentity: hasBlacklistIdentity(row),
    employeeName: row.employeeName ?? employeeName ?? "-",
    email: row.email ?? "-",
    mobile: row.mobile ?? "-",
    status: normalizeBlacklistStatus(
      row.status,
    ),
    isBlocked: isBlacklistStatusBlocked(
      row.status,
    ),
    reason: row.reason ?? "-",
    riskType: row.riskType ?? "-",
    createdBy: row.createdBy ?? "-",
    createdAt: formatCreatedAt(
      row.createdDate,
    ),
    updatedAt: formatCreatedAt(
      row.updatedAt,
    ),
  };
}

function normalizeBlacklistStatus(status) {
  if (typeof status === "boolean") return status ? "Active" : "Inactive";
  if (status === null || status === undefined || status === "") return "Inactive";

  const normalizedStatus = String(status).trim().toLowerCase();

  if (["true", "1", "active", "success", "enabled"].includes(normalizedStatus)) {
    return "Active";
  }

  if (["false", "0", "inactive", "block", "blocked", "disabled"].includes(normalizedStatus)) {
    return "Inactive";
  }

  return String(status);
}

function isActiveStatus(status) {
  return String(status).trim().toLowerCase() === "active";
}

function isBlacklistStatusBlocked(status) {
  if (typeof status === "boolean") return status;
  if (status === null || status === undefined || status === "") return true;

  const normalizedStatus = String(status).trim().toLowerCase();

  return !["active", "unblocked", "unblock", "false", "0", "removed"].includes(
    normalizedStatus,
  );
}

function formatCreatedAt(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").split(".")[0];
}

function isDateWithinRange(value, fromDate, toDate, year) {
  if (!fromDate && !toDate && !year) return true;

  const normalizedDate = normalizeDateValue(value);
  if (!normalizedDate) return false;

  if (year && normalizedDate.slice(0, 4) !== year) return false;
  if (fromDate && normalizedDate < fromDate) return false;
  if (toDate && normalizedDate > toDate) return false;

  return true;
}

function normalizeDateValue(value) {
  if (!value || value === "-") return "";

  const stringValue = String(value).trim();
  const isoMatch = stringValue.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  const displayMatch = stringValue.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (displayMatch) {
    const [, day, month, year] = displayMatch;
    return `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(stringValue);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  const preferredKeys = [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "blacklistUsers",
    "blacklistedUsers",
    "users",
    "data",
  ];

  for (const key of preferredKeys) {
    const childArray = findFirstArray(value[key], visited);

    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);

    if (childArray.length > 0) return childArray;
  }

  if (hasBlacklistIdentity(value)) return [value];

  return [];
}

function hasBlacklistIdentity(row) {
  if (!row || typeof row !== "object") return false;

  return [
    row.userId,
    row.user?.id,
    row.employeeId,
    row.employeeName,
    row.name,
    row.fullName,
    row.email,
    row.userEmail,
    row.user?.email,
    row.mobile,
    row.phoneNumber,
    row.reason,
    row.riskType,
    row.blacklistId,
  ].some((value) => value !== null && value !== undefined && value !== "");
}

function findFirstNumber(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return null;

  visited.add(value);

  for (const key of keys) {
    const candidate = Number(value[key]);

    if (Number.isFinite(candidate)) return candidate;
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);

    if (candidate !== null) return candidate;
  }

  return null;
}
