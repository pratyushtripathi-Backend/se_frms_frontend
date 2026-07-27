import React, { useMemo, useState, useEffect } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiCalendar,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";

import { manageRoleData } from "./ManageRoleData";

const ROWS_PER_PAGE = 10;

const ManageRolePage = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  // Delete flow state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Add Role modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    roleName: "",
    slug: "",
  });

  // Add Role success modal state
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);

  const filteredRoles = useMemo(() => {
    return manageRoleData.filter((role) =>
      Object.values(role)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  // Pagination is entirely data-driven. With <= ROWS_PER_PAGE items,
  // totalPages is 1 and the pagination controls never render at all.
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ROWS_PER_PAGE));
  const hasPagination = filteredRoles.length > ROWS_PER_PAGE;

  // Reset back to page 1 whenever the search term changes the dataset
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Clamp currentPage if filtering/deleting shrinks the result set below it
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentRoles = useMemo(() => {
    if (!hasPagination) return filteredRoles;
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredRoles.slice(start, start + ROWS_PER_PAGE);
  }, [filteredRoles, currentPage, hasPagination]);

  // Windowed page numbers (with ellipses) so it stays compact even if the
  // dataset grows to hundreds of pages later.
  const pageNumbers = useMemo(() => {
    if (!hasPagination) return [];

    const pages = [];
    const windowSize = 1;

    for (let p = 1; p <= totalPages; p++) {
      const isEdge = p === 1 || p === totalPages;
      const isWithinWindow = Math.abs(p - currentPage) <= windowSize;

      if (isEdge || isWithinWindow) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  }, [totalPages, currentPage, hasPagination]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDeleteClick = (role) => {
    setOpenMenu(null);
    setDeleteTarget(role);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    // TODO: wire up to your actual delete API call using deleteTarget
    console.log("Deleting role:", deleteTarget);
    setDeleteTarget(null);
    setShowSuccessModal(true);
  };

  const handleBackToPage = () => {
    setShowSuccessModal(false);
  };

  const handleRoleFormChange = (e) => {
    setRoleFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddRole = () => {
    // TODO: wire up to your API / add-role logic
    console.log("Adding role:", roleFormData);
    setIsRoleModalOpen(false);
    setRoleFormData({ roleName: "", slug: "" });
    setShowAddSuccessModal(true);
  };

  const handleBackFromAddSuccess = () => {
    setShowAddSuccessModal(false);
  };

  const closeRoleModal = () => setIsRoleModalOpen(false);

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
      background: "#fff",
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
    },

    addRoleButton: {
      height: "38px",
      padding: "0 18px",
      borderRadius: "8px",
      border: "1px solid #FF4D4F",
      background: "#FFFFFF",
      color: "#FF4D4F",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap",
    },

    tableContainer: {
      margin: "0 10px",
      border: "1px solid #E8E8E8",
      borderRadius: "10px",
      overflow: "hidden",
      background: "#fff",
    },

    table: {
      width: "100%",
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
      fontSize: "13px",
      color: "#444",
    },

    tr: {
      height: "44px",
      borderBottom: "1px solid #F0F0F0",
    },

    td: {
      padding: "10px 18px",
      fontSize: "13px",
      color: "#555",
    },

    emptyTd: {
      padding: "40px 18px",
      fontSize: "13px",
      color: "#9CA3AF",
      textAlign: "center",
    },

    actionButton: {
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

    pageButton: {
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      border: "none",
      background: "transparent",
      color: "#6B7280",
      fontSize: "12px",
      fontWeight: 500,
      cursor: "pointer",
    },

    pageButtonActive: {
      background: "#F3F4F6",
      color: "#111827",
    },

    pageEllipsis: {
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      color: "#9CA3AF",
    },

    navButton: {
      width: "36px",
      height: "36px",
      border: "1px solid #E5E7EB",
      background: "#FFFFFF",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    navButtonDisabled: {
      cursor: "not-allowed",
      opacity: 0.4,
    },

    // ---------- Delete / Success Modal styles ----------
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

    // ---------- Add Role Modal styles ----------
    roleModalCard: {
      width: "400px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "14px",
      padding: "28px 32px 32px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      position: "relative",
    },

    roleModalCloseRow: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "18px",
    },

    closeButton: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      background: "transparent",
      color: "#111111",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
    },

    roleModalField: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "20px",
    },

    roleModalFieldLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#333",
    },

    roleModalInput: {
      height: "46px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
    },

    addSubmitButton: {
      height: "46px",
      padding: "0 32px",
      borderRadius: "8px",
      border: "none",
      background: "#6B6B6B",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      marginTop: "6px",
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

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={styles.dateInput}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={styles.dateInput}
            />

            <div style={styles.searchBox}>

              <FiSearch color="#888" />

              <input
                style={styles.searchInput}
                placeholder="Search Value"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

            <button
              style={styles.addRoleButton}
              onClick={() => setIsRoleModalOpen(true)}
            >
              Add Role
              <FiPlus size={16} />
            </button>

          </div>

        </div>

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead style={styles.tableHead}>

              <tr>

                <th style={styles.th}>ID</th>

                <th style={styles.th}>Role Name</th>

                <th style={styles.th}>Slug</th>

                <th style={styles.th}>Action</th>

              </tr>

            </thead>

            <tbody>

              {currentRoles.length === 0 && (
                <tr>
                  <td style={styles.emptyTd} colSpan={4}>
                    No matching roles found.
                  </td>
                </tr>
              )}

              {currentRoles.map((role) => (

                <tr key={role.id} style={styles.tr}>

                  <td style={styles.td}>{role.id}</td>

                  <td style={styles.td}>{role.roleName}</td>

                  <td style={styles.td}>{role.slug}</td>

                  <td
                    style={{
                      ...styles.td,
                      position: "relative",
                    }}
                  >

                    <button
                      style={styles.actionButton}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === role.id ? null : role.id
                        )
                      }
                    >
                      Select
                      <FiChevronDown size={14} />
                    </button>
                    {openMenu === role.id && (
                      <div style={styles.menu}>
                        <div
                          style={{ ...styles.menuItem, color: "#0A84FF" }}
                          onClick={() => {
                            console.log("Edit", role);
                            setOpenMenu(null);
                          }}
                        >
                          Edit
                        </div>

                        <div
                          style={{ ...styles.menuItem, color: "#DC2626" }}
                          onClick={() => handleDeleteClick(role)}
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
              {filteredRoles.length === 0
                ? 0
                : (currentPage - 1) * ROWS_PER_PAGE + 1}
            </strong>{" "}
            -
            <strong>
              {" "}
              {Math.min(
                currentPage * ROWS_PER_PAGE,
                filteredRoles.length
              )}
            </strong>{" "}
            of <strong>{filteredRoles.length}</strong> transactions
          </div>

          {hasPagination && (
            <div style={styles.pagination}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 1 ? styles.navButtonDisabled : {}),
                }}
              >
                <FiChevronLeft />
              </button>

              {pageNumbers.map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    style={{
                      ...styles.pageButton,
                      ...(page === currentPage ? styles.pageButtonActive : {}),
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.navButton,
                  ...(currentPage === totalPages ? styles.navButtonDisabled : {}),
                }}
              >
                <FiChevronRight />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Add Role Modal */}
      {isRoleModalOpen && (
        <div style={styles.modalOverlay} onClick={closeRoleModal}>
          <div style={styles.roleModalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.roleModalCloseRow}>
              <button style={styles.closeButton} onClick={closeRoleModal}>
                <FiX size={20} />
              </button>
            </div>

            <div style={styles.roleModalField}>
              <label style={styles.roleModalFieldLabel}>Add Role</label>
              <input
                style={styles.roleModalInput}
                name="roleName"
                placeholder="Add Role"
                value={roleFormData.roleName}
                onChange={handleRoleFormChange}
              />
            </div>

            <div style={styles.roleModalField}>
              <label style={styles.roleModalFieldLabel}>Slug</label>
              <input
                style={styles.roleModalInput}
                name="slug"
                placeholder="Slug"
                value={roleFormData.slug}
                onChange={handleRoleFormChange}
              />
            </div>

            <button style={styles.addSubmitButton} onClick={handleAddRole}>
              Add
            </button>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={styles.modalOverlay} onClick={handleCancelDelete}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.iconWrapper}>
              <FiTrash2 size={56} color="#111111" strokeWidth={1.75} />
            </div>

            <div style={styles.modalTitle}>Delete Role</div>

            <div style={styles.modalDescription}>
              Are you sure you want to delete this Role? This action is
              permanent and cannot be undone.
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

      {/* Delete Success Modal */}
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
                    animation: "drawVanishCheck 2.2s ease-in-out 0.55s infinite",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircle {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawVanishCheck {
                0%   { stroke-dashoffset: 46; }
                35%  { stroke-dashoffset: 0; }
                65%  { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -46; }
              }
            `}</style>

            <div style={styles.modalTitle}>Role Deleted Successfully</div>

            <div style={styles.modalDescription}>
              The Selected Role has been deleted successfully.
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

      {/* Add Role Success Modal */}
      {showAddSuccessModal && (
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
                    animation: "drawCircleAdd 0.6s ease-out forwards",
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
                    animation: "drawVanishCheckAdd 2.2s ease-in-out 0.55s infinite",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircleAdd {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawVanishCheckAdd {
                0%   { stroke-dashoffset: 46; }
                35%  { stroke-dashoffset: 0; }
                65%  { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -46; }
              }
            `}</style>

            <div style={styles.modalTitle}>Role Added Successfully</div>

            <div style={styles.modalDescription}>
              The Role has been successfully registered and activated
            </div>

            <button
              style={styles.backToPageButton}
              onClick={handleBackFromAddSuccess}
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

export default ManageRolePage;