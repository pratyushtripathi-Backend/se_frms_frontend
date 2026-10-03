import { scrollIntoHorizontalStrip } from "./scrollPageStrip";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays, Download, RotateCcw, X } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import { getMatchedRules } from "../services/fraudDetailsService";
import Loader from "../../../components/ui/Loader";

const rowsPerPage = 10;

// Rows already loaded on this page, kept across visits (the page unmounts
// when you leave it) and keyed by page / size / year / from / to, so the
// table shows instantly when you come back and then refreshes quietly.
const pageCache = new Map();
const pageCacheKey = (requestedPage, size, year, startDate, endDate) =>
  JSON.stringify([requestedPage, size, year ?? "", startDate ?? "", endDate ?? ""]);

export default function MatchedRulePage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const initialCache = pageCache.get(pageCacheKey(0, rowsPerPage, "", "", ""));
  const [matchedRuleRows, setMatchedRuleRows] = useState(() => initialCache?.rows ?? []);
  const [totalRecords, setTotalRecords] = useState(() => initialCache?.totalRecords ?? 0);
  const [totalPages, setTotalPages] = useState(() => initialCache?.totalPages ?? 1);
  // Starts true when nothing is cached, so the first paint shows the
  // loader rather than flashing "No … found".
  const [isLoading, setIsLoading] = useState(() => !initialCache);
  const [errorMessage, setErrorMessage] = useState("");
  const [rulesModalRow, setRulesModalRow] = useState(null);
  // Drops responses for a page/filter you've already moved away from.
  const loadRequestIdRef = useRef(0);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const pageScrollRef = useRef(null);

  // Keeps the current page's button scrolled into view within the
  // horizontally-scrollable page-number strip (e.g. after using the
  // prev/next arrows to move past what's currently visible).
  useEffect(() => {
    const container = pageScrollRef.current;
    const activeButton = container?.querySelector(`[data-page="${currentPage}"]`);
    scrollIntoHorizontalStrip(activeButton);
  }, [currentPage, totalPages]);

  const loadMatchedRules = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;
    const cacheKey = pageCacheKey(currentPage - 1, rowsPerPage, year, fromDate, toDate);
    const cached = pageCache.get(cacheKey);

    if (cached) {
      setMatchedRuleRows(cached.rows);
      setTotalRecords(cached.totalRecords);
      setTotalPages(cached.totalPages);
      setIsLoading(false);
    } else {
      // The current rows stay on screen (dimmed) until the new ones arrive.
      setIsLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await getMatchedRules({
        page: currentPage - 1,
        size: rowsPerPage,
        year,
        startDate: fromDate,
        endDate: toDate,
      });
      const normalizedResponse = normalizeMatchedRuleResponse(
        response.data,
        currentPage,
        rowsPerPage,
      );

      if (requestId !== loadRequestIdRef.current) return;

      setMatchedRuleRows(normalizedResponse.rows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
      pageCache.set(cacheKey, {
        rows: normalizedResponse.rows,
        totalRecords: normalizedResponse.totalRecords,
        totalPages: normalizedResponse.totalPages,
      });
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return;
      // Keep showing the cached rows if a background refresh fails.
      if (cached) return;

      setMatchedRuleRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load matched rules. Please try again."),
      );
    } finally {
      if (requestId === loadRequestIdRef.current) setIsLoading(false);
    }
  }, [currentPage, year, fromDate, toDate]);

  useEffect(() => {
    loadMatchedRules();
  }, [loadMatchedRules]);

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const currentRows = useMemo(() => matchedRuleRows, [matchedRuleRows]);

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord =
    totalRecords === 0 ? 0 : Math.min(startRecord + currentRows.length - 1, totalRecords);

  const exportCSV = () => {
    const headers = [
      "Sr.no",
      "Transaction ID",
      "Scoring ID",
      "Matched Rule",
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
      row.scoringId,
      row.matchedRule,
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
    link.download = "matched-rule.csv";
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

    hiddenDateInput: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      border: "none",
      pointerEvents: "none",
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

    controlsDisabled: {
      opacity: 0.6,
      pointerEvents: "none",
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
      position: "relative",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflowX: "auto",
      background: "#FFFFFF",
    },

    tableBody: {
      transition: "opacity 0.15s ease",
    },

    loadingOverlay: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: "10px",
      zIndex: 5,
    },

    table: {
      width: "100%",
      minWidth: "1300px",
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

    matchedRuleTd: {
      padding: "10px 18px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#2563EB",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "360px",
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

    // Page-number strip shows 5 buttons at a time (32px button + 8px gap
    // each) and scrolls horizontally for the rest, same as Recent
    // Transactions on the dashboard.
    pageNumberScroll: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      overflowX: "auto",
      scrollBehavior: "smooth",
      maxWidth: `${5 * 32 + 4 * 8}px`,
      scrollbarWidth: "thin",
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
      flexShrink: 0,
    },

    pageNumber: (isActive) => ({
      width: "32px",
      height: "32px",
      flexShrink: 0,
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

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "24px",
    },

    modalCardWrapper: {
      position: "relative",
      width: "min(680px, 82%)",
      height: "min(380px, 58vh)",
    },

    modalCard: {
      background: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0 20px 45px rgba(0,0,0,.18)",
      height: "100%",
      overflow: "hidden",
    },

    modalCardScroll: {
      height: "100%",
      overflow: "auto",
      padding: "48px 24px 24px",
      boxSizing: "border-box",
    },

    modalCloseButton: {
      position: "absolute",
      top: "12px",
      right: "12px",
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      background: "#111111",
      color: "#FFFFFF",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,.25)",
    },

    modalTableContainer: {
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden",
    },

    modalTable: {
      width: "100%",
      minWidth: "0",
      tableLayout: "fixed",
      borderCollapse: "collapse",
    },

    modalTh: {
      textAlign: "left",
      padding: "8px 10px",
      fontSize: "11px",
      fontWeight: 600,
      color: "#555555",
      whiteSpace: "normal",
      wordBreak: "break-word",
      borderBottom: "1px solid #ECECEC",
      position: "sticky",
      top: 0,
      background: "#FAFAFA",
    },

    modalTd: {
      padding: "8px 10px",
      fontSize: "11px",
      color: "#555555",
      whiteSpace: "normal",
      wordBreak: "break-word",
      borderBottom: "1px solid #ECECEC",
    },

    modalRow: (isEven) => ({
      background: isEven ? "#FAFAFA" : "#FFFFFF",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.title}>Matched Rule</div>

          <div style={styles.controls}>
            <div style={{ position: "relative" }}>
              <select
                disabled={isLoading}
                onChange={(event) => setYear(event.target.value)}
                style={{
                  ...styles.yearSelect,
                  ...(isLoading ? styles.controlsDisabled : {}),
                }}
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

            <div style={{ position: "relative" }}>
              <input
                onChange={(event) => setFromDate(event.target.value)}
                ref={fromInputRef}
                style={styles.hiddenDateInput}
                type="date"
                value={fromDate}
              />
              <button
                disabled={isLoading}
                onClick={() =>
                  fromInputRef.current?.showPicker
                    ? fromInputRef.current.showPicker()
                    : fromInputRef.current?.click()
                }
                style={{
                  ...styles.dateButton,
                  ...(isLoading ? styles.controlsDisabled : {}),
                }}
                type="button"
              >
                <span>{fromDate || "From"}</span>
                <CalendarDays size={15} />
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <input
                onChange={(event) => setToDate(event.target.value)}
                ref={toInputRef}
                style={styles.hiddenDateInput}
                type="date"
                value={toDate}
              />
              <button
                disabled={isLoading}
                onClick={() =>
                  toInputRef.current?.showPicker
                    ? toInputRef.current.showPicker()
                    : toInputRef.current?.click()
                }
                style={{
                  ...styles.dateButton,
                  ...(isLoading ? styles.controlsDisabled : {}),
                }}
                type="button"
              >
                <span>{toDate || "To"}</span>
                <CalendarDays size={15} />
              </button>
            </div>

            <button
              disabled={isLoading}
              onClick={handleResetFilters}
              style={{
                ...styles.resetButton,
                ...(isLoading ? styles.controlsDisabled : {}),
              }}
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
                  "Scoring ID",
                  "Matched Rule",
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

            <tbody
              style={{
                ...styles.tableBody,
                // Lighter dim when there are rows, so they stay readable
                // under the loading overlay.
                opacity: isLoading && currentRows.length ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {errorMessage && (
                <tr style={styles.tr}>
                  <td
                    colSpan={8}
                    style={{ ...styles.td, color: "#FF4D4F", textAlign: "center" }}
                  >
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!errorMessage && currentRows.length === 0 && (
                <tr style={styles.tr}>
                  <td colSpan={8} style={{ ...styles.td, textAlign: "center" }}>
                    {isLoading ? " " : "No matched rules found."}
                  </td>
                </tr>
              )}

              {!errorMessage && currentRows.map((row) => (
                <tr key={row.srNo} style={styles.tr}>
                  <td style={styles.td}>{row.srNo}</td>
                  <td style={styles.td}>{row.transactionId}</td>
                  <td style={styles.td}>{row.scoringId}</td>
                  <td
                    style={{ ...styles.matchedRuleTd, cursor: "pointer" }}
                    title={row.matchedRule}
                    onClick={() => setRulesModalRow(row)}
                  >
                    Matched Rule....
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
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div style={styles.loadingOverlay}>
              <Loader label="Loading matched rules..." />
            </div>
          )}
        </div>

        <div style={styles.footerRow}>
          <div style={styles.footerText}>
            Showing <strong>{startRecord}-{endRecord}</strong> of{" "}
            <strong>{totalRecords}</strong> matched rules
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

            <div ref={pageScrollRef} style={styles.pageNumberScroll}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    data-page={page}
                    onClick={() => setCurrentPage(page)}
                    style={styles.pageNumber(page === currentPage)}
                    type="button"
                  >
                    {page}
                  </button>
                )
              )}
            </div>

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

      {rulesModalRow &&
        createPortal(
          <div
            style={styles.modalOverlay}
            onClick={() => setRulesModalRow(null)}
          >
            <div
              style={styles.modalCardWrapper}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setRulesModalRow(null)}
                style={styles.modalCloseButton}
                aria-label="Close"
              >
                <X size={14} />
              </button>

              <div style={styles.modalCard}>
                <div style={styles.modalCardScroll}>
                  <div style={styles.modalTableContainer}>
                  <table style={styles.modalTable}>
                    <thead>
                      <tr>
                        {[
                          "Rule Code",
                          "Rule Name",
                          "Rule Expression",
                          "Rule Score",
                          "Calculated Score",
                        ].map((column) => (
                          <th key={column} style={styles.modalTh}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {rulesModalRow.matchedRulesList.map((rule, index) => (
                        <tr key={index} style={styles.modalRow(index % 2 === 0)}>
                          <td style={styles.modalTd}>{rule.ruleCode}</td>
                          <td style={styles.modalTd}>{rule.ruleName}</td>
                          <td style={styles.modalTd}>{rule.ruleExpression}</td>
                          <td style={styles.modalTd}>{rule.ruleScore}</td>
                          <td style={styles.modalTd}>{rule.calculatedScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function normalizeMatchedRuleResponse(responseData, currentPage, pageSize) {
  const payload = responseData?.responseData ?? responseData?.data ?? responseData;
  const rows = findFirstArray(payload).map((row, index) =>
    normalizeMatchedRuleRow(row, (currentPage - 1) * pageSize + index + 1),
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

function normalizeMatchedRuleRow(row, srNo) {
  const created = splitDateTime(row.createdAt ?? row.createdDate);
  const updated = splitDateTime(row.updatedAt ?? row.updatedDate);

  return {
    srNo,
    transactionId:
      row.transactionId ??
      row.externalTransactionId ??
      row.txnId ??
      row.transaction?.id ??
      row.scoring?.transactionId ??
      findFirstString(row, [
        "transactionid",
        "txnid",
        "transaction_id",
        "externaltransactionid",
      ]) ??
      "-",
    scoringId: row.scoringId ?? row.scoreId ?? row.scoring?.id ?? "-",
    ruleId: row.ruleId ?? row.fraudRuleId ?? row.rule?.id ?? "-",
    matchedRule: resolveMatchedRuleLabel(row),
    matchedRulesList: resolveMatchedRulesList(row),
    status: normalizeMatchedRuleStatus(row.status ?? row.ruleStatus ?? row.isActive),
    createdBy: row.createdBy ?? "-",
    createdDate: created.date,
    createdTime: created.time,
    updatedDate: updated.date,
    updatedTime: updated.time,
  };
}

// A transaction can match more than one fraud rule at once. When the API
// nests them (row.matchedRules / row.rules), every one of them is shown in
// the "Matched Rule" popup; otherwise this row's own flat rule fields are
// used as the single entry so the popup still has something to show.
function resolveMatchedRulesList(row) {
  const nestedList =
    (Array.isArray(row.matchedRules) && row.matchedRules.length > 0 && row.matchedRules) ||
    (Array.isArray(row.rules) && row.rules.length > 0 && row.rules) ||
    null;

  if (nestedList) {
    return nestedList.map((rule) => ({
      ruleCode: rule.ruleCode ?? rule.code ?? rule.rule?.code ?? "-",
      ruleName: rule.ruleName ?? rule.name ?? rule.rule?.name ?? "-",
      ruleExpression:
        rule.ruleExpression ??
        rule.expression ??
        rule.condition ??
        rule.ruleCondition ??
        "-",
      ruleScore: rule.ruleScore ?? rule.score ?? "-",
      calculatedScore:
        rule.calculatedScore ?? rule.calculatedRiskScore ?? rule.finalScore ?? "-",
    }));
  }

  return [
    {
      ruleCode: row.ruleCode ?? row.code ?? row.rule?.code ?? "-",
      ruleName: row.ruleName ?? row.name ?? row.rule?.name ?? "-",
      ruleExpression:
        row.ruleExpression ??
        row.expression ??
        row.condition ??
        row.ruleCondition ??
        row.rule?.expression ??
        row.rule?.condition ??
        findFirstString(row, [
          "ruleexpression",
          "expression",
          "condition",
          "rulecondition",
          "criteria",
          "logic",
        ]) ??
        "-",
      ruleScore: row.ruleScore ?? row.score ?? row.rule?.score ?? "-",
      calculatedScore:
        row.calculatedScore ?? row.calculatedRiskScore ?? row.finalScore ?? "-",
    },
  ];
}

function resolveMatchedRuleLabel(row) {
  const ruleName = row.ruleName ?? row.name ?? row.rule?.name;
  if (ruleName) return ruleName;

  const ruleExpression =
    row.ruleExpression ??
    row.expression ??
    row.condition ??
    row.ruleCondition ??
    row.rule?.expression ??
    row.rule?.condition ??
    findFirstString(row, [
      "ruleexpression",
      "expression",
      "condition",
      "rulecondition",
      "criteria",
      "logic",
    ]);
  if (ruleExpression) return ruleExpression;

  const ruleCode = row.ruleCode ?? row.code ?? row.rule?.code;
  if (ruleCode) return ruleCode;

  return "-";
}

function normalizeMatchedRuleStatus(value) {
  if (typeof value === "boolean") {
    return value ? "Active" : "Inactive";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const normalized = String(value).trim().toLowerCase();

  if (["active", "success", "completed", "approved", "true", "matched"].includes(normalized)) {
    return "Active";
  }

  if (["inactive", "failed", "rejected", "false"].includes(normalized)) {
    return "Inactive";
  }

  return String(value);
}

function findFirstString(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return undefined;

  visited.add(value);

  const normalizedKeys = keys.map((key) => key.toLowerCase());

  for (const [objectKey, candidate] of Object.entries(value)) {
    if (!normalizedKeys.includes(objectKey.toLowerCase())) continue;

    if (typeof candidate === "string" && candidate.trim()) return candidate;

    if (typeof candidate === "number") return String(candidate);
  }

  for (const childValue of Object.values(value)) {
    if (childValue && typeof childValue === "object") {
      const found = findFirstString(childValue, keys, visited);

      if (found !== undefined) return found;
    }
  }

  return undefined;
}

function findFirstArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const directKeys = ["content", "records", "items", "data", "list", "matchedRules", "rules"];
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
