import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { CalendarDays, RotateCcw } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createAdminRole,
  getAdminRoles,
  updateAdminRole,
  updateAdminRoleStatus,
} from "../services/adminEmployeeService";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const INITIAL_ROLE_FORM = {
  roleName: "",
  status: true,
};

const INTERNAL_ROLE_KEYS = new Set(["id", "roleId", "statusBoolean"]);
const ROLE_COLUMN_ORDER = [
  "roleName",
  "name",
  "role",
  "slug",
  "code",
  "status",
  "createdBy",
  "createdDate",
  "createdAt",
  "updatedAt",
];

const ManageRolePage = ({ searchQuery = "" }) => {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [roles, setRoles] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState(INITIAL_ROLE_FORM);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const rowsPerPage = 10;
  const isLocalFilterActive = Boolean(searchQuery.trim() || year || fromDate || toDate);

  useEffect(() => {
    let isActive = true;

    async function loadRoles() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getAdminRoles({
          page: isLocalFilterActive ? 0 : currentPage - 1,
          size: rowsPerPage,
        });
        const normalizedResponse = normalizeRoleResponse(response.data, rowsPerPage);
        const normalizedRows = [...normalizedResponse.rows];

        if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
          const remainingResponses = await Promise.all(
            Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
              getAdminRoles({
                page: index + 1,
                size: rowsPerPage,
              }),
            ),
          );

          remainingResponses.forEach((pageResponse) => {
            normalizedRows.push(
              ...normalizeRoleResponse(pageResponse.data, rowsPerPage).rows,
            );
          });
        }

        if (!isActive) return;

        setRoles(normalizedRows);
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalApiPages(normalizedResponse.totalPages);
      } catch (error) {
        if (!isActive) return;

        setRoles([]);
        setTotalRecords(0);
        setTotalApiPages(1);
        setErrorMessage(
          getAuthErrorMessage(error, "Unable to load roles. Please try again."),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadRoles();

    return () => {
      isActive = false;
    };
  }, [currentPage, isLocalFilterActive]);

  const filteredRoles = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch = Object.entries(role)
        .filter(([key]) => !INTERNAL_ROLE_KEYS.has(key))
        .map(([, value]) => formatRoleValue(value))
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesCreatedDate = isDateWithinRange(
        role.createdDate ?? role.createdAt,
        fromDate,
        toDate,
        year,
      );

      return matchesSearch && matchesCreatedDate;
    });
  }, [fromDate, roles, searchQuery, toDate, year]);

  const effectiveTotalRecords = isLocalFilterActive ? filteredRoles.length : totalRecords;
  const totalPages = isLocalFilterActive
    ? Math.max(Math.ceil(effectiveTotalRecords / rowsPerPage), 1)
    : Math.max(totalApiPages, 1);

  const currentRoles = isLocalFilterActive
    ? filteredRoles.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredRoles;
  const roleColumns = useMemo(() => buildRoleColumns(currentRoles), [currentRoles]);
  const tableColSpan = Math.max(roleColumns.length + 2, 4);

  const refreshRoles = async () => {
    const response = await getAdminRoles({
      page: currentPage - 1,
      size: rowsPerPage,
    });
    const normalizedResponse = normalizeRoleResponse(response.data, rowsPerPage);

    setRoles(normalizedResponse.rows);
    setTotalRecords(normalizedResponse.totalRecords);
    setTotalApiPages(normalizedResponse.totalPages);
  };

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

  const openAddRoleModal = () => {
    setEditingRole(null);
    setRoleForm(INITIAL_ROLE_FORM);
    setErrorMessage("");
    setSuccessMessage("");
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setRoleForm({
      roleName: role.roleName === "-" ? "" : role.roleName,
      status: role.statusBoolean,
    });
    setErrorMessage("");
    setSuccessMessage("");
    setOpenMenu(null);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleForm(INITIAL_ROLE_FORM);
  };

  const handleRoleFormChange = (event) => {
    const { name, value } = event.target;

    setRoleForm((currentForm) => ({
      ...currentForm,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  const handleSaveRole = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      roleName: roleForm.roleName.trim(),
      status: Boolean(roleForm.status),
    };

    if (!payload.roleName) {
      setErrorMessage("Role name is required.");
      return;
    }

    setIsSavingRole(true);

    try {
      const response = editingRole
        ? await updateAdminRole(editingRole.id, payload)
        : await createAdminRole(payload);

      await refreshRoles();
      closeRoleModal();
      const nextSuccessMessage =
        response.data?.responseMessage ||
        (editingRole ? "Edit Successfully" : "Role created successfully.");

      setSuccessMessage(nextSuccessMessage);
      setSuccessModalMessage(nextSuccessMessage);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          editingRole
            ? "Unable to update role. Please try again."
            : "Unable to create role. Please try again.",
        ),
      );
    } finally {
      setIsSavingRole(false);
    }
  };

  const styles = {
    page: {
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      background: "#F4F5F9",
      padding: "18px 46px 18px 22px",
      boxSizing: "border-box",
      fontFamily: "Inter, sans-serif",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #ECECEC",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
      paddingBottom: "16px",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 20px 12px",
    },

    title: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#333",
    },

    filterSection: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    dateInput: {
      width: "115px",
      height: "38px",
      border: "1px solid #E5E7EB",
      borderRadius: "6px",
      padding: "0 12px",
      fontSize: "13px",
      outline: "none",
      background: "#FFFFFF",
      color: "#111827",
      colorScheme: "light",
    },

    dateButton: {
      width: "115px",
      height: "38px",
      border: "1px solid #E5E7EB",
      borderRadius: "6px",
      padding: "0 12px",
      fontSize: "13px",
      outline: "none",
      background: "#FFFFFF",
      color: "#808080",
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

    addRoleButton: {
      height: "38px",
      padding: "0 16px",
      borderRadius: "8px",
      border: "1px solid #FF4D4F",
      background: "#FFFFFF",
      color: "#FF4D4F",
      fontWeight: 600,
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
    },

    tableContainer: {
      margin: "0 10px",
      border: "1px solid #E8E8E8",
      borderRadius: "10px",
      overflowX: "auto",
      overflowY: "visible",
      background: "#fff",
    },

    table: {
      width: "100%",
      minWidth: "1100px",
      borderCollapse: "collapse",
    },

    tableHead: {
      height: "48px",
      background: "#FAFAFA",
      borderBottom: "1px solid #ECECEC",
    },

    th: {
      textAlign: "left",
      padding: "12px 18px",
      fontWeight: 600,
      fontSize: "12px",
      color: "#444",
      whiteSpace: "nowrap",
    },

    tr: {
      height: "44px",
      borderBottom: "1px solid #F0F0F0",
    },

    td: {
      padding: "10px 18px",
      fontSize: "12px",
      color: "#555",
      whiteSpace: "nowrap",
    },

    menu: {
      position: "absolute",
      right: "0px",
      marginTop: "5px",
      width: "130px",
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      boxShadow: "0 8px 18px rgba(0,0,0,.08)",
      zIndex: 999,
      overflow: "hidden",
      padding: "6px 0",
    },

    menuItem: {
      padding: "6px 15px",
      cursor: "pointer",
      fontSize: "13px",
      color: "#3A3A3A",
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
      inset: 0,
      background: "rgba(20, 20, 20, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },

    modalCard: {
      width: "520px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "14px",
      padding: "30px 34px 34px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,.25)",
    },

    modalHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "24px",
    },

    modalTitle: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#1A1A1A",
      marginBottom: "6px",
    },

    modalSubtitle: {
      fontSize: "13px",
      color: "#8C8C8C",
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
    },

    modalField: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "20px",
    },

    modalLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#333",
    },

    modalInput: {
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

    modalActions: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      justifyContent: "flex-end",
      marginTop: "8px",
    },

    cancelButton: {
      height: "42px",
      padding: "0 20px",
      borderRadius: "8px",
      border: "1px solid #D1D5DB",
      background: "#FFFFFF",
      color: "#4B5563",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },

    saveButton: {
      height: "42px",
      padding: "0 24px",
      borderRadius: "8px",
      border: "none",
      background: "#555555",
      color: "#FFFFFF",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },

    disabledButton: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>

          <div style={styles.title}>
            Manage Your Role create , delete, Edit
          </div>

          <div style={styles.filterSection}>
            <div style={{ position: "relative" }}>
              <select
                onChange={(event) => handleYearChange(event.target.value)}
                style={{ ...styles.dateButton, appearance: "none", color: "#202224" }}
                value={year}
              >
                <option value="">Year</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
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

            <button style={styles.addRoleButton} onClick={openAddRoleModal}>
              <FiPlus size={16} />
              Add Role
            </button>

          </div>

        </div>

        {successMessage && (
          <div style={{ ...styles.alert, ...styles.successAlert }}>
            {successMessage}
          </div>
        )}

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

                {roleColumns.map((column) => (
                  <th key={column.key} style={styles.th}>
                    {column.label}
                  </th>
                ))}

                <th style={styles.th}>Action</th>

              </tr>

            </thead>

            <tbody>
              {isLoading && (
                <tr style={styles.tr}>
                  <td colSpan={tableColSpan} style={{ ...styles.td, textAlign: "center" }}>
                    Loading roles...
                  </td>
                </tr>
              )}

              {!isLoading && errorMessage && (
                <tr style={styles.tr}>
                  <td
                    colSpan={tableColSpan}
                    style={{ ...styles.td, color: "#DC2626", textAlign: "center" }}
                  >
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && currentRoles.length === 0 && (
                <tr style={styles.tr}>
                  <td colSpan={tableColSpan} style={{ ...styles.td, textAlign: "center" }}>
                    No roles found.
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && currentRoles.map((role, index) => (

                <tr key={role.id} style={styles.tr}>
                  <td style={styles.td}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  {roleColumns.map((column) => (
                    <td key={`${role.id}-${column.key}`} style={styles.td}>
                    {renderRoleCell(role, column.key)}
                    </td>
                  ))}

                  <td
                    style={{
                      ...styles.td,
                      position: "relative",
                    }}
                  >

                    <DashboardEditButton
                      onClick={() => {
                        openEditRoleModal(role);
                      }}
                    >
                      Edit
                    </DashboardEditButton>

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
              {currentRoles.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </strong>{" "}
            -
            <strong>
              {" "}
              {Math.min(
                currentPage * rowsPerPage,
                effectiveTotalRecords
              )}
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

      {isRoleModalOpen && (
        <div style={styles.modalOverlay} onClick={closeRoleModal}>
          <form
            style={styles.modalCard}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSaveRole}
          >
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>
                  {editingRole ? "Edit Role" : "Add Role"}
                </div>
                <div style={styles.modalSubtitle}>
                  {editingRole
                    ? "Update role details"
                    : "Create a new role for users"}
                </div>
              </div>
              <button style={styles.closeButton} onClick={closeRoleModal} type="button">
                <FiX size={16} />
              </button>
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Role Name</label>
              <input
                name="roleName"
                onChange={handleRoleFormChange}
                placeholder="Enter Role Name"
                style={styles.modalInput}
                value={roleForm.roleName}
              />
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Status</label>
              <select
                name="status"
                onChange={handleRoleFormChange}
                style={styles.modalInput}
                value={String(roleForm.status)}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={closeRoleModal}
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={isSavingRole}
                style={{
                  ...styles.saveButton,
                  ...(isSavingRole ? styles.disabledButton : {}),
                }}
                type="submit"
              >
                {isSavingRole ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {successModalMessage && (
        <div
          style={{ ...styles.modalOverlay, zIndex: 2000 }}
          onClick={() => setSuccessModalMessage("")}
        >
          <div
            style={{ ...styles.modalCard, textAlign: "center" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-[#111827]">
              <svg
                fill="none"
                height="34"
                viewBox="0 0 36 36"
                width="34"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 18.5L15 25L28 11"
                  stroke="#EB5757"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <h3 className="text-[20px] font-bold uppercase text-[#202224]">
              {successModalMessage.toUpperCase()}
            </h3>

            <button
              className="mt-8 h-[42px] rounded-lg bg-[#4B4B4B] px-8 text-[13px] font-semibold text-white"
              onClick={() => setSuccessModalMessage("")}
              type="button"
            >
              Back to Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRolePage;

function normalizeRoleResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeRoleRow).filter(Boolean);
  const totalRecords =
    findFirstNumber(responseData, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rows.length;
  const totalPages =
    findFirstNumber(responseData, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeRoleRow(role, index) {
  if (typeof role === "string") {
    return {
      id: index + 1,
      roleName: role,
      slug: role,
      status: true,
      statusBoolean: true,
    };
  }

  if (!role || typeof role !== "object") return null;

  const roleName =
    role.roleName ??
    role.name ??
    role.role ??
    role.title ??
    role.slug ??
    "-";

  return {
    ...role,
    id: role.id ?? role.roleId ?? index + 1,
    roleName,
    slug: role.slug ?? role.code ?? role.roleSlug ?? roleName,
    status: role.status ?? true,
    statusBoolean: normalizeRoleStatus(role.status),
  };
}

function buildRoleColumns(rows) {
  const keys = new Set();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!INTERNAL_ROLE_KEYS.has(key)) keys.add(key);
    });
  });

  return Array.from(keys)
    .sort((leftKey, rightKey) => {
      const leftIndex = ROLE_COLUMN_ORDER.indexOf(leftKey);
      const rightIndex = ROLE_COLUMN_ORDER.indexOf(rightKey);
      const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

      if (leftRank !== rightRank) return leftRank - rightRank;

      return leftKey.localeCompare(rightKey);
    })
    .map((key) => ({
      key,
      label: formatColumnLabel(key),
    }));
}

function formatColumnLabel(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRoleValue(value) {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "boolean") return value ? "Active" : "Inactive";

  if (Array.isArray(value)) {
    return value.length ? value.map(formatRoleValue).join(", ") : "-";
  }

  if (typeof value === "object") {
    const values = Object.values(value)
      .map(formatRoleValue)
      .filter((item) => item !== "-");

    return values.length ? values.join(", ") : "-";
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}T/.test(stringValue)) {
    return stringValue.replace("T", " ").split(".")[0];
  }

  return stringValue;
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

  const parsedDate = new Date(stringValue);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
}

function renderRoleCell(role, key) {
  const value = role[key];

  if (key === "status") {
    return (
      <DashboardStatusToggle
        onToggle={(nextStatus) => updateAdminRoleStatus(role.id, nextStatus)}
        status={value}
      />
    );
  }

  if (isRoleDateTimeKey(key)) {
    return <RoleDateTime value={value} />;
  }

  return formatRoleValue(value);
}

function RoleDateTime({ value }) {
  const formattedValue = formatRoleValue(value);
  const [date, time = "-"] = formattedValue.split(" ");

  return (
    <div className="flex flex-col text-[12px] leading-5">
      <span className="font-medium text-[#2F80ED]">{date}</span>
      <span className="text-[#27AE60]">{time}</span>
    </div>
  );
}

function isRoleDateTimeKey(key) {
  return ["createdDate", "createdAt", "updatedDate", "updatedAt"].includes(key);
}

function normalizeRoleStatus(status) {
  if (typeof status === "boolean") return status;
  if (status === null || status === undefined || status === "") return true;

  return !["false", "0", "inactive", "disabled"].includes(
    String(status).trim().toLowerCase(),
  );
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
    "roles",
    "roleList",
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

  return hasRoleIdentity(value) ? [value] : [];
}

function hasRoleIdentity(role) {
  return Boolean(
    role?.id ||
      role?.roleId ||
      role?.roleName ||
      role?.name ||
      role?.role ||
      role?.slug,
  );
}

function findFirstNumber(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return undefined;

  visited.add(value);

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "number") return candidate;

    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      !Number.isNaN(Number(candidate))
    ) {
      return Number(candidate);
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);

    if (candidate !== undefined) return candidate;
  }

  return undefined;
}
