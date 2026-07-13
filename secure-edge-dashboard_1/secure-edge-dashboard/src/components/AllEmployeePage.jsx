import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";

import { allEmployeeData } from "./AllEmployeeData";

const AllEmployeePage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  // Delete flow state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const rowsPerPage = 10;

  const filteredEmployees = useMemo(() => {
    return allEmployeeData.filter((emp) =>
      Object.values(emp)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteClick = (employee) => {
    setOpenMenu(null);
    setDeleteTarget(employee);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    // TODO: wire up to your actual delete API call using deleteTarget
    console.log("Deleting employee:", deleteTarget);
    setDeleteTarget(null);
    setShowSuccessModal(true);
  };

  const handleBackToPage = () => {
    setShowSuccessModal(false);
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 48px 20px 24px",
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

    tableContainer: {
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden",
      background: "#fff",
    },

    table: {
      width: "100%",
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
      zIndex: 100,
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

    // ---------- Modal styles ----------
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
      width: "640px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "16px",
      padding: "56px 48px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      textAlign: "center",
    },

    iconWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginBottom: "8px",
    },

    modalTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#202224",
      marginTop: "24px",
      marginBottom: "16px",
    },

    modalDescription: {
      fontSize: "14px",
      lineHeight: "22px",
      color: "#7A7A7A",
      maxWidth: "420px",
      margin: "0 auto 32px",
    },

    modalButtonsRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
    },

    cancelButton: {
      height: "46px",
      width: "140px",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      background: "#FFFFFF",
      color: "#202224",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },

    deleteConfirmButton: {
      height: "46px",
      width: "140px",
      borderRadius: "8px",
      border: "none",
      background: "#EB5757",
      color: "#FFFFFF",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },

    backToPageButton: {
      height: "46px",
      width: "160px",
      borderRadius: "8px",
      border: "none",
      background: "#4B4B4B",
      color: "#FFFFFF",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.title}>All Employee Details Here</div>

          <div style={styles.searchBox}>
            <FiSearch color="#8B8B8B" />

            <input
              style={styles.searchInput}
              placeholder="Search Employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.header}>
              <tr>
                <th style={styles.th}>Sr No</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Employee Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Permission</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentEmployees.map((employee, index) => (
                <tr key={employee.id} style={styles.tr}>
                  <td style={styles.td}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  <td style={styles.td}>{employee.employeeId}</td>

                  <td style={styles.td}>{employee.name}</td>

                  <td style={styles.td}>{employee.email}</td>

                  <td style={styles.td}>{employee.mobile}</td>

                  <td style={styles.td}>{employee.department}</td>

                  <td style={styles.td}>{employee.designation}</td>

                  <td style={styles.td}>
                    <span style={styles.badge}>
                      {employee.permission}
                    </span>
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      position: "relative",
                    }}
                  >
                    <button
                      style={styles.actionBtn}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === employee.id ? null : employee.id
                        )
                      }
                    >
                      Select
                      <FiChevronDown size={14} />
                    </button>
                    {openMenu === employee.id && (
                      <div style={styles.menu}>
                        <div
                          style={styles.menuItem}
                          onClick={() => {
                            console.log("Permission", employee);
                            setOpenMenu(null);
                          }}
                        >
                          Permission
                        </div>

                        <div
                          style={{ ...styles.menuItem, color: "#0A84FF" }}
                          onClick={() => {
                            console.log("Edit", employee);
                            setOpenMenu(null);
                          }}
                        >
                          Edit
                        </div>

                        <div
                          style={{ ...styles.menuItem, color: "#DC2626" }}
                          onClick={() => handleDeleteClick(employee)}
                        >
                          Delete
                        </div>
                      </div>
                    )}
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
              {filteredEmployees.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </strong>{" "}
            -
            <strong>
              {" "}
              {Math.min(
                currentPage * rowsPerPage,
                filteredEmployees.length
              )}
            </strong>{" "}
            of <strong>{filteredEmployees.length}</strong> Employees
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
                className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                  page === 1
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={styles.modalOverlay} onClick={handleCancelDelete}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.iconWrapper}>
              <FiTrash2 size={56} color="#111111" strokeWidth={1.75} />
            </div>

            <div style={styles.modalTitle}>Delete User</div>

            <div style={styles.modalDescription}>
              Are you sure you want to delete this user and all associated
              data? This action is permanent and cannot be undone.
            </div>

            <div style={styles.modalButtonsRow}>
              <button style={styles.cancelButton} onClick={handleCancelDelete}>
                Cancel
              </button>

              <button
                style={styles.deleteConfirmButton}
                onClick={handleConfirmDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>

            <div style={styles.iconWrapper}>
              <svg
                width="88"
                height="88"
                viewBox="0 0 88 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="44"
                  cy="44"
                  r="40"
                  stroke="#111111"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="252"
                  strokeDashoffset="252"
                  style={{
                    animation: "drawCircle 0.6s ease-out forwards",
                  }}
                />
                <path
                  d="M27 45 L39 57 L61 33"
                  stroke="#EB5757"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="46"
                  strokeDashoffset="46"
                  style={{
                    animation: "drawCheck 0.4s ease-out 0.55s forwards",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircle {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawCheck {
                to { stroke-dashoffset: 0; }
              }
            `}</style>

            <div style={styles.modalTitle}>User Deleted Successfully</div>

            <div style={styles.modalDescription}>
              The Selected user account has been deleted successfully.
            </div>

            <button
              style={styles.backToPageButton}
              onClick={handleBackToPage}
            >
              Back to Page
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>
    </div>
  );
};

export default AllEmployeePage;