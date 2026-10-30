import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { isActiveStatus } from "../utils/status";

// Colours used by the on-screen tables, so the PDF looks like the page.
const HEADER_FILL = [248, 249, 251]; // #F8F9FB
const HEADER_TEXT = [90, 90, 90]; // #5A5A5A
const BODY_TEXT = [75, 85, 99]; // #4B5563
const BORDER = [236, 236, 236]; // #ECECEC
const BLUE = [47, 128, 237]; // #2F80ED
const GREEN = [39, 174, 96]; // #27AE60
const GREY = [217, 217, 217]; // #D9D9D9
const WHITE = [255, 255, 255];

// `columns` (optional) describes the table exactly as it's shown on screen:
//   { header: "User Name", value: (row, index) => row.userName, type? }
// type:
//   "status"   -> value is the row's status; drawn as the Active / Inactive pill
//   "dateTime" -> value is [date, time]; date in blue, time in green below it
//   "link"     -> blue text (URLs)
// Without `columns` the old behaviour is kept (used by other pages).
export default function ExportFile({ rows, columns, fileName = "RecentTransactions", title }) {
  const [open, setOpen] = useState(false);

  const exportCSV = () => {
    if (!rows.length) return;

    let csv;

    if (columns?.length) {
      csv = [
        columns.map((column) => csvCell(column.header)).join(","),
        ...rows.map((row, index) =>
          columns.map((column) => csvCell(plainValue(column, row, index))).join(","),
        ),
      ].join("\n");
    } else {
      const headers = Object.keys(rows[0]).filter(
        (header) => !["id", "userId", "employeeId", "roleId", "accessId"].includes(header),
      );

      csv = [
        headers.join(","),
        ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
      ].join("\n");
    }

    // BOM so Excel opens UTF-8 text (names, symbols) correctly.
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    setOpen(false);
  };

  const exportPDF = () => {
    if (columns?.length) {
      exportTablePDF({ rows, columns, fileName, title });
    } else {
      exportLegacyPDF(rows, fileName);
    }

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

function exportTablePDF({ rows, columns, fileName, title }) {
  // Wide tables (up to 13 columns) need landscape; very wide ones use A3.
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: columns.length > 10 ? "a3" : "a4",
  });

  const margin = 10;
  let startY = margin;

  if (title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text(title, margin, margin + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...HEADER_TEXT);
    doc.text(
      `Exported on ${new Date().toLocaleString("en-IN")}  |  ${rows.length} record${rows.length === 1 ? "" : "s"}`,
      margin,
      margin + 10,
    );

    startY = margin + 15;
  }

  const body = rows.map((row, index) =>
    columns.map((column) => {
      const value = column.value(row, index);

      if (column.type === "status") return isActiveStatus(value) ? "Active" : "Inactive";
      if (column.type === "dateTime") {
        const [date, time] = Array.isArray(value) ? value : [value, ""];
        return [textOf(date), textOf(time)].filter(Boolean).join("\n") || "-";
      }

      return textOf(value) || "-";
    }),
  );

  autoTable(doc, {
    startY,
    margin: { left: margin, right: margin, bottom: margin },
    head: [columns.map((column) => column.header)],
    body,
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: BODY_TEXT,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: BORDER,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: HEADER_FILL,
      textColor: HEADER_TEXT,
      fontStyle: "bold",
      lineWidth: { bottom: 0.3 },
    },
    bodyStyles: {
      lineWidth: { bottom: 0.2 },
    },
    columnStyles: Object.fromEntries(
      columns.map((column, index) => [
        index,
        column.type === "status" ? { minCellWidth: 20 } : {},
      ]),
    ),
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const column = columns[data.column.index];

      if (column.type === "link") data.cell.styles.textColor = BLUE;
      if (column.bold) data.cell.styles.fontStyle = "bold";
    },
    // Status and date/time cells are drawn by hand (pill / two colours), so
    // stop autoTable printing their plain text first.
    willDrawCell: (data) => {
      if (data.section !== "body") return;
      const column = columns[data.column.index];

      if (column.type === "status" || column.type === "dateTime") {
        data.cell.customLines = data.cell.text;
        data.cell.text = [];
      }
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const column = columns[data.column.index];
      const { cell } = data;

      if (column.type === "status") drawStatusPill(doc, cell);
      if (column.type === "dateTime") drawDateTime(doc, cell);
    },
  });

  doc.save(`${fileName}.pdf`);
}

// The Active / Inactive toggle as a filled pill with a white knob.
function drawStatusPill(doc, cell) {
  const label = cell.customLines?.join(" ") || "";
  const isActive = label === "Active";
  const width = 18;
  const height = 5.5;
  const x = cell.x + cell.padding("left");
  const y = cell.y + (cell.height - height) / 2;
  const radius = height / 2;

  doc.setFillColor(...(isActive ? GREEN : GREY));
  doc.roundedRect(x, y, width, height, radius, radius, "F");

  doc.setFillColor(...WHITE);
  const knobX = isActive ? x + width - radius : x + radius;
  doc.circle(knobX, y + radius, radius - 0.7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...WHITE);
  doc.text(label, isActive ? x + 2.2 : x + width - 2.2, y + radius, {
    baseline: "middle",
    align: isActive ? "left" : "right",
  });
}

// Date in blue on the first line, time in green below it (as on screen).
function drawDateTime(doc, cell) {
  const lines = cell.customLines || [];
  const fontSize = cell.styles.fontSize;
  const lineHeight = (fontSize * doc.getLineHeightFactor()) / doc.internal.scaleFactor;
  const x = cell.x + cell.padding("left");
  const blockHeight = lineHeight * lines.length;
  let y = cell.y + (cell.height - blockHeight) / 2;

  doc.setFontSize(fontSize);

  lines.forEach((line, index) => {
    const isDate = index === 0;
    doc.setFont("helvetica", isDate ? "bold" : "normal");
    doc.setTextColor(...(isDate ? BLUE : GREEN));
    doc.text(line, x, y, { baseline: "top" });
    y += lineHeight;
  });
}

function exportLegacyPDF(rows, fileName) {
  const doc = new jsPDF();

  autoTable(doc, {
    head: [["Sr No", "User", "Account", "Amount", "Mode", "Mobile", "Date", "Time", "Status", "Priority"]],
    body: rows.map((r) => [
      r.sr,
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

  doc.save(`${fileName}.pdf`);
}

function plainValue(column, row, index) {
  const value = column.value(row, index);

  if (column.type === "status") return isActiveStatus(value) ? "Active" : "Inactive";
  if (column.type === "dateTime") {
    const [date, time] = Array.isArray(value) ? value : [value, ""];
    return [textOf(date), textOf(time)].filter(Boolean).join(" ");
  }

  return textOf(value);
}

function textOf(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function csvCell(value) {
  return `"${textOf(value).replace(/"/g, '""')}"`;
}
