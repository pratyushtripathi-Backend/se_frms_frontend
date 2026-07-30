import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  getAdminEmployees,
  updateAdminEmployee,
  updateAdminEmployeeStatus,
} from "../services/adminEmployeeService";
import DashboardSuccessModal from "./DashboardSuccessModal";
import DashboardStatusToggle from "./DashboardStatusToggle";

const AllEmployeePage = ({ searchQuery = "" }) => {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
  });
  const [savingEmployeeId, setSavingEmployeeId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadEmployees() {
      setIsLoading(true);
      setError("");

      try {
        const normalizedResponse = await fetchEmployeePage(
          currentPage,
          rowsPerPage,
          searchQuery,
        );

        if (!isActive) return;

        setEmployees(normalizedResponse.rows);
        setTotalEmployees(normalizedResponse.totalRecords);
        setTotalApiPages(normalizedResponse.totalPages);
      } catch (employeeError) {
        if (!isActive) return;

        setError(
          getAuthErrorMessage(
            employeeError,
            "Unable to load employees. Please try again.",
          ),
        );
        setEmployees([]);
        setTotalEmployees(0);
        setTotalApiPages(1);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadEmployees();

    return () => {
      isActive = false;
    };
  }, [currentPage, searchQuery]);

  const currentEmployees = useMemo(() => {
    return employees.filter((employee) =>
      isDateWithinRange(employee.createdDate, fromDate, toDate, year),
    );
  }, [employees, fromDate, toDate, year]);
  const totalPages = totalApiPages;
  const showingFrom = totalEmployees === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, totalEmployees);

  const handleEditEmployee = (employee) => {
    setEditingEmployeeId(employee.id);
    setEditForm({
      name: employee.name === "-" ? "" : employee.name,
      email: employee.email === "-" ? "" : employee.email,
      mobile: employee.mobile === "-" ? "" : employee.mobile,
      designation: employee.designation === "-" ? "" : employee.designation,
    });
    setOpenMenu(null);
    setSuccessMessage("");
    setError("");
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setEditForm({
      name: "",
      email: "",
      mobile: "",
      designation: "",
    });
    setError("");
  };

  const handleSaveEmployee = async () => {
    const employee = employees.find((item) => item.id === editingEmployeeId);

    if (!employee) {
      setError("Unable to update employee because the selected row was not found.");
      return;
    }

    const employeeId = employee.apiEmployeeId ?? employee.employeeId ?? employee.id;
    const [firstName, ...lastNameParts] = editForm.name.trim().split(/\s+/);
    const payload = {
      name: editForm.name.trim(),
      firstName: firstName ?? "",
      lastName: lastNameParts.join(" "),
      email: editForm.email.trim(),
      mobile: editForm.mobile.trim(),
      phoneNumber: editForm.mobile.trim(),
      designation: editForm.designation.trim(),
      role: editForm.designation.trim(),
    };

    if (!payload.name || !payload.email || !payload.phoneNumber || !payload.designation) {
      setError("Name, email, mobile, and designation are required.");
      return;
    }

    setSavingEmployeeId(employee.id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await updateAdminEmployee(employeeId, payload);
      const normalizedResponse = await fetchEmployeePage(
        currentPage,
        rowsPerPage,
        searchQuery,
      );

      setEmployees(normalizedResponse.rows);
      setTotalEmployees(normalizedResponse.totalRecords);
      setTotalApiPages(normalizedResponse.totalPages);
      setEditingEmployeeId(null);
      setEditForm({
        name: "",
        email: "",
        mobile: "",
        designation: "",
      });
      const nextMessage =
        response.data?.responseMessage || "Employee updated successfully.";
      setSuccessMessage(nextMessage);
      setSuccessModalMessage(nextMessage);
    } catch (saveError) {
      setError(
        getAuthErrorMessage(saveError, "Unable to update employee. Please try again."),
      );
    } finally {
      setSavingEmployeeId(null);
    }
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 24px 20px 24px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      position: "relative",
      overflow: "visible",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      padding: "20px 24px 24px 24px",
      boxSizing: "border-box",
    },

    headerRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "16px",
    },

    title: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#202224",
    },

    subTitle: {
      fontSize: "13px",
      color: "#7B7B7B",
      marginTop: "6px",
    },

    searchBox: {
      width: "220px",
      height: "38px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      background: "#fff",
      gap: "8px",
    },

    searchInput: {
      width: "100%",
      border: "none",
      outline: "none",
      background: "#FFFFFF",
      color: "#202224",
      WebkitTextFillColor: "#202224",
      colorScheme: "light",
      fontSize: "13px",
    },

    tableContainer: {
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflowX: "auto",
      overflowY: "visible",
      background: "#fff",
    },

    table: {
      width: "100%",
      minWidth: "1420px",
      borderCollapse: "collapse",
    },

    header: {
      height: "42px",
      background: "#F9FAFB",
      borderBottom: "1px solid #E5E7EB",
    },

    th: {
      textAlign: "left",
      padding: "10px 18px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#555",
      whiteSpace: "nowrap",
    },

    tr: {
      height: "40px",
      borderBottom: "1px solid #F1F1F1",
      position: "relative",
    },

    td: {
      padding: "10px 18px",
      fontSize: "13px",
      color: "#555",
      whiteSpace: "nowrap",
    },

    badge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      background: "#EEF8FF",
      color: "#0A84FF",
      display: "inline-block",
    },

    actionBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #E5E7EB",
      background: "#EDEDED",
      color: "#4B4B4B",
      fontSize: "12px",
      fontWeight: 500,
      cursor: "pointer",
    },

    menu: {
      position: "absolute",
      right: "0px",
      marginTop: "5px",
      width: "130px",
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      boxShadow: "0 8px 20px rgba(0,0,0,.08)",
      zIndex: 9999,
      overflow: "hidden",
      padding: "6px 0",
    },

    menuItem: {
      padding: "6px 15px",
      cursor: "pointer",
      fontSize: "13px",
      color: "#3A3A3A",
    },

    editInput: {
      width: "160px",
      height: "34px",
      border: "1px solid #C9CDD4",
      borderRadius: "6px",
      padding: "0 10px",
      fontSize: "13px",
      color: "#202224",
      outline: "none",
      background: "#fff",
    },

    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    saveButton: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      background: "#0A84FF",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600,
      cursor: "pointer",
    },

    cancelButton: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #E5E7EB",
      background: "#fff",
      color: "#4B4B4B",
      fontSize: "12px",
      fontWeight: 600,
      cursor: "pointer",
    },

    footerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "16px",
    },

    footerText: {
      fontSize: "13px",
      color: "#7B7B7B",
    },

    pagination: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(17, 24, 39, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "24px",
    },

    modalCard: {
      width: "620px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "14px",
      boxShadow: "0 20px 60px rgba(0,0,0,.22)",
      padding: "32px 36px 34px",
      boxSizing: "border-box",
      position: "relative",
    },

    modalHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "26px",
    },

    modalTitle: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "6px",
    },

    modalSubtitle: {
      fontSize: "13px",
      color: "#7A7A7A",
    },

    modalCloseButton: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "none",
      background: "#111827",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "18px",
      lineHeight: 1,
    },

    modalGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "18px",
    },

    modalField: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    modalLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#333333",
    },

    modalInput: {
      height: "46px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      color: "#202224",
      background: "#FFFFFF",
      outline: "none",
      boxSizing: "border-box",
      colorScheme: "light",
    },

    modalActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "28px",
    },

    dateButton: {
      width: "125px",
      height: "40px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 12px",
      fontSize: "12px",
      background: "#FFFFFF",
      color: "#808080",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
    },

    yearSelect: {
      width: "105px",
      height: "40px",
      appearance: "none",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 32px 0 12px",
      fontSize: "12px",
      background: "#FFFFFF",
      color: "#202224",
      outline: "none",
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          .all-employee-search-field {
            background-color: #ffffff !important;
            color: #FFFF !important;
            -webkit-text-fill-color: #202224 !important;
            color-scheme: light;
          }

          .all-employee-search-field::placeholder {
            color: #9CA3AF !important;
            -webkit-text-fill-color: #9CA3AF !important;
          }

          .all-employee-search-field:-webkit-autofill,
          .all-employee-search-field:-webkit-autofill:hover,
          .all-employee-search-field:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
            box-shadow: 0 0 0 1000px #ffffff inset !important;
            -webkit-text-fill-color: #202224 !important;
          }
        `}
      </style>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.title}>All Employee Details Here</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <select
                onChange={(event) => setYear(event.target.value)}
                style={styles.yearSelect}
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
              onChange={(event) => setFromDate(event.target.value)}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fromInputRef.current?.showPicker ? fromInputRef.current.showPicker() : fromInputRef.current?.click()}
              style={styles.dateButton}
              type="button"
            >
              <span>{fromDate || "From"}</span>
              <CalendarDays size={15} />
            </button>

            <input
              ref={toInputRef}
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              style={{ display: "none" }}
            />
            <button
              onClick={() => toInputRef.current?.showPicker ? toInputRef.current.showPicker() : toInputRef.current?.click()}
              style={styles.dateButton}
              type="button"
            >
              <span>{toDate || "To"}</span>
              <CalendarDays size={15} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#E0453C]">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-[13px] font-semibold text-[#027A48]">
            {successMessage}
          </div>
        )}

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.header}>
              <tr>
                <th style={styles.th}>Sr No</th>
                <th style={styles.th}>Employee Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Created Date</th>
                <th style={styles.th}>Updated At</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr style={styles.tr}>
                  <td colSpan={10} style={{ ...styles.td, textAlign: "center" }}>
                    Loading employees...
                  </td>
                </tr>
              )}

              {!isLoading && currentEmployees.length === 0 && (
                <tr style={styles.tr}>
                  <td colSpan={10} style={{ ...styles.td, textAlign: "center" }}>
                    No employees found.
                  </td>
                </tr>
              )}

              {!isLoading && currentEmployees.map((employee, index) => (
                <tr
                  key={employee.id}
                  style={{
                    ...styles.tr,
                    zIndex: openMenu === employee.id ? 50 : 1,
                  }}
                >
                  <td style={styles.td}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  <td style={styles.td}>
                    {employee.name}
                  </td>

                  <td style={styles.td}>
                    {employee.email}
                  </td>

                  <td style={styles.td}>
                    {employee.mobile}
                  </td>

                  <td style={styles.td}>
                    {employee.designation}
                  </td>

                  <td style={styles.td}>
                    <DashboardStatusToggle
                      onToggle={(nextStatus) =>
                        updateAdminEmployeeStatus(
                          employee.apiEmployeeId ?? employee.employeeId ?? employee.id,
                          nextStatus,
                        )
                      }
                      status={employee.status}
                    />
                  </td>

                  <td style={styles.td}>{employee.createdBy}</td>

                  <td style={styles.td}>
                    <EmployeeDateTime
                      date={employee.createdDate}
                      time={employee.createdTime}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <EmployeeDateTime
                      date={employee.updatedDate}
                      time={employee.updatedTime}
                    />
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      position: "relative",
                    }}
                  >
                    <button
                      style={styles.actionBtn}
                      onClick={() => handleEditEmployee(employee)}
                      type="button"
                    >
                      Edit
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
            <strong> {showingTo}</strong>{" "}
            of <strong>{totalEmployees}</strong> Employees
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() =>
                currentPage > 1 && setCurrentPage(currentPage - 1)
              }
              style={{
                width: "38px",
                height: "38px",
                border: "1px solid #E5E7EB",
                background: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FiChevronLeft />
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => page <= totalPages && setCurrentPage(page)}
                disabled={page > totalPages}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                  page === currentPage
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : page > totalPages
                    ? "cursor-not-allowed text-[#D1D5DB]"
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
                width: "38px",
                height: "38px",
                border: "1px solid #E5E7EB",
                background: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {editingEmployeeId && (
        <div style={styles.modalOverlay} onClick={handleCancelEdit}>
          <div style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>Edit Employee</div>
                <div style={styles.modalSubtitle}>
                  Update employee details and save changes.
                </div>
              </div>

              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={handleCancelEdit}
                disabled={savingEmployeeId === editingEmployeeId}
              >
                x
              </button>
            </div>

            <div style={styles.modalGrid}>
              <label style={styles.modalField}>
                <span style={styles.modalLabel}>Name</span>
                <input
                  style={styles.modalInput}
                  value={editForm.name}
                  onChange={(event) =>
                    handleEditFormChange("name", event.target.value)
                  }
                />
              </label>

              <label style={styles.modalField}>
                <span style={styles.modalLabel}>Email</span>
                <input
                  style={styles.modalInput}
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    handleEditFormChange("email", event.target.value)
                  }
                />
              </label>

              <label style={styles.modalField}>
                <span style={styles.modalLabel}>Mobile</span>
                <input
                  style={styles.modalInput}
                  value={editForm.mobile}
                  onChange={(event) =>
                    handleEditFormChange("mobile", event.target.value)
                  }
                />
              </label>

              <label style={styles.modalField}>
                <span style={styles.modalLabel}>Designation</span>
                <input
                  style={styles.modalInput}
                  value={editForm.designation}
                  onChange={(event) =>
                    handleEditFormChange("designation", event.target.value)
                  }
                />
              </label>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCancelEdit}
                disabled={savingEmployeeId === editingEmployeeId}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.saveButton}
                onClick={handleSaveEmployee}
                disabled={savingEmployeeId === editingEmployeeId}
              >
                {savingEmployeeId === editingEmployeeId ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModalMessage && (
        <DashboardSuccessModal
          message={successModalMessage}
          onClose={() => setSuccessModalMessage("")}
          title="Edit Successful"
        />
      )}
    </div>
  );
};

export default AllEmployeePage;

async function fetchEmployeePage(currentPage, rowsPerPage, search = "") {
  const response = await getAdminEmployees({
    page: currentPage - 1,
    size: rowsPerPage,
    search,
  });

  return normalizeEmployeeResponse(response.data, rowsPerPage);
}

function normalizeEmployeeResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload)
    .filter(hasEmployeeIdentity)
    .map(normalizeEmployeeRow);
  const totalRecords =
    findFirstNumber(payload, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeEmployeeRow(row, index = 0) {
  const firstName = row.firstName ?? "";
  const lastName = row.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    id: row.id ?? index + 1,
    apiEmployeeId: row.id ?? index + 1,
    employeeId: row.id ?? "-",
    firstName: firstName || "-",
    lastName: lastName || "-",
    name: fullName || "-",
    email: row.email ?? "-",
    mobile: row.phoneNumber ?? "-",
    designation: row.role ?? "-",
    status: normalizeEmployeeStatus(row.status),
    createdBy: row.createdBy ?? "-",
    ...splitEmployeeDateTime(row.createdAt ?? row.createdDate),
    ...splitEmployeeDateTime(row.updatedAt ?? row.updatedDate, "updated"),
  };
}

function normalizeEmployeeStatus(status) {
  if (typeof status === "boolean") return status ? "Active" : "Inactive";
  if (status === null || status === undefined || status === "") return "-";
  return String(status);
}

function formatEmployeeDate(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").split(".")[0];
}

function EmployeeDateTime({ date, time }) {
  return (
    <div className="flex flex-col text-[12px] leading-5">
      <span className="font-medium text-[#2F80ED]">{date}</span>
      <span className="text-[#27AE60]">{time}</span>
    </div>
  );
}

function splitEmployeeDateTime(value, prefix = "created") {
  const formattedValue = formatEmployeeDate(value);
  const [date, time = "-"] = formattedValue.split(" ");

  return prefix === "updated"
    ? { updatedDate: date, updatedTime: time }
    : { createdDate: date, createdTime: time };
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
    "employees",
    "employeeList",
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

  if (hasEmployeeIdentity(value)) return [value];

  return [];
}

function hasEmployeeIdentity(row) {
  if (!row || typeof row !== "object") return false;

  return [
    row.id,
    row.firstName,
    row.lastName,
    row.email,
    row.phoneNumber,
    row.role,
    row.status,
    row.createdBy,
    row.createdDate,
    row.updatedAt,
  ].some((value) => value !== null && value !== undefined && value !== "");
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
