import { scrollIntoHorizontalStrip } from "./scrollPageStrip";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { openDashboardDatePicker } from "./dashboardDatePicker";
import { getTransactions } from "../services/transactionService";
import { getDecisions } from "../services/fraudDetailsService";
import {
  normalizeTransactionsResponse,
  normalizeTransactionRow,
  findFirstArray,
} from "./transactionNormalization";

const rowsPerPage = 5;
const DECISIONS_LOOKUP_SIZE = 50;
// How often the table re-fetches in the background so new transactions show
// up without reloading the dashboard.
const AUTO_REFRESH_INTERVAL_MS = 10000;
// Page-number strip shows this many buttons at a time (~28px button + 6px
// gap each) and scrolls horizontally for the rest - see pageScrollRef below.
const VISIBLE_PAGE_BUTTONS = 5;
const PAGE_BUTTON_SIZE = 28;
const PAGE_BUTTON_GAP = 6;
const PAGE_STRIP_WIDTH =
  VISIBLE_PAGE_BUTTONS * PAGE_BUTTON_SIZE + (VISIBLE_PAGE_BUTTONS - 1) * PAGE_BUTTON_GAP;

const recentTransactionColumns = [
  "Sr no",
  "Transaction ID",
  "User ID",
  "Merchant ID",
  "Amount",
  "Channel",
  "Date",
  "Time",
  "Status",
  "Priority",
];

const STATUS_STYLES = {
  Active: "text-emerald-600",
  Inactive: "text-brand-red",
};

const PRIORITY_STYLES = {
  Safe: "bg-emerald-50 text-emerald-600",
  Risk: "bg-brand-redSoft text-brand-red",
};

// Final Decision (from the Decision Table) -> Priority:
// Allow -> Safe; Review and Block -> Risk.
function decisionToPriority(finalDecision) {
  const normalized = String(finalDecision ?? "").trim().toLowerCase();

  if (normalized === "allow") {
    return "Safe";
  }

  if (normalized === "review" || normalized === "block") {
    return "Risk";
  }

  return "-";
}

function buildDecisionPriorityMap(responseData) {
  const payload =
    responseData?.responseData ?? responseData?.data ?? responseData;
  const rawRows = findFirstArray(payload);
  const map = new Map();

  rawRows.forEach((row) => {
    const transactionId =
      row.transactionId ??
      row.externalTransactionId ??
      row.txnId ??
      row.transaction?.id ??
      null;

    if (transactionId === null || transactionId === undefined) {
      return;
    }

    const finalDecision = row.finalDecision ?? row.decision ?? row.decisionResult ?? null;
    map.set(String(transactionId), decisionToPriority(finalDecision));
  });

  return map;
}

