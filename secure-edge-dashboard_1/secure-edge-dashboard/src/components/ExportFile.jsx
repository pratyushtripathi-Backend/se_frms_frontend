import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportFile({ rows }) {
  const [open, setOpen] = useState(false);

  const exportCSV = () => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${row[header] ?? ""}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "RecentTransactions.csv";
    link.click();

    setOpen(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [
        [
          "Sr No",
          "ID",
          "User",
          "Account",
          "Amount",
          "Mode",
          "Mobile",
          "Date",
          "Time",
          "Status",
          "Priority",
        ],
      ],

      body: rows.map((r) => [
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
      ]),
    });

    doc.save("RecentTransactions.pdf");

    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-brand-red px-3.5 py-2 text-[12.5px] font-semibold text-brand-red"
      >
        <Download size={14} />
        Export
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <button
            onClick={exportCSV}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Export CSV
          </button>

          <button
            onClick={exportPDF}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}