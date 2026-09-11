import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import ExportFile from "./ExportFile";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const requestIdRef = useRef(0);

  // Fetches the same live transaction data (and uses the exact same
  // normalization logic) as the Transaction Data page, so this widget always
  // mirrors what is shown there - just the most recent `rowsPerPage` rows.
  // Priority is derived from the Decision Table's Final Decision for the
  // same transaction: Allow -> Safe, Review/Block -> Risk.
  const fetchRecentTransactions = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const [transactionsResponse, decisionsResponse] = await Promise.all([
        getTransactions({ page: 0, size: rowsPerPage }),
        getDecisions({ page: 0, size: DECISIONS_LOOKUP_SIZE }).catch(() => null),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const { rawRows, totalRecords: total } = normalizeTransactionsResponse(
        transactionsResponse?.data,
        rowsPerPage,
      );

      const priorityByTransactionId = decisionsResponse
        ? buildDecisionPriorityMap(decisionsResponse?.data)
        : new Map();

      const normalizedRows = rawRows.slice(0, rowsPerPage).map((row, index) => {
        const normalizedRow = normalizeTransactionRow(row, index, 0);
        return {
          ...normalizedRow,
          priority:
            priorityByTransactionId.get(String(normalizedRow.transactionId)) ?? "-",
        };
      });

      setTransactions(normalizedRows);
      setTotalRecords(total);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError("Unable to load recent transactions.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
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

          <ExportFile rows={filteredTransactions} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-[12px]">
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
            {isLoading && (
              <tr>
                <td
                  colSpan={recentTransactionColumns.length}
                  className="px-3 py-4 text-center text-brand-dim"
                >
                  Loading transactions...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td
                  colSpan={recentTransactionColumns.length}
                  className="px-3 py-4 text-center text-brand-red"
                >
                  {error}
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

            {!isLoading &&
              !error &&
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
            className="grid h-7 w-7 place-items-center rounded-lg border border-brand-border text-brand-dim"
            type="button"
          >
            <ChevronLeft size={13} />
          </button>

          <button
            className="grid h-7 w-7 place-items-center rounded-lg bg-brand-ink text-[11.5px] font-medium text-white"
            type="button"
          >
            1
          </button>

          <button
            className="grid h-7 w-7 place-items-center rounded-lg border border-brand-border text-brand-dim"
            type="button"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
