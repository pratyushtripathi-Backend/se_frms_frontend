import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays, RotateCcw, X } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  getCases,
  updateDecisionReview,
} from "../services/fraudDetailsService";

const TABS = [
  { key: "REVIEW", label: "Under Review" },
  { key: "ALLOW", label: "Allowed" },
  { key: "BLOCK", label: "Blocked" },
];

const BASE_COLUMNS = [
  "Sr no",
  "User Name",
  "Transaction ID",
  "Amount",
  "Matched Rule",
  "Total Risk",
  "Mode",
  "Created By",
  "Created date",
  "Updated At",
  "Status",
];

const rowsPerPage = 10;

const statusPillStyles = {
  "Under Review":
    "bg-[#E7F9F0] text-[#1DBF73] border border-[#1DBF73]/30",
  Allowed: "bg-[#219653] text-white",
  Blocked:
    "bg-[#FDEDEE] text-[#EB5757] border border-[#EB5757]/30",
};

export default function CaseManagementPage() {
  const [activeTab, setActiveTab] = useState("REVIEW");

  // =========================
  // FILTER STATE
  // =========================
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [openMenuSrNo, setOpenMenuSrNo] = useState(null);

  const [caseRows, setCaseRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [pendingSrNo, setPendingSrNo] = useState(null);
  const [actionErrors, setActionErrors] = useState({});

  // Case whose matched rules are shown in the "Matched Rule...." popup.
  const [rulesModalRow, setRulesModalRow] = useState(null);

  // Smooth tab switching:
  // - casesCacheRef keeps each tab/page/filter result already loaded, so
  //   switching back to a tab shows its rows instantly (then refreshes
  //   quietly in the background);
  // - loadRequestIdRef drops responses for a tab/page you've already left,
  //   so a slow older request can't overwrite the tab you're on.
  const casesCacheRef = useRef(new Map());
  const loadRequestIdRef = useRef(0);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const menuRef = useRef(null);

  const showActionColumn = activeTab === "REVIEW";

  const tableColumns = showActionColumn
    ? [...BASE_COLUMNS, "Action"]
    : BASE_COLUMNS;

  // =========================
  // FILTER ACTIVE
  // =========================
  const hasActiveFilters = Boolean(
    year || fromDate || toDate,
  );

  // =========================
  // LOAD CASES
  // =========================
  const loadCases = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;
    const cacheKey = JSON.stringify([
      activeTab,
      currentPage,
      year,
      fromDate,
      toDate,
    ]);
    const cached = casesCacheRef.current.get(cacheKey);

    if (cached) {
      setCaseRows(cached.rows);
      setTotalRecords(cached.totalRecords);
      setTotalPages(cached.totalPages);
      setIsLoading(false);
    } else {
      // Previous rows stay on screen (dimmed) until the new ones arrive,
      // instead of the table collapsing to a single "Loading" line.
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      /*
       * When date/year filters are active, fetch all pages
       * so filtering is performed against the complete case set.
       *
       * Without filters, keep the existing backend pagination.
       */
      const requestedPage = hasActiveFilters
        ? 0
        : currentPage - 1;

      const response = await getCases({
        status: activeTab,
        page: requestedPage,
        size: rowsPerPage,
      });

      const normalizedResponse = normalizeCaseResponse(
        response.data,
        requestedPage + 1,
        rowsPerPage,
      );

      let allRows = [...normalizedResponse.rows];

      /*
       * Fetch remaining backend pages when filtering.
       */
      if (
        hasActiveFilters &&
        normalizedResponse.totalPages > 1
      ) {
        const remainingResponses = await Promise.all(
          Array.from(
            {
              length: normalizedResponse.totalPages - 1,
            },
            (_, index) =>
              getCases({
                status: activeTab,
                page: index + 1,
                size: rowsPerPage,
              }),
          ),
        );

        remainingResponses.forEach((pageResponse, index) => {
          const normalizedPage = normalizeCaseResponse(
            pageResponse.data,
            index + 2,
            rowsPerPage,
          );

          allRows.push(...normalizedPage.rows);
        });
      }

      /*
       * Apply Year + From Date + To Date filters.
       */
      const filteredRows = allRows.filter((row) => {
        const createdDate = parseCaseDate(
          row.createdAtRaw ?? row.createdDateRaw ?? row.createdDate,
        );

        const matchesYear =
          !year ||
          getCaseYear(
            row.createdAtRaw ??
              row.createdDateRaw ??
              row.createdDate,
          ) === year;

        const matchesFromDate =
          !fromDate ||
          !createdDate ||
          createdDate >=
            new Date(`${fromDate}T00:00:00`);

        const matchesToDate =
          !toDate ||
          !createdDate ||
          createdDate <=
            new Date(`${toDate}T23:59:59`);

        return (
          matchesYear &&
          matchesFromDate &&
          matchesToDate
        );
      });

      /*
       * Re-number filtered rows so pagination remains clean.
       */
      const effectiveRows = hasActiveFilters
        ? filteredRows.map((row, index) => ({
            ...row,
            srNo:
              (currentPage - 1) * rowsPerPage +
              index +
              1,
          }))
        : filteredRows;

      const effectiveTotalRecords = hasActiveFilters
        ? filteredRows.length
        : normalizedResponse.totalRecords;

      const effectiveTotalPages = hasActiveFilters
        ? Math.max(
            Math.ceil(
              filteredRows.length / rowsPerPage,
            ),
            1,
          )
        : Math.max(
            normalizedResponse.totalPages,
            1,
          );

      /*
       * When filters are active, show only the current page
       * from the locally filtered result.
       */
      const visibleRows = hasActiveFilters
        ? filteredRows
            .slice(
              (currentPage - 1) * rowsPerPage,
              currentPage * rowsPerPage,
            )
            .map((row, index) => ({
              ...row,
              srNo:
                (currentPage - 1) *
                  rowsPerPage +
                index +
                1,
            }))
        : effectiveRows;

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setCaseRows(visibleRows);
      setTotalRecords(effectiveTotalRecords);
      setTotalPages(effectiveTotalPages);

      casesCacheRef.current.set(cacheKey, {
        rows: visibleRows,
        totalRecords: effectiveTotalRecords,
        totalPages: effectiveTotalPages,
      });

      // Preload page 1 of the other tabs in the background so the first
      // switch to them is instant too.
      if (!hasActiveFilters && currentPage === 1) {
        TABS.forEach((tab) => {
          const tabKey = JSON.stringify([tab.key, 1, "", "", ""]);

          if (
            tab.key === activeTab ||
            casesCacheRef.current.has(tabKey)
          ) {
            return;
          }

          getCases({ status: tab.key, page: 0, size: rowsPerPage })
            .then((tabResponse) => {
              const normalizedTab = normalizeCaseResponse(
                tabResponse.data,
                1,
                rowsPerPage,
              );

              casesCacheRef.current.set(tabKey, {
                rows: normalizedTab.rows,
                totalRecords: normalizedTab.totalRecords,
                totalPages: Math.max(normalizedTab.totalPages, 1),
              });
            })
            .catch(() => {});
        });
      }
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      // Keep showing the cached rows if a background refresh fails.
      if (cached) {
        return;
      }

      setCaseRows([]);
      setTotalRecords(0);
      setTotalPages(1);

      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to load case management data. Please try again.",
        ),
      );
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    activeTab,
    currentPage,
    hasActiveFilters,
    year,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // =========================
  // TAB CHANGE
  // =========================
  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuSrNo(null);
    setActionErrors({});
  }, [activeTab]);

  // =========================
  // RESET PAGE WHEN FILTERS
  // CHANGE
  // =========================
  useEffect(() => {
    setCurrentPage(1);
  }, [year, fromDate, toDate]);

  // =========================
  // CLOSE ACTION MENU
  // =========================
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuSrNo(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // =========================
  // FILTER HANDLERS
  // =========================
  const handleYearChange = (value) => {
    setYear(value);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // =========================
  // REVIEW ACTION
  // =========================
  const handleReviewAction = async (
    row,
    reviewStatus,
  ) => {
    setOpenMenuSrNo(null);

    setActionErrors((prev) => ({
      ...prev,
      [row.srNo]: "",
    }));

    if (!row.decisionId) {
      setActionErrors((prev) => ({
        ...prev,
        [row.srNo]:
          "Missing decision id for this case; cannot update review status.",
      }));

      return;
    }

    setPendingSrNo(row.srNo);

    try {
      await updateDecisionReview(
        row.decisionId,
        reviewStatus,
      );

      // The case moved to another tab, so every cached tab is out of date.
      casesCacheRef.current.clear();
      await loadCases();
    } catch (error) {
      setActionErrors((prev) => ({
        ...prev,
        [row.srNo]: getAuthErrorMessage(
          error,
          "Unable to update the decision. Please try again.",
        ),
      }));
    } finally {
      setPendingSrNo(null);
    }
  };

  // =========================
  // PAGINATION
  // =========================
  const visiblePages = useMemo(() => {
    const pageCount = Math.max(totalPages, 1);

    const start = Math.max(
      Math.min(
        currentPage - 2,
        pageCount - 4,
      ),
      1,
    );

    const end = Math.min(
      start + 4,
      pageCount,
    );

    return Array.from(
      {
        length: end - start + 1,
      },
      (_, index) => start + index,
    );
  }, [currentPage, totalPages]);

  const showingFrom =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          rowsPerPage +
        1;

  const showingTo = Math.min(
    currentPage * rowsPerPage,
    totalRecords,
  );

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* =========================
            HEADER
        ========================== */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Case Management Details
          </h2>

          {/* STATUS TABS */}
          <div className="flex items-center gap-1 rounded-lg bg-[#F4F5F9] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#333333] text-white"
                    : "text-[#6B7280] hover:text-[#202224]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* =========================
            FILTER CONTROLS
        ========================== */}
        <div className="mb-5 flex flex-wrap items-center justify-end gap-3">

          {/* YEAR */}
          <div className="relative">
            <select
              value={year}
              disabled={isLoading}
              onChange={(event) =>
                handleYearChange(
                  event.target.value,
                )
              }
              className={`h-10 w-[105px] appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 pr-8 text-[12px] text-[#202224] outline-none ${
                isLoading
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <option value="">Year</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <FiChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
            />
          </div>

          {/* FROM DATE */}
          <div className="relative">
            <input
              ref={fromInputRef}
              type="date"
              value={fromDate}
              onChange={(event) =>
                handleFromDateChange(
                  event.target.value,
                )
              }
              className="pointer-events-none absolute left-0 top-0 h-10 w-full opacity-0"
            />

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (
                  fromInputRef.current?.showPicker
                ) {
                  fromInputRef.current.showPicker();
                } else {
                  fromInputRef.current?.click();
                }
              }}
              className={`flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 text-[12px] ${
                fromDate
                  ? "text-[#202224]"
                  : "text-[#808080]"
              } ${
                isLoading
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <span>
                {fromDate || "From"}
              </span>

              <CalendarDays size={15} />
            </button>
          </div>

          {/* TO DATE */}
          <div className="relative">
            <input
              ref={toInputRef}
              type="date"
              value={toDate}
              onChange={(event) =>
                handleToDateChange(
                  event.target.value,
                )
              }
              className="pointer-events-none absolute left-0 top-0 h-10 w-full opacity-0"
            />

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (
                  toInputRef.current?.showPicker
                ) {
                  toInputRef.current.showPicker();
                } else {
                  toInputRef.current?.click();
                }
              }}
              className={`flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 text-[12px] ${
                toDate
                  ? "text-[#202224]"
                  : "text-[#808080]"
              } ${
                isLoading
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <span>
                {toDate || "To"}
              </span>

              <CalendarDays size={15} />
            </button>
          </div>

          {/* RESET */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleResetFilters}
            className={`flex h-10 items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white transition-colors hover:bg-[#222222] ${
              isLoading
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        {/* =========================
            ACTIVE FILTER INDICATOR
        ========================== */}
        {hasActiveFilters && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2">
            <span className="text-[12px] text-[#6B7280]">
              Filters applied
              {year && (
                <span className="ml-2 font-semibold text-[#333333]">
                  Year: {year}
                </span>
              )}

              {fromDate && (
                <span className="ml-2 font-semibold text-[#333333]">
                  From: {fromDate}
                </span>
              )}

              {toDate && (
                <span className="ml-2 font-semibold text-[#333333]">
                  To: {toDate}
                </span>
              )}
            </span>

            <span className="text-[11px] text-[#7A7A7A]">
              {totalRecords} result
              {totalRecords === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {/* =========================
            TABLE
        ========================== */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="relative w-full overflow-x-auto">
            {isLoading && caseRows.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-16">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#333333]" />
              </div>
            )}


            <table
              className={`w-full border-collapse ${
                showActionColumn
                  ? "min-w-[1450px]"
                  : "min-w-[1350px]"
              }`}
            >
              <thead className="bg-[#F8F9FB]">
                <tr>
                  {tableColumns.map(
                    (column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap border-b border-[#ECECEC] px-4 py-4 text-left text-[13px] font-semibold text-[#5A5A5A]"
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody
                className={`transition-opacity duration-200 ${
                  isLoading && caseRows.length > 0 ? "opacity-50" : "opacity-100"
                }`}
              >
                {isLoading && caseRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={
                        tableColumns.length
                      }
                      className="px-4 py-6 text-center text-[13px] text-[#7A7A7A]"
                    >
                      Loading case management data...
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  errorMessage && (
                    <tr>
                      <td
                        colSpan={
                          tableColumns.length
                        }
                        className="px-4 py-6 text-center text-[13px] text-[#EB5757]"
                      >
                        {errorMessage}
                      </td>
                    </tr>
                  )}

                {!isLoading &&
                  !errorMessage &&
                  caseRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={
                          tableColumns.length
                        }
                        className="px-4 py-6 text-center text-[13px] text-[#7A7A7A]"
                      >
                        No cases found.
                      </td>
                    </tr>
                  )}

                {!errorMessage &&
                  caseRows.map(
                    (row, index) => {
                      const isMenuOpen =
                        openMenuSrNo ===
                        row.srNo;

                      const isRowPending =
                        pendingSrNo ===
                        row.srNo;

                      const rowError =
                        actionErrors[
                          row.srNo
                        ];

                      const opensUpward =
                        index >=
                        caseRows.length - 2;

                      return (
                        <tr
                          key={`${row.decisionId ?? "case"}-${row.srNo}`}
                          className="border-b border-[#EEF1F5] text-[13px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                        >
                          <td className="px-4 py-4 font-medium">
                            {row.srNo}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.userName}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.transactionId}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.amount}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.matchedRulesList.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setRulesModalRow(row)}
                                title={row.matchedRule}
                                className="font-semibold text-[#2563EB] hover:underline"
                              >
                                Matched Rule....
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.totalRisk}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.mode}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {row.createdBy}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col leading-5">
                              <span className="font-medium text-[#2F80ED]">
                                {row.createdDate}
                              </span>

                              <span className="text-[#27AE60]">
                                {row.createdTime}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col leading-5">
                              <span className="font-medium text-[#2F80ED]">
                                {row.updatedDate}
                              </span>

                              <span className="text-[#27AE60]">
                                {row.updatedTime}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${
                                statusPillStyles[
                                  row.status
                                ] ??
                                statusPillStyles[
                                  "Under Review"
                                ]
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>

                          {showActionColumn && (
                            <td className="relative px-4 py-4">
                              <div
                                ref={
                                  isMenuOpen
                                    ? menuRef
                                    : null
                                }
                                className="relative"
                              >
                                <button
                                  type="button"
                                  disabled={
                                    isRowPending
                                  }
                                  onClick={() =>
                                    setOpenMenuSrNo(
                                      (current) =>
                                        current ===
                                        row.srNo
                                          ? null
                                          : row.srNo,
                                    )
                                  }
                                  className="flex h-8 w-[92px] items-center justify-center gap-1 rounded-md bg-[#333333] text-[13px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isRowPending
                                    ? "..."
                                    : "Select"}

                                  {!isRowPending && (
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 10 10"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M2 3.5L5 6.5L8 3.5"
                                        stroke="white"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </button>

                                {isMenuOpen && (
                                  <div
                                    className={`absolute right-0 z-20 w-[110px] overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-lg ${
                                      opensUpward
                                        ? "bottom-full mb-1"
                                        : "mt-1"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReviewAction(
                                          row,
                                          "ALLOW",
                                        )
                                      }
                                      className="block w-full px-3 py-2 text-left text-[13px] text-[#219653] hover:bg-[#F8F8F8]"
                                    >
                                      Allow
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReviewAction(
                                          row,
                                          "BLOCK",
                                        )
                                      }
                                      className="block w-full px-3 py-2 text-left text-[13px] text-[#EB5757] hover:bg-[#F8F8F8]"
                                    >
                                      Block
                                    </button>
                                  </div>
                                )}
                              </div>

                              {rowError && (
                                <div className="absolute left-4 top-full z-10 mt-1 w-[220px] text-[11px] text-[#EB5757]">
                                  {rowError}
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    },
                  )}
              </tbody>
            </table>
          </div>

          {/* =========================
              PAGINATION FOOTER
          ========================== */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ECECEC] bg-white px-6 py-4">

            <p className="text-[13px] text-[#7A7A7A]">
              Showing{" "}
              <strong>
                {showingFrom}
                {totalRecords > 0 &&
                  `-${showingTo}`}
              </strong>{" "}
              of{" "}
              <strong>
                {totalRecords}
              </strong>{" "}
              cases
            </p>

            <div className="flex items-center gap-2">

              {/* PREVIOUS */}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        page - 1,
                        1,
                      ),
                  )
                }
                disabled={
                  currentPage <= 1 ||
                  isLoading
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiChevronLeft
                  size={14}
                />
              </button>

              {/* PAGE NUMBERS */}
              {visiblePages.map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page,
                      )
                    }
                    disabled={isLoading}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                      page ===
                      currentPage
                        ? "bg-[#F3F4F6] text-[#111827]"
                        : "text-[#6B7280] hover:bg-[#F8F8F8]"
                    } disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* NEXT */}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        page + 1,
                        totalPages,
                      ),
                  )
                }
                disabled={
                  currentPage >=
                    totalPages ||
                  isLoading
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiChevronRight
                  size={14}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Matched rules popup — same design as the Matched Rule page:
          one row per rule matched by this case's transaction. */}
      {rulesModalRow &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-6"
            onClick={() => setRulesModalRow(null)}
          >
            <div
              className="relative h-[min(380px,58vh)] w-[min(680px,82%)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setRulesModalRow(null)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_2px_6px_rgba(0,0,0,.25)]"
              >
                <X size={14} />
              </button>

              <div className="h-full overflow-hidden rounded-xl bg-white shadow-[0_20px_45px_rgba(0,0,0,.18)]">
                <div className="h-full overflow-auto px-6 pb-6 pt-12">
                  <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB]">
                    <table className="w-full table-fixed border-collapse">
                      <thead>
                        <tr>
                          {[
                            "Rule Code",
                            "Rule Name",
                            "Rule Expression",
                            "Rule Score",
                            "Calculated Score",
                          ].map((column) => (
                            <th
                              key={column}
                              className="sticky top-0 break-words border-b border-[#ECECEC] bg-[#FAFAFA] px-2.5 py-2 text-left text-[11px] font-semibold text-[#555555]"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {rulesModalRow.matchedRulesList.map((rule, index) => (
                          <tr
                            key={`${rule.ruleCode}-${index}`}
                            className={index % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"}
                          >
                            {[
                              rule.ruleCode,
                              rule.ruleName,
                              rule.ruleExpression,
                              rule.ruleScore,
                              rule.calculatedScore,
                            ].map((value, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="break-words border-b border-[#ECECEC] px-2.5 py-2 text-[11px] text-[#555555]"
                              >
                                {value}
                              </td>
                            ))}
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

/* ============================================================
   RESPONSE NORMALIZATION
============================================================ */

function normalizeCaseResponse(
  responseData,
  currentPage,
  pageSize,
) {
  const payload =
    responseData?.responseData ??
    responseData?.data ??
    responseData;

  const rawRows = findFirstArray(payload);

  // Latest case first.
  const sortedRawRows = [...rawRows].sort(
    (a, b) => {
      const dateA = new Date(
        a?.createdAt ??
          a?.createdDate ??
          0,
      ).getTime();

      const dateB = new Date(
        b?.createdAt ??
          b?.createdDate ??
          0,
      ).getTime();

      return dateB - dateA;
    },
  );

  const rows = sortedRawRows.map(
    (row, index) =>
      normalizeCaseRow(
        row,
        (currentPage - 1) *
          pageSize +
          index +
          1,
      ),
  );

  const totalRecords =
    findFirstNumber(payload, [
      "totalElements",
      "totalRecords",
      "totalItems",
      "total",
    ]) ?? rows.length;

  const totalPages =
    findFirstNumber(payload, [
      "totalPages",
      "pages",
    ]) ??
    Math.max(
      Math.ceil(
        totalRecords / pageSize,
      ),
      1,
    );

  return {
    rows,
    totalRecords,
    totalPages: Math.max(
      totalPages,
      1,
    ),
  };
}

/* ============================================================
   CASE ROW NORMALIZATION
============================================================ */

function normalizeCaseRow(
  row,
  srNo,
) {
  const createdValue =
    row.createdAt ??
    row.createdDate;

  const updatedValue =
    row.updatedAt ??
    row.updatedDate;

  const created =
    splitDateTime(createdValue);

  const updated =
    splitDateTime(updatedValue);

  return {
    srNo,

    decisionId:
      row.decisionId ??
      row.id ??
      row.caseId ??
      findFirstString(row, [
        "decisionid",
        "id",
        "caseid",
      ]) ??
      null,

    userName:
      row.userName ??
      row.customerName ??
      row.customer?.name ??
      row.userId ??
      findFirstString(row, [
        "username",
        "customername",
        "name",
        "userid",
        "customerid",
      ]) ??
      "-",

    transactionId:
      row.transactionId ??
      row.externalTransactionId ??
      row.txnId ??
      row.transaction?.id ??
      "-",

    amount: formatCaseAmount(
      row.amount ??
        row.transactionAmount ??
        row.txnAmount,
    ),

    matchedRule:
      formatMatchedRules(row),

    matchedRulesList:
      resolveCaseMatchedRules(row),

    totalRisk:
      row.totalRiskScore ??
      row.riskScore ??
      row.score ??
      row.totalScore ??
      "-",

    mode:
      row.mode ??
      row.channel ??
      row.paymentChannel ??
      row.transactionChannel ??
      "-",

    createdBy:
      row.createdBy ?? "-",

    createdDate:
      created.date,

    createdTime:
      created.time,

    updatedDate:
      updated.date,

    updatedTime:
      updated.time,

    /*
     * Keep the raw creation timestamp so
     * Year / From / To filtering can use
     * the actual backend date.
     */
    createdAtRaw:
      createdValue ?? null,

    status:
      normalizeCaseStatus(
        row.finalDecision ??
          row.status ??
          row.caseStatus ??
          row.reviewStatus,
      ),
  };
}

/* ============================================================
   MATCHED RULE
============================================================ */

// One entry per matched rule for the "Matched Rule...." popup. Cases from
// GET /decisions/cases carry a matchedRules array (looked up from the scoring
// service by scoringId); a case with only a flat rule field shows that one
// rule; a case with no rule info at all gets an empty list (cell shows "-").
function resolveCaseMatchedRules(row) {
  const pick = (...values) =>
    values.find(
      (value) => value !== null && value !== undefined && value !== "",
    ) ?? "-";

  if (Array.isArray(row.matchedRules) && row.matchedRules.length > 0) {
    return row.matchedRules.map((rule) => ({
      ruleCode: pick(rule.ruleCode, rule.code, rule.ruleId, rule.rule?.code),
      ruleName: pick(rule.ruleName, rule.name, rule.rule?.name),
      ruleExpression: pick(
        rule.ruleExpression,
        rule.expression,
        rule.condition,
        rule.ruleCondition,
        rule.rule?.expression,
      ),
      ruleScore: pick(rule.ruleScore, rule.score, rule.rule?.score),
      calculatedScore: pick(
        rule.calculatedScore,
        rule.calculatedRiskScore,
        rule.finalScore,
      ),
    }));
  }

  const flatName = row.matchedRule ?? row.ruleName ?? row.rule?.name;

  if (!flatName && !row.ruleCode && !row.ruleExpression) {
    return [];
  }

  return [
    {
      ruleCode: pick(row.ruleCode, row.rule?.code),
      ruleName: pick(flatName),
      ruleExpression: pick(row.ruleExpression, row.rule?.expression),
      ruleScore: pick(row.ruleScore, row.rule?.score),
      calculatedScore: pick(row.calculatedScore),
    },
  ];
}

function formatMatchedRules(row) {
  if (
    Array.isArray(
      row.matchedRules,
    ) &&
    row.matchedRules.length > 0
  ) {
    const names =
      row.matchedRules
        .map(
          (rule) =>
            rule.ruleName ??
            rule.ruleCode ??
            rule.ruleExpression,
        )
        .filter(Boolean);

    if (names.length > 0) {
      return names.join(", ");
    }
  }

  return (
    row.matchedRule ??
    row.ruleName ??
    row.rule?.name ??
    row.ruleExpression ??
    findFirstString(row, [
      "matchedrule",
      "rulename",
      "ruleexpression",
      "rule",
    ]) ??
    "-"
  );
}

/* ============================================================
   STATUS
============================================================ */

function normalizeCaseStatus(
  value,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Under Review";
  }

  const normalized = String(
    value,
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (
    [
      "allow",
      "allowed",
      "approved",
    ].includes(normalized)
  ) {
    return "Allowed";
  }

  if (
    [
      "block",
      "blocked",
      "rejected",
    ].includes(normalized)
  ) {
    return "Blocked";
  }

  if (
    [
      "review",
      "underreview",
      "pending",
      "open",
    ].includes(normalized)
  ) {
    return "Under Review";
  }

  return String(value);
}

/* ============================================================
   AMOUNT
============================================================ */

function formatCaseAmount(
  value,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const numericValue =
    Number(value);

  if (
    Number.isNaN(
      numericValue,
    )
  ) {
    return String(value);
  }

  return numericValue.toLocaleString(
    "en-IN",
  );
}

/* ============================================================
   SEARCH STRING
============================================================ */

function findFirstString(
  value,
  keys,
  visited = new Set(),
) {
  if (
    !value ||
    typeof value !== "object" ||
    visited.has(value)
  ) {
    return undefined;
  }

  visited.add(value);

  const normalizedKeys =
    keys.map((key) =>
      key.toLowerCase(),
    );

  for (const [
    objectKey,
    candidate,
  ] of Object.entries(value)) {
    if (
      !normalizedKeys.includes(
        objectKey.toLowerCase(),
      )
    ) {
      continue;
    }

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate;
    }

    if (
      typeof candidate ===
      "number"
    ) {
      return String(candidate);
    }
  }

  for (const childValue of Object.values(
    value,
  )) {
    if (
      childValue &&
      typeof childValue ===
        "object"
    ) {
      const found =
        findFirstString(
          childValue,
          keys,
          visited,
        );

      if (
        found !== undefined
      ) {
        return found;
      }
    }
  }

  return undefined;
}

/* ============================================================
   FIND ARRAY
============================================================ */

function findFirstArray(
  value,
) {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    !value ||
    typeof value !== "object"
  ) {
    return [];
  }

  const directKeys = [
    "content",
    "records",
    "items",
    "data",
    "list",
    "cases",
  ];

  for (const key of directKeys) {
    if (
      Array.isArray(
        value[key],
      )
    ) {
      return value[key];
    }
  }

  for (const nestedValue of Object.values(
    value,
  )) {
    const result =
      findFirstArray(
        nestedValue,
      );

    if (result.length > 0) {
      return result;
    }
  }

  return [];
}

/* ============================================================
   FIND NUMBER
============================================================ */

function findFirstNumber(
  value,
  keys,
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  for (const key of keys) {
    const numberValue =
      Number(value[key]);

    if (
      Number.isFinite(
        numberValue,
      )
    ) {
      return numberValue;
    }
  }

  return null;
}

/* ============================================================
   DATE/TIME
============================================================ */

function splitDateTime(
  value,
) {
  if (!value) {
    return {
      date: "-",
      time: "-",
    };
  }

  const dateValue =
    new Date(value);

  if (
    !Number.isNaN(
      dateValue.getTime(),
    )
  ) {
    return {
      date: dateValue.toLocaleDateString(
        "en-GB",
      ),

      time: dateValue.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      ),
    };
  }

  const [
    date = "-",
    time = "-",
  ] = String(value).split(
    /[T ]/,
  );

  return {
    date,
    time: time
      ? time.slice(0, 5)
      : "-",
  };
}

/* ============================================================
   DATE PARSING
============================================================ */

function parseCaseDate(
  value,
) {
  if (!value) {
    return null;
  }

  /*
   * ISO / backend timestamp
   */
  const parsed = new Date(
    value,
  );

  if (
    !Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return parsed;
  }

  /*
   * dd-mm-yyyy
   */
  const parts = String(
    value,
  ).split("-");

  if (parts.length === 3) {
    const day = Number(
      parts[0],
    );

    const month = Number(
      parts[1],
    );

    const year = Number(
      parts[2],
    );

    if (
      day &&
      month &&
      year
    ) {
      return new Date(
        year,
        month - 1,
        day,
      );
    }
  }

  return null;
}

/* ============================================================
   YEAR
============================================================ */

function getCaseYear(
  value,
) {
  if (!value) {
    return "";
  }

  const parsed =
    parseCaseDate(value);

  if (parsed) {
    return String(
      parsed.getFullYear(),
    );
  }

  /*
   * Fallback for values such as
   * 24-09-2026
   */
  const valueString =
    String(value);

  const yearMatch =
    valueString.match(
      /(19|20)\d{2}/,
    );

  return yearMatch
    ? yearMatch[0]
    : "";
}