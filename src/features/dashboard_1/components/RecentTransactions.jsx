import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ExportFile from "./ExportFile";
import { useRef, useState } from "react";
import {
  transactionColumns,
  recentTransactions,
} from "./RecentTransactionsData";

const STATUS_STYLES = {
  Success: "text-emerald-600",
  Failed: "text-brand-red",
  Pending: "text-amber-500",
};

const PRIORITY_STYLES = {
  Safe: "bg-emerald-50 text-emerald-600",
  Risk: "bg-brand-redSoft text-brand-red",
};

export default function RecentTransactions() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-brand-ink">
          Recent Transactions
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
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
              onClick={() => {
                if (fromInputRef.current?.showPicker) {
                  fromInputRef.current.showPicker();
                } else {
                  fromInputRef.current?.click();
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-[12.5px] text-brand-dim"
            >
              {fromDate || "From"}
              <CalendarDays size={14} />
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
              onClick={() => {
                if (toInputRef.current?.showPicker) {
                  toInputRef.current.showPicker();
                } else {
                  toInputRef.current?.click();
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-[12.5px] text-brand-dim"
            >
              {toDate || "To"}
              <CalendarDays size={14} />
            </button>
          </>

          <ExportFile rows={recentTransactions} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[14px] font-medium text-brand-dim">
              {transactionColumns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-3 pb-3"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {recentTransactions.map((row, index) => (
              <tr
                key={row.sr}
                className={
                  index % 2 === 1
                    ? "bg-brand-bg/60"
                    : "bg-transparent"
                }
              >
                <td className="whitespace-nowrap rounded-l-lg px-3 py-3.5 text-brand-ink">
                  {row.sr}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.id}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.user}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.account}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.amount}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.mode}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.mobile}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.date}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-brand-ink">
                  {row.time}
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-3.5 font-semibold ${STATUS_STYLES[row.status]}`}
                >
                  {row.status}
                </td>
                <td className="whitespace-nowrap rounded-r-lg px-3 py-3.5">
                  <span
                    className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${PRIORITY_STYLES[row.priority]}`}
                  >
                    {row.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12.5px] text-brand-dim">
          Showing 5 of 135 transactions
        </div>

        <div className="flex items-center gap-1.5">
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-brand-border text-brand-dim">
            <ChevronLeft size={15} />
          </button>

          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`grid h-8 w-8 place-items-center rounded-lg text-[13px] font-medium ${
                page === 1
                  ? "bg-brand-ink text-white"
                  : "border border-brand-border text-brand-ink"
              }`}
            >
              {page}
            </button>
          ))}

          <button className="grid h-8 w-8 place-items-center rounded-lg border border-brand-border text-brand-dim">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}