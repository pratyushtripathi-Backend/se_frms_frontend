import { useState, forwardRef } from "react";
import { CalendarDays, Download, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateButton = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-[12.5px] text-brand-dim"
    onClick={onClick}
    ref={ref}
    type="button"
  >
    {value || placeholder}
    <CalendarDays size={14} />
  </button>
));

DateButton.displayName = "DateButton";

/**
 * Shared Year / From / To / Export toolbar.
 *
 * Generic on purpose so any list page can reuse it — pass the table's
 * own `headers` (array of column labels) and `rows` (array of arrays,
 * same order as headers) and this component handles the CSV export.
 */
export default function TransactionControls({
  headers = [],
  rows = [],
  filename = "export.csv",
  onYearChange,
  onFromChange,
  onToChange,
  years = ["2026", "2025", "2024"],
}) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleFromChange = (date) => {
    setFromDate(date);
    onFromChange?.(date);
  };

  const handleToChange = (date) => {
    setToDate(date);
    onToChange?.(date);
  };

  const exportCSV = () => {
    const escapeCell = (cell) => {
      const value = cell === null || cell === undefined ? "" : String(cell);
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select
        className="rounded-lg border border-brand-border px-3 py-2 text-[12.5px] text-brand-dim outline-none"
        onChange={(event) => onYearChange?.(event.target.value)}
      >
        <option value="">Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <DatePicker
        customInput={<DateButton placeholder="From" />}
        dateFormat="dd-MM-yyyy"
        onChange={handleFromChange}
        selected={fromDate}
      />

      <DatePicker
        customInput={<DateButton placeholder="To" />}
        dateFormat="dd-MM-yyyy"
        onChange={handleToChange}
        selected={toDate}
      />

      <div className="relative">
        <button
          className="flex items-center gap-2 rounded-lg border border-brand-red px-3.5 py-2 text-[12.5px] font-semibold text-brand-red"
          onClick={() => setShowMenu((open) => !open)}
          type="button"
        >
          <Download size={14} />
          Export
          <ChevronDown size={14} />
        </button>

        {showMenu && (
          <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-brand-border bg-white shadow-lg">
            <button
              className="w-full px-4 py-2 text-left text-[12.5px] hover:bg-gray-100"
              onClick={exportCSV}
              type="button"
            >
              Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}