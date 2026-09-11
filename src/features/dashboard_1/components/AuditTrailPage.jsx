import { CalendarDays, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AuditTrailDetailModal from "./AuditTrailDetailModal";
import ExportFile from "./ExportFile";
import { openDashboardDatePicker } from "./dashboardDatePicker";
import { getAuditLogs } from "../services/fraudDetailsService";
import { getAuthErrorMessage } from "../../auth/services/authError";

const rowsPerPage = 10;

const tableColumns = [
  "Sr.No",
  "Transaction ID",
  "ServiceName",
  "EventType",
  "Reference Id",
  "Event Details",
  "Performed By",
  "Created By",
  "Created At",
  "Updated At",
  "Status",
];

export default function AuditTrailPage({ searchQuery = "" }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [eventDetailsPopover, setEventDetailsPopover] = useState(null);
  const [auditRows, setAuditRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const eventDetailsPopoverRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, fromDate, toDate]);

  useEffect(() => {
    if (!eventDetailsPopover) return undefined;

    const handleOutsideInteraction = (event) => {
      if (eventDetailsPopoverRef.current?.contains(event.target)) return;
      setEventDetailsPopover(null);
    };
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") setEventDetailsPopover(null);
    };

    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("keydown", handleEscapeKey);
    window.addEventListener("scroll", handleOutsideInteraction, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("keydown", handleEscapeKey);
      window.removeEventListener("scroll", handleOutsideInteraction, true);
    };
  }, [eventDetailsPopover]);

  const handleEventDetailsClick = (event, row) => {
    if (!row.eventDetails) return;

    if (eventDetailsPopover?.srNo === row.srNo) {
      setEventDetailsPopover(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const viewportMargin = 12;
    const popoverMaxWidth = 380;
    const estimatedWidth = Math.min(popoverMaxWidth, Math.max(rect.width, 260));
    const maxLeft = window.innerWidth - estimatedWidth - viewportMargin;
    const clampedLeft = Math.max(viewportMargin, Math.min(rect.left, maxLeft));

    setEventDetailsPopover({
      srNo: row.srNo,
      rows: flattenEventDetails(row.eventDetails),
      top: rect.bottom + 6,
      left: clampedLeft,
      minWidth: Math.max(rect.width, 260),
    });
  };

  const loadAuditLogs = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setErrorMessage("");
    setEventDetailsPopover(null);

    try {
      const response = await getAuditLogs({
        page: currentPage - 1,
        size: rowsPerPage,
      });
      const { rawRows, totalRecords: apiTotalRecords, totalPages } =
        normalizeAuditLogsResponse(response.data, rowsPerPage);

      if (requestIdRef.current !== requestId) return;

      const pageOffset = (currentPage - 1) * rowsPerPage;

      setAuditRows(
        rawRows.map((row, index) => normalizeAuditLogRow(row, index, pageOffset)),
      );
      setTotalRecords(apiTotalRecords);
      setTotalApiPages(totalPages);
    } catch (fetchError) {
      if (requestIdRef.current !== requestId) return;

      setErrorMessage(
        getAuthErrorMessage(
          fetchError,
          "Unable to load audit trail. Please try again.",
        ),
      );
      setAuditRows([]);
      setTotalRecords(0);
      setTotalApiPages(1);
    } finally {
      if (requestIdRef.current === requestId) setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return auditRows.filter((row) => {
      const createdDate = row.createdAtRaw ? new Date(row.createdAtRaw) : null;
      const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

      if (from && createdDate && createdDate < from) return false;
      if (to && createdDate && createdDate > to) return false;

      if (!normalizedSearch) return true;

      return Object.values(row).some((value) => {
        const text =
          value && typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
        return text.toLowerCase().includes(normalizedSearch);
      });
    });
  }, [auditRows, fromDate, searchQuery, toDate]);

  const totalPages = Math.max(totalApiPages, 1);
  const visibleRows = filteredRows;

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="px-6 pb-10 pt-3">
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-7 shadow-card">
        <div className="mb-5 flex flex-wrap items-center justify-end gap-3 px-3">
          <input
            className="hidden"
            onChange={(event) => {
              setFromDate(event.target.value);
              setCurrentPage(1);
            }}
            ref={fromInputRef}
            type="date"
            value={fromDate}
          />
          <button
            className="flex h-[42px] w-[212px] items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#555555]"
            onClick={(event) =>
              openDashboardDatePicker(fromInputRef.current, event.currentTarget)
            }
            type="button"
          >
            <span>{fromDate || "From"}</span>
            <CalendarDays size={15} />
          </button>

          <input
            className="hidden"
            onChange={(event) => {
              setToDate(event.target.value);
              setCurrentPage(1);
            }}
            ref={toInputRef}
            type="date"
            value={toDate}
          />
          <button
            className="flex h-[42px] w-[212px] items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#555555]"
            onClick={(event) =>
              openDashboardDatePicker(toInputRef.current, event.currentTarget)
            }
            type="button"
          >
            <span>{toDate || "To"}</span>
            <CalendarDays size={15} />
          </button>

          <button
            className="flex h-[42px] items-center gap-2 rounded-lg bg-[#333333] px-8 text-[13px] font-semibold text-white"
            onClick={handleReset}
            type="button"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <ExportFile rows={filteredRows} />
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#ECECEC] bg-white">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1500px] border-collapse">
              <thead className="bg-[#F8F9FB]">
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      className="whitespace-nowrap border-b border-[#ECECEC] px-4 py-4 text-left text-[13px] font-semibold text-[#3F3F46]"
                      key={column}
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
                      className="px-4 py-5 text-center text-[13px] text-[#6B7280]"
                      colSpan={tableColumns.length}
                    >
                      Loading audit trail...
                    </td>
                  </tr>
                )}

                {!isLoading && errorMessage && (
                  <tr>
                    <td
                      className="px-4 py-5 text-center text-[13px] text-[#EB5757]"
                      colSpan={tableColumns.length}
                    >
                      {errorMessage}
                    </td>
                  </tr>
                )}

                {!isLoading && !errorMessage && visibleRows.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-5 text-center text-[13px] text-[#6B7280]"
                      colSpan={tableColumns.length}
                    >
                      No audit trail found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !errorMessage &&
                  visibleRows.map((row) => {
                    const createdAt = splitDateTime(row.createdAtRaw);
                    const updatedAt = splitDateTime(row.updatedAtRaw);

                    return (
                      <tr
                        className="border-b border-[#EEF1F5] text-[13px] text-[#565656] odd:bg-[#FAFAFA] even:bg-white"
                        key={row.srNo}
                      >
                        <td className="px-4 py-3.5">{row.srNo}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <button
                            className="font-semibold text-[#2563FF] underline-offset-2 hover:underline"
                            onClick={() => setSelectedRow(row)}
                            type="button"
                          >
                            {row.transactionId}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {row.serviceName}
                        </td>
                        <td
                          className="max-w-[170px] w-[170px] truncate overflow-hidden px-4 py-3.5"
                          title={row.eventType && row.eventType !== "-" ? row.eventType : undefined}
                        >
                          {row.eventType}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {row.referenceId}
                        </td>
                        <td
                          className="max-w-[170px] w-[170px] truncate overflow-hidden px-4 py-3.5 cursor-pointer"
                          onClick={(event) => handleEventDetailsClick(event, row)}
                          title={
                            row.eventDetails
                              ? eventDetailsPopover?.srNo === row.srNo
                                ? "Click to close"
                                : "Click to view full event details"
                              : undefined
                          }
                        >
                          {summarizeEventDetails(row.eventDetails)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {row.performedBy}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {row.createdBy}
                        </td>
                        <td className="px-4 py-3.5">
                          <DateTimeCell dateTime={createdAt} />
                        </td>
                        <td className="px-4 py-3.5">
                          <DateTimeCell dateTime={updatedAt} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-3.5 py-1 text-[12px] font-semibold ${
                              row.status
                                ? "bg-[#CFF1D5] text-[#008A2E]"
                                : "bg-[#FFE1E1] text-[#FF0D0D]"
                            }`}
                          >
                            {row.status ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-3">
          <p className="text-[12px] text-[#7A7A7A]">
            Showing <strong>{visibleRows.length}</strong> of{" "}
            <strong>{totalRecords}</strong> audit trails
          </p>

          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              type="button"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium ${
                    page === currentPage
                      ? "bg-[#F3F4F6] text-[#111827]"
                      : "text-[#6B7280]"
                  }`}
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ),
            )}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              type="button"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {selectedRow && (
        <AuditTrailDetailModal
          onClose={() => setSelectedRow(null)}
          row={selectedRow}
        />
      )}

      {eventDetailsPopover &&
        createPortal(
          <div
            className="fixed z-[3000] max-h-[320px] max-w-[380px] overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-xl"
            ref={eventDetailsPopoverRef}
            style={{
              top: eventDetailsPopover.top,
              left: eventDetailsPopover.left,
              minWidth: eventDetailsPopover.minWidth,
            }}
          >
            {eventDetailsPopover.rows.length === 0 ? (
              <p className="text-[13px] text-[#8A8A8A]">No details available.</p>
            ) : (
              eventDetailsPopover.rows.map((item, itemIndex) => (
                <div
                  className="mb-2 flex items-start justify-between gap-4 text-[12.5px] last:mb-0"
                  key={`${item.label}-${itemIndex}`}
                >
                  <span className="shrink-0 font-medium text-[#8A8A8A]">
                    {item.label}:
                  </span>
                  <span className="break-words text-right font-medium text-[#202224]">
                    {item.value}
                  </span>
                </div>
              ))
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function DateTimeCell({ dateTime }) {
  return (
    <div className="flex flex-col leading-5">
      <span className="font-medium text-[#0072F0]">{dateTime.date}</span>
      <span className="text-[#008F3A]">{dateTime.time}</span>
    </div>
  );
}

function splitDateTime(value) {
  if (!value) return { date: "-", time: "-" };
  const dateValue = new Date(value);

  if (!Number.isNaN(dateValue.getTime())) {
    return {
      date: dateValue.toLocaleDateString("en-GB").replace(/\//g, " - "),
      time: dateValue.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  return { date: String(value), time: "-" };
}

// Converts a backend-style key (camelCase or snake_case) into a readable
// label, e.g. "totalRiskScore" -> "Total Risk Score".
function formatEventKeyLabel(key) {
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return spaced.replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatEventFieldValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";

  if (/occurredAt|timestamp|createdAt|updatedAt|loggedAt/i.test(key) && typeof value === "number") {
    const epochMs = value < 1e12 ? value * 1000 : value;
    const date = new Date(epochMs);

    if (!Number.isNaN(date.getTime())) {
      return `${date.toLocaleDateString("en-GB").replace(/\//g, "-")} ${date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`;
    }
  }

  return String(value);
}

// Turns a raw string OR a nested object (e.g. a scoring/event payload) into
// a plain-string readable label for a table cell, e.g. "Allow (Score 30)".
function summarizeEventDetails(value) {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value !== "object") {
    const spaced = String(value)
      .replace(/[_-]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .trim()
      .toLowerCase();

    return spaced.replace(/\b\w/g, (character) => character.toUpperCase());
  }

  const decision = value.fraudDecision ?? value.decision ?? value.status ?? value.eventType;
  const score = value.totalRiskScore ?? value.riskScore;

  if (decision) {
    const label = formatEventKeyLabel(String(decision)).replace(/^./, (c) => c.toUpperCase());
    return score !== undefined && score !== null ? `${label} (Score ${score})` : label;
  }

  return "Event Details";
}

// Recursively flattens a nested object into readable {label, value} rows for
// the Event Details popover, e.g. { transactionData: { userId: "USR006" } } ->
// [{ label: "Transaction Data → User Id", value: "USR006" }].
function flattenEventDetails(value, parentLabel = "") {
  if (value === null || value === undefined) return [];

  if (typeof value !== "object") {
    return [{ label: parentLabel || "Value", value: String(value) }];
  }

  if (Array.isArray(value)) {
    const joined = value.length
      ? value.map((item) => (typeof item === "object" ? JSON.stringify(item) : item)).join(", ")
      : "-";

    return [{ label: parentLabel || "Value", value: joined }];
  }

  return Object.entries(value).flatMap(([key, childValue]) => {
    const label = parentLabel
      ? `${parentLabel} → ${formatEventKeyLabel(key)}`
      : formatEventKeyLabel(key);

    if (childValue !== null && typeof childValue === "object" && !Array.isArray(childValue)) {
      return flattenEventDetails(childValue, label);
    }

    if (Array.isArray(childValue)) {
      const joined = childValue.length
        ? childValue
            .map((item) => (typeof item === "object" ? JSON.stringify(item) : item))
            .join(", ")
        : "-";

      return [{ label, value: joined }];
    }

    return [{ label, value: formatEventFieldValue(key, childValue) }];
  });
}

function normalizeAuditLogsResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rawRows = findFirstArray(payload);
  const totalRecords =
    findFirstNumber(payload, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rawRows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rawRows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeAuditLogRow(row, index, pageOffset) {
  const createdAtRaw =
    row.createdAt ??
    row.createdDate ??
    row.timestamp ??
    row.eventTime ??
    row.loggedAt ??
    null;
  const updatedAtRaw = row.updatedAt ?? row.updatedDate ?? createdAtRaw;

  const eventDetails =
    row.eventDetails ??
    row.details ??
    row.description ??
    row.message ??
    row.remarks ??
    null;

  return {
    srNo: pageOffset + index + 1,
    transactionId:
      row.transactionId ??
      row.referenceId ??
      row.entityId ??
      row.id ??
      "-",
    serviceName: row.serviceName ?? row.service ?? row.module ?? row.source ?? "-",
    eventType: row.eventType ?? row.action ?? row.eventName ?? row.activity ?? "-",
    referenceId:
      row.referenceId ?? row.entityId ?? row.refId ?? row.id ?? "-",
    eventDetails,
    performedBy:
      row.performedBy ??
      row.actor ??
      row.userName ??
      row.username ??
      row.createdBy ??
      "-",
    status: normalizeAuditLogStatus(row.status ?? row.result ?? row.outcome),
    createdBy: row.createdBy ?? row.performedBy ?? "-",
    createdAtRaw,
    updatedAtRaw,
    rawEvent: row.rawEvent ?? row.payload ?? row.eventPayload ?? row.metadata ?? row,
    evaluations: Array.isArray(row.evaluations) ? row.evaluations : [],
  };
}

function normalizeAuditLogStatus(value) {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined || value === "") return true;

  const normalized = String(value).trim().toLowerCase();

  if (["success", "true", "completed", "ok", "1"].includes(normalized)) return true;
  if (["failed", "false", "error", "0"].includes(normalized)) return false;

  return true;
}

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
    "auditLogs",
    "logs",
    "data",
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

function findFirstNumber(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return undefined;

  visited.add(value);

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "number") return candidate;

    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      !Number.isNaN(Number(candidate))
    ) {
      return Number(candidate);
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);

    if (candidate !== undefined) return candidate;
  }

  return undefined;
}
