import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
} from "react-icons/fi";

import { userRoleData } from "./UserRoleData";

const UserRolePage = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add User Role modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    roleName: "",
  });

  // Add User Role success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    return userRoleData.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleFormChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    // TODO: wire up to your actual add-user-role API call using formData
    console.log("Submitting user role:", formData);
    setIsModalOpen(false);
    setFormData({
      userId: "",
      userName: "",
      roleName: "",
    });
    setShowSuccessModal(true);
  };

  const handleBackToPage = () => {
    setShowSuccessModal(false);
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
      padding: "0 12px",
      outline: "none",
      fontSize: "13px",
      color: "#808080",
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
      marginRight: "8px",
      fontSize: "13px",
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
      whiteSpace: "nowrap",
    },

    tableContainer: {
      margin: "0 10px",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden",
      background: "#FFFFFF",
    },

    table: {
      width: "100%",
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

    createdDate: {
      color: "#2563EB",
      fontWeight: 500,
    },

    createdTime: {
      color: "#2E7D32",
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

    // ---------- Add User Role Modal styles ----------
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
      width: "660px",
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

    formStack: {
      display: "flex",
      flexDirection: "column",
      gap: "22px",
      marginBottom: "28px",
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
      height: "48px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
    },

    fieldSelect: {
      height: "48px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
      background: "#fff",
      appearance: "auto",
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

    // ---------- Success Modal styles ----------
    confirmModalCard: {
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

    confirmTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#202224",
      marginTop: "24px",
      marginBottom: "16px",
    },

    confirmDescription: {
      fontSize: "14px",
      lineHeight: "22px",
      color: "#7A7A7A",
      maxWidth: "440px",
      margin: "0 auto 32px",
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Block":
        return { color: "#EB5757", fontWeight: 600 };
      case "Pending":
        return { color: "#F2994A", fontWeight: 600 };
      default:
        return { color: "#27AE60", fontWeight: 600 };
    }
  };

  const renderDateTime = (datePart, timePart) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={styles.createdDate}>{datePart}</span>
      <span style={styles.createdTime}>{timePart}</span>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>

          <div style={styles.title}>
            All User Role Details
          </div>

          <div style={styles.filters}>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={styles.dateInput}
              placeholder="From"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={styles.dateInput}
              placeholder="To"
            />

            <div style={styles.searchBox}>
              <input
                style={styles.searchInput}
                placeholder="Search Value"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch color="#888" />
            </div>

            <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
              Add User Role
              <FiPlus />
            </button>

          </div>

        </div>

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead style={styles.tableHead}>
              <tr>

                <th style={styles.th}>ID</th>
                <th style={styles.th}>User ID</th>
                <th style={styles.th}>User Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Created by</th>
                <th style={styles.th}>Created at</th>
                <th style={styles.th}>Update at</th>
                <th style={styles.th}>Status</th>

              </tr>
            </thead>

            <tbody>

              {currentData.map((item, index) => (

                <tr key={item.id} style={styles.tr}>

                  <td style={styles.td}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  <td style={styles.td}>{item.userId}</td>

                  <td style={styles.td}>{item.userName}</td>

                  <td style={styles.td}>{item.role}</td>

                  <td style={styles.td}>{item.createdBy}</td>

                  <td style={styles.td}>
                    {renderDateTime(item.createdDate, item.createdTime)}
                  </td>

                  <td style={styles.td}>
                    {renderDateTime(item.updatedDate, item.updatedTime)}
                  </td>

                  <td style={styles.td}>
                    <span style={getStatusStyle(item.status)}>
                      {item.status}
                    </span>
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
              {filteredData.length === 0 ? 0 : currentData.length}
            </strong>{" "}
            of <strong>{filteredData.length}</strong> transactions
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

            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  background: page === currentPage ? "#F3F4F6" : "transparent",
                  color: page === currentPage ? "#111827" : "#6B7280",
                }}
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

      {/* Add User Role Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>Add User Role</div>
                <div style={styles.modalSubtitle}>Fill all filed to user role</div>
              </div>
              <button style={styles.closeButton} onClick={closeModal}>
                <FiX size={16} />
              </button>
            </div>

            <div style={styles.formStack}>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>User ID</label>
                <input
                  style={styles.fieldInput}
                  placeholder="User Id"
                  value={formData.userId}
                  onChange={handleFormChange("userId")}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>User Name</label>
                <input
                  style={styles.fieldInput}
                  placeholder="User Name"
                  value={formData.userName}
                  onChange={handleFormChange("userName")}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Role Name</label>
                <select
                  style={styles.fieldSelect}
                  value={formData.roleName}
                  onChange={handleFormChange("roleName")}
                >
                  <option value="">Select Role Name</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

            </div>

            <button style={styles.submitButton} onClick={handleSubmit}>
              Submit
            </button>

          </div>
        </div>
      )}

      {/* Add User Role Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmModalCard}>

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
                    animation: "drawCircleRole 0.6s ease-out forwards",
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
                    animation: "drawCheckRole 0.4s ease-out 0.55s forwards",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircleRole {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawCheckRole {
                to { stroke-dashoffset: 0; }
              }
            `}</style>

            <div style={styles.confirmTitle}>User Role Assign Successfully</div>

            <div style={styles.confirmDescription}>
              User Role Assign successfully.
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

export default UserRolePage;