export default function RecentTransactions() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const pageScrollRef = useRef(null);

  // Fetches the same live transaction data (and uses the exact same
  // normalization logic) as the Transaction Data page, so this widget always
  // mirrors what is shown there - just `rowsPerPage` rows at a time, paged.
  // Priority is derived from the Decision Table's Final Decision for the
  // same transaction: Allow -> Safe, Review/Block -> Risk.
  //
  // `silent` is used by the background auto-refresh: it updates the rows in
  // place without the dimmed table + spinner, and keeps the current rows (no
  // error banner) if one refresh happens to fail.
  const fetchRecentTransactions = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestIdRef.current;

    if (!silent) {
      setIsLoading(true);
      setError("");
    }

    try {
      const [transactionsResponse, decisionsResponse] = await Promise.all([
        getTransactions({ page: currentPage - 1, size: rowsPerPage }),
        getDecisions({ page: 0, size: DECISIONS_LOOKUP_SIZE }).catch(() => null),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const { rawRows, totalRecords: total, totalPages: pages } =
        normalizeTransactionsResponse(transactionsResponse?.data, rowsPerPage);

      const priorityByTransactionId = decisionsResponse
        ? buildDecisionPriorityMap(decisionsResponse?.data)
        : new Map();

      const normalizedRows = rawRows.slice(0, rowsPerPage).map((row, index) => {
        const normalizedRow = normalizeTransactionRow(
          row,
          index,
          (currentPage - 1) * rowsPerPage,
        );
        return {
          ...normalizedRow,
          priority:
            priorityByTransactionId.get(String(normalizedRow.transactionId)) ?? "-",
        };
      });

      setTransactions(normalizedRows);
      setTotalRecords(total);
      setTotalPages(pages);
      setError("");
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!silent) {
        setError("Unable to load recent transactions.");
      }
    } finally {
      // Cleared for silent refreshes too: if a background refresh superseded
      // a page-change load, the page-change load's own finally is skipped,
      // so this is what turns its spinner off.
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  // Auto-refresh: re-fetch the current page every AUTO_REFRESH_INTERVAL_MS
  // while the tab is visible (no point polling a hidden tab), and once right
  // away when the user comes back to the tab.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        fetchRecentTransactions({ silent: true });
      }
    };

    const intervalId = window.setInterval(refreshIfVisible, AUTO_REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [fetchRecentTransactions]);

  // Keeps the current page's button scrolled into view within the
  // horizontally-scrollable page-number strip (e.g. after using the prev/next
  // arrows to move past what's currently visible).
  useEffect(() => {
    const container = pageScrollRef.current;
    const activeButton = container?.querySelector(`[data-page="${currentPage}"]`);
    scrollIntoHorizontalStrip(activeButton);
  }, [currentPage, totalPages]);

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const filteredTransactions = transactions.filter((row) => {
    if (!fromDate && !toDate) {
      return true;
    }

    const rowDate = row.createdAtRaw ? new Date(row.createdAtRaw) : null;

    if (!rowDate || Number.isNaN(rowDate.getTime())) {
      return true;
    }

    if (fromDate && rowDate < new Date(fromDate)) {
      return false;
    }

    if (toDate && rowDate > new Date(toDate)) {
      return false;
    }

    return true;
  });

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[14px] font-bold text-brand-ink">
          Recent Transactions
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <>
            <input
              ref={fromInputRef}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="hidden"
            />

            <button
              type="button"
              onClick={(event) => openDashboardDatePicker(fromInputRef.current, event.currentTarget)}
              className="flex items-center gap-2 rounded-lg border border-brand-border px-2.5 py-1.5 text-[11.5px] text-brand-dim"
            >
              {fromDate || "From"}
              <CalendarDays size={13} />
            </button>
          </>

          <>
            <input
              ref={toInputRef}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="hidden"
            />

            <button
              type="button"
              onClick={(event) => openDashboardDatePicker(toInputRef.current, event.currentTarget)}
              className="flex items-center gap-2 rounded-lg border border-brand-border px-2.5 py-1.5 text-[11.5px] text-brand-dim"
            >
              {toDate || "To"}
              <CalendarDays size={13} />
            </button>
          </>

          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-2 rounded-lg bg-[#333333] px-4 py-1.5 text-[11.5px] font-semibold text-white"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 rounded-lg bg-brand-redSoft px-3 py-2 text-[11.5px] text-brand-red">
          {error}
        </div>
      )}

      {/* Only this card's table area shows a loading state when switching
          pages - the previous page's rows stay visible (dimmed) under a
          small spinner instead of the whole card blanking out. */}
      <div className="relative overflow-x-auto">
        {isLoading && filteredTransactions.length > 0 && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-lg bg-white/60">
            <Loader2 size={18} className="animate-spin text-brand-dim" />
          </div>
        )}

        <table
          className={`w-full min-w-[900px] border-collapse text-[12px] transition-opacity ${
            isLoading && filteredTransactions.length > 0 ? "opacity-50" : "opacity-100"
          }`}
        >
          <thead>
            <tr className="text-left text-[12px] font-medium text-brand-dim">
              {recentTransactionColumns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-3 pb-2"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading && filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={recentTransactionColumns.length}
                  className="px-3 py-4 text-center text-brand-dim"
                >
                  Loading transactions...
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={recentTransactionColumns.length}
                  className="px-3 py-4 text-center text-brand-dim"
                >
                  No transaction data found.
                </td>
              </tr>
            )}

            {filteredTransactions.length > 0 &&
              filteredTransactions.map((row, index) => (
                <tr
                  key={row.transactionId ?? index}
                  className={
                    index % 2 === 1
                      ? "bg-brand-bg/60"
                      : "bg-transparent"
                  }
                >
                  <td className="whitespace-nowrap rounded-l-lg px-3 py-3.5 text-brand-ink">
                    {row.srNo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.transactionId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.userId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.merchantId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.amount}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.channel}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.createdDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                    {row.createdTime}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3.5 font-semibold ${STATUS_STYLES[row.status] ?? "text-brand-ink"}`}
                  >
                    {row.status}
                  </td>
                  <td className="whitespace-nowrap rounded-r-lg px-3 py-3.5">
                    <span
                      className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${PRIORITY_STYLES[row.priority] ?? "text-brand-dim"}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11.5px] text-brand-dim">
          Showing {filteredTransactions.length} of {totalRecords} transactions
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="grid h-7 w-7 place-items-center rounded-lg border border-brand-border text-brand-dim disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={13} />
          </button>

          <div
            ref={pageScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth"
            style={{ maxWidth: `${PAGE_STRIP_WIDTH}px`, scrollbarWidth: "thin" }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                data-page={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={
                  page === currentPage
                    ? "grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-ink text-[11.5px] font-medium text-white"
                    : "grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-brand-border text-[11.5px] text-brand-dim"
                }
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="grid h-7 w-7 place-items-center rounded-lg border border-brand-border text-brand-dim disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
