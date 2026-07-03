import { useState, forwardRef } from "react";
import {
  CalendarDays,
  Download,
  ChevronDown,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateButton = forwardRef(
  ({ value, onClick, placeholder }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-[12.5px] text-brand-dim"
    >
      {value || placeholder}
      <CalendarDays size={14} />
    </button>
  )
);

DateButton.displayName = "DateButton";

export default function TransactionControls({ rows }) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const exportCSV = () => {
    const headers = [
      "Sr No",
      "ID",
      "User Name",
      "Account No",
      "Amount",
      "Mode",
      "Mobile No",
      "Date",
      "Time",
      "Status",
      "Priority",
    ];

    const csvRows = rows.map((r) => [
      r.sr,
      r.id,
      r.user,
      r.account,
      r.amount,
      r.mode,
      r.mobile,
      r.date,
      r.time,
      r.status,
      r.priority,
    ]);

    const csv = [
      headers.join(","),
      ...csvRows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";
    link.click();

    URL.revokeObjectURL(url);

    setShowMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select className="rounded-lg border border-brand-border px-3 py-2 text-[12.5px] outline-none">
        <option>Year</option>
      </select>

      <DatePicker
        selected={fromDate}
        onChange={setFromDate}
        dateFormat="dd-MM-yyyy"
        customInput={<DateButton placeholder="From" />}
      />

      <DatePicker
        selected={toDate}
        onChange={setToDate}
        dateFormat="dd-MM-yyyy"
        customInput={<DateButton placeholder="To" />}
      />

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 rounded-lg border border-brand-red px-3.5 py-2 text-[12.5px] font-semibold text-brand-red"
        >
          <Download size={14} />
          Export
          <ChevronDown size={14} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg">
            <button
              onClick={exportCSV}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}