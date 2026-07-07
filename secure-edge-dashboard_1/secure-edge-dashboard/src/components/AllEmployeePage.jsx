import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { allEmployeeData } from "./AllEmployeeData";

const AllEmployeePage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

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
                          onClick={() => {
                            console.log("Delete", employee);
                            setOpenMenu(null);
                          }}
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