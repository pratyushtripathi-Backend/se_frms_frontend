import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CalendarDays, Download, RotateCcw, Loader2 } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import { getTransactions } from "../services/transactionService";
import {
  getDecisions,
  getScoringHistory,
  getMatchedRules,
} from "../services/fraudDetailsService";

const REPORT_SIZE = 500;
const PREVIEW_ROWS_PER_PAGE = 10;

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  const preferredKeys = [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "data",
    "transactions",
    "decisions",
    "history",
    "matchedRules",
    "rules",
  ];

  for (const key of preferredKeys) {
    const childArray = findFirstArray(value[key], visited);
    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);
    if (childArray.length > 0) return childArray;
  }

  return [];
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

function formatTransactionAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeTransactionStatus(value) {
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

function splitTransactionDateTime(value) {
  if (!value) {
    return { date: "-", time: "-" };
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: parsed.toLocaleDateString("en-GB").replace(/\//g, "-"),
      time: parsed.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const [date, time = "-"] = String(value).replace("T", " ").split(" ");
  return { date: date || "-", time };
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

const REPORT_SOURCES = [
  {
    value: "transaction-data",
    label: "Transaction Data",
    fetchRows: async () => {
      const response = await getTransactions({ page: 0, size: REPORT_SIZE });
      return findFirstArray(response.data);
    },
    getDateValue: (row) =>
      row.createdAt ?? row.createdDate ?? row.created_at ?? row.transactionDate,
    columns: [
      { header: "Sr.no", get: (row, index = 0) => index + 1 },
      { header: "Transaction ID", get: (row) => row.transactionId ?? row.id ?? "-" },
      {
        header: "User ID",
        get: (row) => row.userId ?? row.userID ?? row.user_id ?? row.customerId ?? "-",
      },
      {
        header: "Merchant ID",
        get: (row) => row.merchantId ?? row.merchant_id ?? row.merchantCode ?? "-",
      },
      {
        header: "Channel",
        get: (row) => row.channel ?? row.paymentChannel ?? row.mode ?? row.transactionChannel ?? "-",
      },
      {
        header: "Amount",
        get: (row) =>
          formatTransactionAmount(
            row.amount ?? row.transactionAmount ?? row.txnAmount ?? row.amountValue,
          ),
      },
      { header: "Currency", get: (row) => row.currency ?? row.currencyCode ?? "-" },
      { header: "Latitude", get: (row) => row.latitude ?? row.lat ?? "-" },
      { header: "Longitude", get: (row) => row.longitude ?? row.lng ?? row.long ?? "-" },
      {
        header: "Longitude 2",
        get: (row) => row.longitude2 ?? row.destinationLongitude ?? row.longitude ?? "-",
      },
      {
        header: "IP Address",
        get: (row) =>
          row.ipAddress ??
          row.ip_address ??
          row.ip ??
          row.clientIp ??
          findFirstString(row, [
            "ipaddress",
            "ip_address",
            "ip",
            "clientip",
            "client_ip",
            "sourceip",
            "source_ip",
            "userip",
            "remoteaddr",
            "remote_addr",
          ]) ??
          "-",
      },
      {
        header: "Location",
        get: (row) =>
          row.location ??
          row.city ??
          row.address ??
          row.geoLocation ??
          findFirstString(row, [
            "location",
            "city",
            "geolocation",
            "geo_location",
            "place",
            "region",
            "area",
            "locationname",
            "location_name",
            "userlocation",
            "user_location",
            "state",
            "country",
          ]) ??
          "-",
      },
      {
        header: "Device ID",
        get: (row) =>
          row.deviceId ??
          row.device_id ??
          row.deviceID ??
          row.deviceCode ??
          findFirstString(row, [
            "deviceid",
            "device_id",
            "deviceuuid",
            "device_uuid",
            "devicecode",
            "device_code",
            "deviceidentifier",
            "device_identifier",
            "imei",
            "udid",
          ]) ??
          "-",
      },
      { header: "Remark", get: (row) => row.remark ?? row.remarks ?? row.description ?? row.note ?? "-" },
      {
        header: "Status",
        get: (row) => normalizeTransactionStatus(row.status ?? row.transactionStatus ?? row.isActive),
      },
      { header: "Created By", get: (row) => row.createdBy ?? "-" },
      {
        header: "Created Date",
        get: (row) =>
          splitTransactionDateTime(
            row.createdAt ?? row.createdDate ?? row.created_at ?? row.transactionDate,
          ).date,
      },
      {
        header: "Created Time",
        get: (row) =>
          splitTransactionDateTime(
            row.createdAt ?? row.createdDate ?? row.created_at ?? row.transactionDate,
          ).time,
      },
      {
        header: "Updated Date",
        get: (row) => splitTransactionDateTime(row.updatedAt ?? row.updatedDate ?? row.updated_at).date,
      },
      {
        header: "Updated Time",
        get: (row) => splitTransactionDateTime(row.updatedAt ?? row.updatedDate ?? row.updated_at).time,
      },
    ],
  },
  {
    value: "decision-table",
    label: "Decision Table",
    fetchRows: async () => {
      const response = await getDecisions({ page: 0, size: REPORT_SIZE });
      return findFirstArray(response.data);
    },
    getDateValue: (row) => row.createdAt ?? row.createdDate,
    columns: [
      { header: "Sr.no", get: (row, index = 0) => index + 1 },
      {
        header: "Transaction ID",
        get: (row) =>
          row.transactionId ?? row.externalTransactionId ?? row.txnId ?? row.transaction?.id ?? "-",
      },
      {
        header: "Scoring ID",
        get: (row) => row.scoringId ?? row.scoreId ?? row.scoring?.id ?? "-",
      },
      {
        header: "Total Risk Score",
        get: (row) => row.totalRiskScore ?? row.riskScore ?? row.score ?? row.totalScore ?? "-",
      },
      {
        header: "Final Decision",
        get: (row) => row.finalDecision ?? row.decision ?? row.decisionResult ?? "-",
      },
      {
        header: "Decision Reason",
        get: (row) => row.decisionReason ?? row.reason ?? row.remarks ?? "-",
      },
      {
        header: "Created Date",
        get: (row) => splitDateTime(row.createdAt ?? row.createdDate).date,
      },
      {
        header: "Created Time",
        get: (row) => splitDateTime(row.createdAt ?? row.createdDate).time,
      },
      {
        header: "Updated Date",
        get: (row) => splitDateTime(row.updatedAt ?? row.updatedDate).date,
      },
      {
        header: "Updated Time",
        get: (row) => splitDateTime(row.updatedAt ?? row.updatedDate).time,
      },
    ],
  },
  {
    value: "scoring-table",
    label: "Scoring Table",
    fetchRows: async () => {
      const response = await getScoringHistory({ page: 0, size: REPORT_SIZE });
      return findFirstArray(response.data);
    },
    getDateValue: (row) => row.createdAt ?? row.createdDate,
    columns: [
      { header: "Sr.no", get: (row, index = 0) => index + 1 },
      {
        header: "Transaction ID",
        get: (row) =>
          row.transactionId ?? row.externalTransactionId ?? row.txnId ?? row.transaction?.id ?? "-",
      },
      {
        header: "Total Risk Score",
        get: (row) => row.totalRiskScore ?? row.riskScore ?? row.score ?? row.totalScore ?? "-",
      },
      {
        header: "Status",
        get: (row) => normalizeScoringStatus(row.status ?? row.scoringStatus ?? row.isActive),
      },
      { header: "Created By", get: (row) => row.createdBy ?? "-" },
      {
        header: "Created Date",
        get: (row) => splitDateTime(row.createdAt ?? row.createdDate).date,
      },
      {
        header: "Created Time",
        get: (row) => splitDateTime(row.createdAt ?? row.createdDate).time,
      },
      {
        header: "Updated Date",
        get: (row) => splitDateTime(row.updatedAt ?? row.updatedDate).date,
      },
      {
        header: "Updated Time",
        get: (row) => splitDateTime(row.updatedAt ?? row.updatedDate).time,
      },
    ],
  },
  {
    value: "matched-rule",
    label: "Matched Rule",
    fetchRows: async () => {
      const response = await getMatchedRules({ page: 0, size: REPORT_SIZE });
      return findFirstArray(response.data);
    },
    getDateValue: (row) => row.createdAt ?? row.createdDate,
    columns: [
      { header: "Sr.no", get: (row, index = 0) => index + 1 },
      {
        header: "Transaction ID",
        get: (row) =>
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
      },
      { header: "Scoring ID", get: (row) => row.scoringId ?? row.scoreId ?? row.scoring?.id ?? "-" },
      { header: "Rule ID", get: (row) => row.ruleId ?? row.fraudRuleId ?? row.rule?.id ?? "-" },
      { header: "Rule Code", get: (row) => row.ruleCode ?? row.code ?? row.rule?.code ?? "-" },
      { header: "Rule Name", get: (row) => row.ruleName ?? row.name ?? row.rule?.name ?? "-" },
      {
        header: "Rule Expression",
        get: (row) =>
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
      },
      { header: "Rule Score", get: (row) => row.ruleScore ?? row.score ?? row.rule?.score ?? "-" },
      {
        header: "Calculated Score",
        get: (row) => row.calculatedScore ?? row.calculatedRiskScore ?? row.finalScore ?? "-",
      },
      {
        header: "Status",
        get: (row) => normalizeMatchedRuleStatus(row.status ?? row.ruleStatus ?? row.isActive),
      },
      { header: "Created By", get: (row) => row.createdBy ?? "-" },
      {
        header: "Created Date",
        get: (row) => splitDateTime(row.createdAt ?? row.createdDate).date,
      },
      {
        header: "Created Time",
        get: (row) => splitDateTime(row.createdAt ?? row.createdDate).time,
      },
      {
        header: "Updated Date",
        get: (row) => splitDateTime(row.updatedAt ?? row.updatedDate).date,
      },
      {
        header: "Updated Time",
        get: (row) => splitDateTime(row.updatedAt ?? row.updatedDate).time,
      },
    ],
  },
];

function downloadCsv(source, rows) {
  const headers = source.columns.map((column) => column.header);
  const csvRows = rows.map((row, index) =>
    source.columns.map((column) => {
      const value = column.get(row, index);
      const text = String(value ?? "-");
      return text.includes(",") ? `"${text.replace(/"/g, '""')}"` : text;
    }),
  );

  const csv = [headers, ...csvRows].map((cells) => cells.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${source.value}-report.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function downloadPdf(source, rows) {
  const headerCells = source.columns
    .map((column) => `<th style="padding:8px 12px;border:1px solid #E5E7EB;text-align:left;">${column.header}</th>`)
    .join("");

  const bodyRows = rows
    .map((row, index) => {
      const cells = source.columns
        .map(
          (column) =>
            `<td style="padding:8px 12px;border:1px solid #E5E7EB;">${String(column.get(row, index) ?? "-")}</td>`,
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `
    <html>
      <head>
        <title>${source.label} Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #202224; }
          h1 { font-size: 16px; margin-bottom: 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${source.label} Report</h1>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";

  document.body.appendChild(printFrame);

  const frameDocument = printFrame.contentWindow.document;
  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  printFrame.onload = () => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    window.setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };
}

export default function ReportPage() {
  const [selectedSourceValue, setSelectedSourceValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [previewRows, setPreviewRows] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewPage, setPreviewPage] = useState(1);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const selectedSource = useMemo(
    () => REPORT_SOURCES.find((source) => source.value === selectedSourceValue) ?? null,
    [selectedSourceValue],
  );

  const handleResetFilters = () => {
    setSelectedSourceValue("");
    setFromDate("");
    setToDate("");
    setError("");
  };

  useEffect(() => {
    let isActive = true;

    if (!selectedSource) {
      setPreviewRows([]);
      setPreviewError("");
      setIsPreviewLoading(false);
      setPreviewPage(1);
      return undefined;
    }

    async function loadPreview() {
      setIsPreviewLoading(true);
      setPreviewError("");

      try {
        const rawRows = await selectedSource.fetchRows();
        const filteredRows = rawRows.filter((row) => {
          const rawDate = selectedSource.getDateValue(row);
          const parsedDate = rawDate ? new Date(rawDate) : null;
          const matchesFrom =
            !fromDate || !parsedDate || parsedDate >= new Date(`${fromDate}T00:00:00`);
          const matchesTo =
            !toDate || !parsedDate || parsedDate <= new Date(`${toDate}T23:59:59`);
          return matchesFrom && matchesTo;
        });

        if (!isActive) return;

        setPreviewRows(filteredRows);
        setPreviewPage(1);
      } catch (fetchError) {
        if (!isActive) return;

        setPreviewError(
          getAuthErrorMessage(fetchError, "Unable to load data. Please try again."),
        );
        setPreviewRows([]);
      } finally {
        if (isActive) setIsPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      isActive = false;
    };
  }, [selectedSource, fromDate, toDate]);

  const totalPreviewPages = Math.max(
    Math.ceil(previewRows.length / PREVIEW_ROWS_PER_PAGE),
    1,
  );
  const pagedPreviewRows = previewRows.slice(
    (previewPage - 1) * PREVIEW_ROWS_PER_PAGE,
    previewPage * PREVIEW_ROWS_PER_PAGE,
  );
  const firstVisibleRecord =
    previewRows.length === 0 ? 0 : (previewPage - 1) * PREVIEW_ROWS_PER_PAGE + 1;
  const lastVisibleRecord = Math.min(
    previewPage * PREVIEW_ROWS_PER_PAGE,
    previewRows.length,
  );

  const handleExport = async (format) => {
    setShowExportMenu(false);

    if (!selectedSource) {
      setError("Please select a page before exporting the report.");
      return;
    }

    setIsExporting(true);
    setError("");

    try {
      const rawRows = await selectedSource.fetchRows();
      const filteredRows = rawRows.filter((row) => {
        const rawDate = selectedSource.getDateValue(row);
        const parsedDate = rawDate ? new Date(rawDate) : null;
        const matchesFrom =
          !fromDate || !parsedDate || parsedDate >= new Date(`${fromDate}T00:00:00`);
        const matchesTo =
          !toDate || !parsedDate || parsedDate <= new Date(`${toDate}T23:59:59`);
        return matchesFrom && matchesTo;
      });

      if (filteredRows.length === 0) {
        setError("No records found for the selected page and date range.");
        return;
      }

      if (format === "csv") {
        downloadCsv(selectedSource, filteredRows);
      } else {
        downloadPdf(selectedSource, filteredRows);
      }
    } catch (fetchError) {
      setError(getAuthErrorMessage(fetchError, "Unable to generate the report. Please try again."));
    } finally {
      setIsExporting(false);
    }
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 24px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      padding: "20px 24px",
      boxSizing: "border-box",
    },

    bodyWrapper: {
      width: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      marginTop: "16px",
    },

    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flexWrap: "wrap",
      gap: "10px",
    },

    pageSelect: {
      width: "160px",
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

    body: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "18px",
    },

    illustrationWrapper: {
      position: "relative",
      width: "170px",
      height: "218px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    documentIcon: {
      width: "170px",
      height: "auto",
      display: "block",
      animation: "reportIconFlow 3.6s ease-in-out infinite",
    },

    badgeIcon: {
      position: "absolute",
      right: "-42px",
      bottom: "4px",
      width: "84px",
      height: "84px",
      display: "block",
      animation: "reportBadgeBlink 3.6s ease-in-out infinite",
    },

    previewCard: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      padding: "20px 24px",
      boxSizing: "border-box",
    },

    tableContainer: {
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflowX: "auto",
      background: "#FFFFFF",
    },

    table: {
      width: "100%",
      minWidth: "900px",
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

    caption: {
      fontSize: "14px",
      color: "#7B7B7B",
      textAlign: "center",
      maxWidth: "380px",
      lineHeight: 1.6,
    },

    errorText: {
      fontSize: "13px",
      color: "#FF4D4F",
      textAlign: "center",
      maxWidth: "360px",
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes reportIconFlow {
            0% { transform: translateY(-26px); }
            30% { transform: translateY(0px); }
            50% { transform: translateY(0px); }
            80% { transform: translateY(28px); }
            100% { transform: translateY(-26px); }
          }

          @keyframes reportBadgeBlink {
            0% { opacity: 1; }
            30% { opacity: 1; }
            34% { opacity: 0.15; }
            38% { opacity: 1; }
            100% { opacity: 1; }
          }
        `}
      </style>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={{ position: "relative" }}>
            <select
              onChange={(event) => setSelectedSourceValue(event.target.value)}
              style={styles.pageSelect}
              value={selectedSourceValue}
            >
              <option value="">Select page</option>
              {REPORT_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
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

          <button onClick={handleResetFilters} style={styles.resetButton} type="button">
            <RotateCcw size={15} />
            Reset
          </button>

          <div style={{ position: "relative" }}>
            <button
              disabled={isExporting}
              onClick={() => setShowExportMenu((open) => !open)}
              style={{ ...styles.exportButton, opacity: isExporting ? 0.6 : 1 }}
              type="button"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export
              <FiChevronDown size={13} />
            </button>

            {showExportMenu && !isExporting && (
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
                  onClick={() => handleExport("csv")}
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
                  CSV
                </button>
                <button
                  onClick={() => handleExport("pdf")}
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
                  Pdf
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.bodyWrapper}>
        {selectedSource ? (
          <div style={styles.previewCard}>
            <div style={styles.tableContainer}>
              <table
                style={{
                  ...styles.table,
                  minWidth: `${Math.max(900, selectedSource.columns.length * 130)}px`,
                }}
              >
                <thead style={styles.thead}>
                  <tr>
                    {selectedSource.columns.map((column) => (
                      <th key={column.header} style={styles.th}>
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {isPreviewLoading && (
                    <tr style={styles.tr}>
                      <td
                        colSpan={selectedSource.columns.length}
                        style={{ ...styles.td, textAlign: "center" }}
                      >
                        Loading {selectedSource.label} data...
                      </td>
                    </tr>
                  )}

                  {!isPreviewLoading && previewError && (
                    <tr style={styles.tr}>
                      <td
                        colSpan={selectedSource.columns.length}
                        style={{ ...styles.td, textAlign: "center", color: "#E0453C" }}
                      >
                        {previewError}
                      </td>
                    </tr>
                  )}

                  {!isPreviewLoading && !previewError && pagedPreviewRows.length > 0 ? (
                    pagedPreviewRows.map((row, index) => {
                      const absoluteIndex = (previewPage - 1) * PREVIEW_ROWS_PER_PAGE + index;

                      return (
                        <tr key={absoluteIndex} style={styles.tr}>
                          {selectedSource.columns.map((column) => (
                            <td key={column.header} style={styles.td}>
                              {String(column.get(row, absoluteIndex) ?? "-")}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    !isPreviewLoading &&
                    !previewError && (
                      <tr style={styles.tr}>
                        <td
                          colSpan={selectedSource.columns.length}
                          style={{ ...styles.td, textAlign: "center" }}
                        >
                          No records found for the selected page and date range.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.footerRow}>
              <div style={styles.footerText}>
                Showing <strong>{firstVisibleRecord}-{lastVisibleRecord}</strong> of{" "}
                <strong>{previewRows.length}</strong> records
              </div>

              <div style={styles.pagination}>
                <button
                  onClick={() => previewPage > 1 && setPreviewPage(previewPage - 1)}
                  style={styles.pageArrow}
                  type="button"
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: totalPreviewPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPreviewPage(page)}
                    style={styles.pageNumber(page === previewPage)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    previewPage < totalPreviewPages && setPreviewPage(previewPage + 1)
                  }
                  style={styles.pageArrow}
                  type="button"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>

            {error && <div style={{ ...styles.errorText, marginTop: "12px" }}>{error}</div>}
          </div>
        ) : (
          <div style={styles.body}>
            <div style={styles.illustrationWrapper}>
              <img alt="Report document" src="/report-document-icon.png" style={styles.documentIcon} />
              <img alt="Download" src="/report-download-badge.png" style={styles.badgeIcon} />
            </div>

            {error ? (
              <div style={styles.errorText}>{error}</div>
            ) : (
              <div style={styles.caption}>
                {isExporting
                  ? "Generating your report..."
                  : "Choose the data you need and download your report in your preferred format."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
