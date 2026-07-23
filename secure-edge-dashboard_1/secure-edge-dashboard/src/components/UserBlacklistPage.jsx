import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiPlus,
  FiX,
} from "react-icons/fi";

import { userBlacklistData } from "./UserBlacklistData";

const UserBlacklistPage = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add Blacklist modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    mobile: "",
    blockedBy: "Admin",
    reason: "",
  });

  // Add Blacklist success modal state
  const [showBlockSuccessModal, setShowBlockSuccessModal] = useState(false);

  // Unblock flow state
  const [unblockTarget, setUnblockTarget] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Action-column Block/Unblock toggle state per row.
  // Seeded so rows 1, 5, 7, 9 start "Block" (red); the rest start "Unblock" (green),
  // matching the reference design — independent of the Status text column.
  const blockedSeedIds = [1, 5, 7, 9];
  const [blockMap, setBlockMap] = useState(() =>
    Object.fromEntries(
      userBlacklistData.map((item) => [
        item.id,
        blockedSeedIds.includes(item.id),
      ])
    )
  );

  const toggleBlock = (id) => {
    setBlockMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    return userBlacklistData.filter((item) =>
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

  const handleSubmit = () => {
    // TODO: wire up to your API / add-to-list logic
    console.log("Submitting blacklist entry:", formData);
    setIsModalOpen(false);
    setFormData({
      userId: "",
      userName: "",
      mobile: "",
      blockedBy: "Admin",
      reason: "",
    });
    setShowBlockSuccessModal(true);
  };

  const handleBackFromBlockSuccess = () => {
    setShowBlockSuccessModal(false);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleRemoveClick = (item) => {
    setUnblockTarget(item);
  };

  const handleCancelUnblock = () => {
    setUnblockTarget(null);
  };

  const handleConfirmUnblock = () => {
    // TODO: wire up to your actual unblock API call using unblockTarget
    console.log("Unblocking user:", unblockTarget);
    setUnblockTarget(null);
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

    status: {
      color: "#FF3B30",
      fontWeight: 600,
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

    // ---------- Add Blacklist Modal styles ----------
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
      background: "#fff",
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

    // ---------- Unblock / Success Modal styles ----------
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

    confirmButtonsRow: {
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

    unblockConfirmButton: {
      height: "46px",
      width: "150px",
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

  const renderCreatedAt = (createdAt) => {
    if (!createdAt) return null;
    const spaceIndex = createdAt.indexOf(" ");
    if (spaceIndex === -1) {
      return <span style={styles.createdDate}>{createdAt}</span>;
    }
    const datePart = createdAt.slice(0, spaceIndex);
    const timePart = createdAt.slice(spaceIndex + 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
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

            <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
              <FiPlus />
              Add Blacklist
            </button>

          </div>

        </div>

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead style={styles.tableHead}>
              <tr>

                <th style={styles.th}>ID</th>
                <th style={styles.th}>User ID</th>
                <th style={styles.th}>Employee Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Reason</th>
                <th style={styles.th}>Risk Type</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Action</th>

              </tr>
            </thead>

            <tbody>

              {currentData.map((item, index) => {
                const isBlocked = blockMap[item.id];

                return (

                <tr key={item.id} style={styles.tr}>

                  <td style={styles.td}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  <td style={styles.td}>{item.userId}</td>

                  <td style={styles.td}>{item.employeeName}</td>

                  <td style={styles.td}>{item.email}</td>

                  <td style={styles.td}>{item.mobile}</td>

                  <td style={{ ...styles.td, ...styles.status }}>
                    {item.status}
                  </td>

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
                    {item.createdBy}
                  </td>

                  <td style={styles.td}>
                    {renderCreatedAt(item.createdAt)}
                  </td>

                  <td style={styles.td}>
                    <button
                      type="button"
                      onClick={() => toggleBlock(item.id)}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        height: "28px",
                        width: "92px",
                        borderRadius: "20px",
                        border: "none",
                        padding: "0 4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        cursor: "pointer",
                        background: isBlocked ? "#EB5757" : "#27AE60",
                        justifyContent: isBlocked ? "flex-start" : "flex-end",
                      }}
                    >
                      <span>{isBlocked ? "Block" : "Unblock"}</span>

                      <span
                        style={{
                          position: "absolute",
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "20px",
                          width: "20px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
                          transition: "all 0.2s",
                          right: isBlocked ? "4px" : undefined,
                          left: isBlocked ? undefined : "4px",
                        }}
                      />
                    </button>
                  </td>

                </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {/* Footer + Pagination */}

        <div style={styles.footerRow}>

          <div style={styles.footerText}>
            Showing{" "}
            <strong>
              {filteredData.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </strong>{" "}
            -
            <strong>
              {" "}
              {Math.min(
                currentPage * rowsPerPage,
                filteredData.length
              )}
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

      {/* Add Blacklist Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>Add User Blacklist</div>
                <div style={styles.modalSubtitle}>Fill all fileds to blacklist user</div>
              </div>
              <button style={styles.closeButton} onClick={closeModal}>
                <FiX size={16} />
              </button>
            </div>

            <div style={styles.formGrid}>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>User ID</label>
                <input
                  style={styles.fieldInput}
                  placeholder="User ID"
                  value={formData.userId}
                  onChange={handleFormChange("userId")}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>User Name</label>
                <input
                  style={styles.fieldInput}
                  placeholder="Enter Name"
                  value={formData.userName}
                  onChange={handleFormChange("userName")}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Mobile No</label>
                <input
                  style={styles.fieldInput}
                  placeholder="Enter User Mobile no"
                  value={formData.mobile}
                  onChange={handleFormChange("mobile")}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Blocked By</label>
                <select
                  style={styles.fieldSelect}
                  value={formData.blockedBy}
                  onChange={handleFormChange("blockedBy")}
                >
                  <option value="Admin">Admin</option>
                  <option value="System">System</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

            </div>

            <div style={{ ...styles.fieldGroup, marginBottom: "28px" }}>
              <label style={styles.fieldLabel}>Reason</label>
              <textarea
                style={styles.fieldTextarea}
                placeholder="Write a Reason"
                value={formData.reason}
                onChange={handleFormChange("reason")}
              />
            </div>

            <button style={styles.submitButton} onClick={handleSubmit}>
              Submit
            </button>

          </div>
        </div>
      )}

      {/* Add Blacklist Success Modal */}
      {showBlockSuccessModal && (
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
                    animation: "drawCircleBlock 0.6s ease-out forwards",
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
                    animation: "drawVanishCheckBlock 2.2s ease-in-out 0.55s infinite",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircleBlock {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawVanishCheckBlock {
                0%   { stroke-dashoffset: 46; }
                35%  { stroke-dashoffset: 0; }
                65%  { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -46; }
              }
            `}</style>

            <div style={styles.confirmTitle}>User Blocked Successfully</div>

            <div style={styles.confirmDescription}>
              The user has been blocked successfully and can no longer
              access the system.
            </div>

            <button
              style={styles.backToPageButton}
              onClick={handleBackFromBlockSuccess}
            >
              Back to Page
            </button>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      {unblockTarget && (
        <div style={styles.modalOverlay} onClick={handleCancelUnblock}>
          <div style={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.iconWrapper}>
              <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M36 8 L67 62 H5 Z"
                  stroke="#111111"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                />
                <line
                  x1="36"
                  y1="30"
                  x2="36"
                  y2="44"
                  stroke="#EB5757"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="36" cy="52" r="2.2" fill="#EB5757" />
              </svg>
            </div>

            <div style={styles.confirmTitle}>Unblock User</div>

            <div style={styles.confirmDescription}>
              Are you sure you want to remove this user from the block list?
              The user will regain access to the system.
            </div>

            <div style={styles.confirmButtonsRow}>
              <button style={styles.cancelButton} onClick={handleCancelUnblock}>
                Cancel
              </button>

              <button
                style={styles.unblockConfirmButton}
                onClick={handleConfirmUnblock}
              >
                Unblock User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
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

            <div style={styles.confirmTitle}>User Unblocked Successfully</div>

            <div style={styles.confirmDescription}>
              The user has been removed from the block list and can now
              access the system.
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

export default UserBlacklistPage;