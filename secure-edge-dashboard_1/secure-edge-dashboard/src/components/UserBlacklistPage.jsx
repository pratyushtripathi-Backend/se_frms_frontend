import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiPlus,
} from "react-icons/fi";

import { userBlacklistData } from "./UserBlacklistData";

const UserBlacklistPage = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

            <button style={styles.addButton}>
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
                <th style={styles.th}>Unblock</th>

              </tr>
            </thead>

            <tbody>

              {currentData.map((item, index) => (

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
                    <button style={styles.removeButton}>
                      Remove
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