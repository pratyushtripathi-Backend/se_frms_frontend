import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays, Download, RotateCcw } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import { getScoringHistory } from "../services/fraudDetailsService";

const rowsPerPage = 10;

export default function ScoringTablePage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [scoringRows, setScoringRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const loadScoringHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getScoringHistory({
        page: currentPage - 1,
        size: rowsPerPage,
      });
      const normalizedResponse = normalizeScoringResponse(
        response.data,
        currentPage,
        rowsPerPage,
      );

      setScoringRows(normalizedResponse.rows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
    } catch (error) {
      setScoringRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load scoring table. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadScoringHistory();
  }, [loadScoringHistory]);

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const currentRows = useMemo(() => scoringRows, [scoringRows]);

  const exportCSV = () => {
    const headers = [
      "Sr.no",
      "Transaction ID",
      "Total Risk Score",
      "Status",
      "Created By",
      "Created Date",
      "Created Time",
      "Updated Date",
      "Updated Time",
    ];

    const csvRows = currentRows.map((row) => [
      row.srNo,
      row.transactionId,
      row.totalRiskScore,
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
    link.download = "scoring-table.csv";
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
      minWidth: "1000px",
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
          <div style={styles.title}>Scoring Table</div>

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
                  "Transaction ID",
                  "Total Risk Score",
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
                  <td colSpan={7} style={{ ...styles.td, textAlign: "center" }}>
                    Loading scoring table...
                  </td>
                </tr>
              )}

              {!isLoading && errorMessage && (
                <tr style={styles.tr}>
                  <td
                    colSpan={7}
                    style={{ ...styles.td, color: "#FF4D4F", textAlign: "center" }}
                  >
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && currentRows.length === 0 && (
                <tr style={styles.tr}>
                  <td colSpan={7} style={{ ...styles.td, textAlign: "center" }}>
                    No scoring records found.
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && currentRows.map((row) => (
                <tr key={row.srNo} style={styles.tr}>
                  <td style={styles.td}>{row.srNo}</td>
                  <td style={styles.td}>{row.transactionId}</td>
                  <td style={styles.td}>{row.totalRiskScore}</td>
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
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.footerRow}>
          <div style={styles.footerText}>
            Showing <strong>{currentRows.length}</strong> of{" "}
            <strong>{totalRecords}</strong> scoring records
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() =>
                currentPage > 1 && setCurrentPage(currentPage - 1)
              }
              disabled={currentPage <= 1 || isLoading}
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
              disabled={currentPage >= totalPages || isLoading}
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

function normalizeScoringResponse(responseData, currentPage, pageSize) {
  const payload = responseData?.responseData ?? responseData?.data ?? responseData;
  const rows = findFirstArray(payload).map((row, index) =>
    normalizeScoringRow(row, (currentPage - 1) * pageSize + index + 1),
  );
  const totalRecords =
    findFirstNumber(payload, ["totalElements", "totalRecords", "totalItems", "total"]) ??
    rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeScoringRow(row, srNo) {
  const created = splitDateTime(row.createdAt ?? row.createdDate);
  const updated = splitDateTime(row.updatedAt ?? row.updatedDate);

  return {
    srNo,
    transactionId:
      row.transactionId ??
      row.externalTransactionId ??
      row.txnId ??
      row.transaction?.id ??
      "-",
    totalRiskScore:
      row.totalRiskScore ??
      row.riskScore ??
      row.score ??
      row.totalScore ??
      "-",
    status: normalizeScoringStatus(row.status ?? row.scoringStatus ?? row.isActive),
    createdBy: row.createdBy ?? "-",
    createdDate: created.date,
    createdTime: created.time,
    updatedDate: updated.date,
    updatedTime: updated.time,
  };
}

function normalizeScoringStatus(value) {
  if (typeof value === "boolean") {
    return value ? "Active" : "Inactive";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const normalized = String(value).trim().toLowerCase();

  if (["active", "success", "completed", "approved", "true"].includes(normalized)) {
    return "Active";
  }

  if (["inactive", "failed", "rejected", "false"].includes(normalized)) {
    return "Inactive";
  }

  return String(value);
}

function findFirstArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const directKeys = ["content", "records", "items", "data", "list", "history", "scoringHistory"];
  for (const key of directKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  for (const nestedValue of Object.values(value)) {
    const result = findFirstArray(nestedValue);
    if (result.length > 0) return result;
  }

  return [];
}

function findFirstNumber(value, keys) {
  if (!value || typeof value !== "object") return null;

  for (const key of keys) {
    const numberValue = Number(value[key]);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return null;
}

function splitDateTime(value) {
  if (!value) return { date: "-", time: "-" };
  const dateValue = new Date(value);

  if (!Number.isNaN(dateValue.getTime())) {
    return {
      date: dateValue.toLocaleDateString("en-GB"),
      time: dateValue.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const [date = "-", time = "-"] = String(value).split(/[T ]/);
  return {
    date,
    time: time ? time.slice(0, 5) : "-",
  };
}
