import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays, Download, RotateCcw } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import { getTransactions } from "../services/transactionService";
import {
  normalizeTransactionsResponse,
  normalizeTransactionRow,
} from "./transactionNormalization";

const rowsPerPage = 10;
const AUTO_REFRESH_INTERVAL_MS = 8000;

export default function TransactionDataPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRemarkRow, setExpandedRemarkRow] = useState(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, year, fromDate, toDate]);

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const fetchTransactions = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestIdRef.current;

      if (!silent) {
        setIsLoading(true);
        setError("");
        setExpandedRemarkRow(null);
      } else {
        setIsLiveUpdating(true);
      }

      try {
        const response = await getTransactions({
          page: currentPage - 1,
          size: rowsPerPage,
        });
        const { rawRows, totalRecords: apiTotalRecords, totalPages } =
          normalizeTransactionsResponse(response.data, rowsPerPage);

        if (requestIdRef.current !== requestId) return;

        const pageOffset = (currentPage - 1) * rowsPerPage;

        setTransactions(
          rawRows.map((row, index) =>
            normalizeTransactionRow(row, index, pageOffset),
          ),
        );
        setTotalRecords(apiTotalRecords);
        setTotalApiPages(totalPages);

        if (!silent) setError("");
      } catch (fetchError) {
        if (requestIdRef.current !== requestId) return;

        // Silent background refreshes fail quietly so a flaky poll doesn't
        // wipe out data already on screen or interrupt the user.
        if (!silent) {
          setError(
            getAuthErrorMessage(
              fetchError,
              "Unable to load transaction data. Please try again.",
            ),
          );
          setTransactions([]);
          setTotalRecords(0);
          setTotalApiPages(1);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          if (!silent) setIsLoading(false);
          else setIsLiveUpdating(false);
        }
      }
    },
    [currentPage],
  );

  useEffect(() => {
    fetchTransactions({ silent: false });
  }, [fetchTransactions]);

  // Auto-refresh: while the user is viewing page 1 with no filters applied,
  // silently poll for new transactions so they appear without a manual
  // reload. There's no live push (WebSocket/SSE) endpoint from the backend
  // yet, so this is a lightweight polling-based approximation of real time.
  const hasActiveFilters = Boolean(
    year || fromDate || toDate || searchQuery.trim(),
  );

  useEffect(() => {
    if (currentPage !== 1 || hasActiveFilters) return undefined;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      fetchTransactions({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [currentPage, hasActiveFilters, fetchTransactions]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return transactions.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        Object.values(row).some((value) =>
          String(value ?? "").toLowerCase().includes(normalizedSearch),
        );
      const createdDate = row.createdAtRaw
        ? new Date(row.createdAtRaw)
        : parseTransactionDate(row.createdDate);
      const matchesYear =
        !year ||
        (row.createdAtRaw
          ? String(row.createdAtRaw).slice(0, 4) === year
          : row.createdDate.endsWith(year));
      const matchesFromDate =
        !fromDate || !createdDate || createdDate >= new Date(`${fromDate}T00:00:00`);
      const matchesToDate =
        !toDate || !createdDate || createdDate <= new Date(`${toDate}T23:59:59`);

      return matchesSearch && matchesYear && matchesFromDate && matchesToDate;
    });
  }, [fromDate, searchQuery, toDate, transactions, year]);

  const totalPages = Math.max(totalApiPages, 1);
  const currentRows = filteredData;

  const firstVisibleRecord =
    filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const lastVisibleRecord = (currentPage - 1) * rowsPerPage + filteredData.length;

  const exportCSV = () => {
    const headers = [
      "Sr.no",
      "User ID",
      "Merchant ID",
      "Channel",
      "Amount",
      "Currency",
      "Latitude",
      "Longitude 1",
      "Longitude 2",
      "IP Address",
      "Location",
      "Device ID",
      "Remark",
      "Status",
      "Created By",
      "Created Date",
      "Created Time",
      "Updated Date",
      "Updated Time",
    ];

    const csvRows = filteredData.map((row) => [
      row.srNo,
      row.userId,
      row.merchantId,
      row.channel,
      row.amount,
      row.currency,
      row.latitude,
      row.longitude,
      row.longitude2,
      row.ipAddress,
      row.location,
      row.deviceId,
      row.remark,
      row.status,
      row.createdBy,
      row.createdDate,
      row.createdTime,
      row.updatedDate,
      row.updatedTime,
    ]);

    const csv = [headers, ...csvRows]
      .map((cells) => cells.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "transaction-data.csv";
    link.click();

    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 24px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      padding: "20px 24px 24px",
      boxSizing: "border-box",
    },

    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "16px",
    },

    title: {
      fontSize: "15px",
      fontWeight: 700,
      color: "#202224",
    },

    controls: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
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

    exportButton: {
      height: "40px",
      padding: "0 16px",
      borderRadius: "8px",
      border: "1px solid #FF4D4F",
      background: "#FFFFFF",
      color: "#FF4D4F",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },

    resetButton: {
      height: "40px",
      padding: "0 32px",
      borderRadius: "8px",
      border: "none",
      background: "#333333",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    tableContainer: {
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflowX: "auto",
      background: "#FFFFFF",
    },

    table: {
      width: "100%",
      minWidth: "1830px",
      borderCollapse: "collapse",
    },

    thead: {
      height: "44px",
      background: "#FAFAFA",
      borderBottom: "1px solid #ECECEC",
    },

    th: {
      textAlign: "left",
      padding: "10px 18px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#555555",
      whiteSpace: "nowrap",
    },

    tr: {
      height: "56px",
      borderBottom: "1px solid #F1F1F1",
    },

    td: {
      padding: "10px 18px",
      fontSize: "13px",
      color: "#555555",
      whiteSpace: "nowrap",
    },

    remarkTd: {
      padding: "10px 18px",
      fontSize: "13px",
      color: "#555555",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "260px",
      width: "260px",
    },

    remarkTdExpanded: {
      padding: "10px 18px",
      fontSize: "13px",
      color: "#555555",
      whiteSpace: "normal",
      wordBreak: "break-word",
      maxWidth: "260px",
      width: "260px",
      cursor: "pointer",
    },

    statusPill: (isActive) => ({
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      height: "26px",
      width: "82px",
      borderRadius: "20px",
      padding: "0 10px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#FFFFFF",
      background: isActive ? "#27AE60" : "#D9D9D9",
      justifyContent: isActive ? "flex-start" : "flex-end",
    }),

    statusDot: (isActive) => ({
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      height: "18px",
      width: "18px",
      borderRadius: "50%",
      background: "#FFFFFF",
      boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      right: isActive ? "4px" : undefined,
      left: isActive ? undefined : "4px",
    }),

    dateTimeDate: {
      fontWeight: 500,
      color: "#2563EB",
    },

    dateTimeTime: {
      color: "#27AE60",
    },

    footerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      marginTop: "16px",
    },

    footerText: {
      fontSize: "13px",
      color: "#7B7B7B",
    },

    pagination: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    pageArrow: {
      width: "34px",
      height: "34px",
      border: "1px solid #E5E7EB",
      background: "#FFFFFF",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#555555",
    },

    pageNumber: (isActive) => ({
      width: "32px",
      height: "32px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      background: isActive ? "#F3F4F6" : "transparent",
      color: isActive ? "#111827" : "#6B7280",
      border: "none",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.title}>Transaction Data</div>
            {!hasActiveFilters && currentPage === 1 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#27AE60",
                }}
                title="Automatically refreshes to show new transactions"
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#27AE60",
                    opacity: isLiveUpdating ? 1 : 0.55,
                  }}
                />
                Live
              </span>
            )}
          </div>

          <div style={styles.controls}>
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
                size={14}
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
              onChange={(event) => setFromDate(event.target.value)}
              ref={fromInputRef}
              style={{ display: "none" }}
              type="date"
              value={fromDate}
            />
            <button
              onClick={() =>
                fromInputRef.current?.showPicker
                  ? fromInputRef.current.showPicker()
                  : fromInputRef.current?.click()
              }
              style={styles.dateButton}
              type="button"
            >
              <span>{fromDate || "From"}</span>
              <CalendarDays size={15} />
            </button>

            <input
              onChange={(event) => setToDate(event.target.value)}
              ref={toInputRef}
              style={{ display: "none" }}
              type="date"
              value={toDate}
            />
            <button
              onClick={() =>
                toInputRef.current?.showPicker
                  ? toInputRef.current.showPicker()
                  : toInputRef.current?.click()
              }
              style={styles.dateButton}
              type="button"
            >
              <span>{toDate || "To"}</span>
              <CalendarDays size={15} />
            </button>

            <button
              onClick={handleResetFilters}
              style={styles.resetButton}
              type="button"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowExportMenu((open) => !open)}
                style={styles.exportButton}
                type="button"
              >
                <Download size={14} />
                Export
                <FiChevronDown size={13} />
              </button>

              {showExportMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "6px",
                    width: "150px",
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                    zIndex: 30,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={exportCSV}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#3A3A3A",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                {[
                  "Sr.no",
                  "User ID",
                  "Merchant ID",
                  "Channel",
                  "Amount",
                  "Currency",
                  "Latitude",
                  "Longitude",
                  "Longitude 2",
                  "IP Address",
                  "Location",
                  "Device ID",
                  "Remark",
                  "Status",
                  "Created By",
                  "Created date",
                  "Updated At",
                ].map((column, idx) => (
                  <th key={`${column}-${idx}`} style={styles.th}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr style={styles.tr}>
                  <td colSpan={17} style={{ ...styles.td, textAlign: "center" }}>
                    Loading transactions...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr style={styles.tr}>
                  <td
                    colSpan={17}
                    style={{ ...styles.td, textAlign: "center", color: "#E0453C" }}
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentRows.length > 0 ? currentRows.map((row) => (
                <tr key={row.srNo} style={styles.tr}>
                  <td style={styles.td}>{row.srNo}</td>
                  <td style={styles.td}>{row.userId}</td>
                  <td style={styles.td}>{row.merchantId}</td>
                  <td style={styles.td}>{row.channel}</td>
                  <td style={styles.td}>{row.amount}</td>
                  <td style={styles.td}>{row.currency}</td>
                  <td style={styles.td}>{row.latitude}</td>
                  <td style={styles.td}>{row.longitude}</td>
                  <td style={styles.td}>{row.longitude2}</td>
                  <td style={styles.td}>{row.ipAddress}</td>
                  <td style={styles.td}>{row.location}</td>
                  <td style={styles.td}>{row.deviceId}</td>
                  <td
                    onClick={() =>
                      row.remark &&
                      row.remark !== "-" &&
                      setExpandedRemarkRow((current) =>
                        current === row.srNo ? null : row.srNo,
                      )
                    }
                    style={
                      expandedRemarkRow === row.srNo
                        ? styles.remarkTdExpanded
                        : {
                            ...styles.remarkTd,
                            cursor: row.remark && row.remark !== "-" ? "pointer" : "default",
                          }
                    }
                    title={
                      row.remark && row.remark !== "-"
                        ? expandedRemarkRow === row.srNo
                          ? "Click to collapse"
                          : "Click to view full remark"
                        : undefined
                    }
                  >
                    {row.remark}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusPill(row.status === "Active")}>
                      <span>{row.status}</span>
                      <span style={styles.statusDot(row.status === "Active")} />
                    </span>
                  </td>
                  <td style={styles.td}>{row.createdBy}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={styles.dateTimeDate}>{row.createdDate}</span>
                      <span style={styles.dateTimeTime}>{row.createdTime}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={styles.dateTimeDate}>{row.updatedDate}</span>
                      <span style={styles.dateTimeTime}>{row.updatedTime}</span>
                    </div>
                  </td>
                </tr>
              )) : (
                !isLoading &&
                !error && (
                  <tr style={styles.tr}>
                    <td colSpan={17} style={{ ...styles.td, textAlign: "center" }}>
                      No transaction data found.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.footerRow}>
          <div style={styles.footerText}>
            Showing <strong>{firstVisibleRecord}-{lastVisibleRecord}</strong> of{" "}
            <strong>{totalRecords}</strong> transactions
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() =>
                currentPage > 1 && setCurrentPage(currentPage - 1)
              }
              style={styles.pageArrow}
              type="button"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={styles.pageNumber(page === currentPage)}
                  type="button"
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              style={styles.pageArrow}
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseTransactionDate(value) {
  if (!value) {
    return null;
  }

  const [day, month, year] = String(value).split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}
