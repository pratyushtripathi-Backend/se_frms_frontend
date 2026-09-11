import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, RotateCcw } from "lucide-react";
import ExportFile from "./ExportFile";
import { openDashboardDatePicker } from "./dashboardDatePicker";
import { getAuthErrorMessage } from "../../auth/services/authError";
import { fetchNotifications } from "../services/notificationService";

const TABLE_COLUMNS = [
  "Sr no",
  "Transaction ID",
  "Type",
  "Recipient",
  "Subject",
  "Fraud Decision",
  "Status",
  "Failed Reason",
  "Created By",
  "Created date",
  "Updated At",
];

const FRAUD_DECISION_STYLES = {
  Allow: "text-emerald-600",
  Block: "text-brand-red",
  Review: "text-[#2563EB]",
};

const STATUS_STYLES = {
  Success: "bg-emerald-50 text-emerald-600",
  Failed: "bg-brand-redSoft text-brand-red",
};

function parseRecordDate(value) {
  if (!value) {
    return null;
  }

  const [day, month, year] = String(value).split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function splitRecordDateTime(value) {
  if (!value) {
    return { date: "-", time: "-" };
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: parsed.toLocaleDateString("en-GB").replace(/\//g, "-"),
      time: parsed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  const [date, time = "-"] = String(value).replace("T", " ").split(" ");
  return { date: date || "-", time };
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  const preferredKeys = ["content", "records", "items", "rows", "list", "entries", "data"];

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

    if (typeof candidate === "string" && candidate.trim() && !Number.isNaN(Number(candidate))) {
      return Number(candidate);
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);
    if (candidate !== undefined) return candidate;
  }

  return undefined;
}

function normalizeNotificationsResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ?? responseData?.data?.responseData ?? responseData?.data ?? responseData;
  const rawRows = findFirstArray(payload);
  const totalRecords =
    findFirstNumber(payload, ["totalElements", "totalRecords", "totalCount", "total", "count"]) ??
    rawRows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rawRows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeNotificationRow(row, index, pageOffset) {
  const created = splitRecordDateTime(row.createdAt ?? row.createdDate ?? row.created_at);
  const updated = splitRecordDateTime(row.updatedAt ?? row.updatedDate ?? row.updated_at);
  const isSuccess =
    typeof row.success === "boolean"
      ? row.success
      : typeof row.sent === "boolean"
        ? row.sent
        : undefined;

  return {
    id: row.id ?? row.notificationId ?? pageOffset + index + 1,
    srNo: pageOffset + index + 1,
    transactionId: row.transactionId ?? row.txnId ?? row.referenceId ?? "-",
    type: row.type ?? row.channel ?? row.notificationType ?? "-",
    recipient: row.recipient ?? row.recipientAddress ?? row.to ?? "-",
    subject: row.subject ?? row.title ?? row.message ?? "-",
    fraudDecision: row.fraudDecision ?? row.decision ?? "-",
    status:
      row.status ??
      (isSuccess !== undefined ? (isSuccess ? "Success" : "Failed") : "-"),
    failedReason: row.failedReason ?? row.failureReason ?? row.errorMessage ?? "-",
    createdBy: row.createdBy ?? "System",
    createdDate: created.date,
    createdTime: created.time,
    updatedDate: updated.date,
    updatedTime: updated.time,
  };
}

export default function NotificationRecordPage({ searchQuery = "" }) {
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 10;
  const requestIdRef = useRef(0);
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadNotifications = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const requestedPage = isLocalFilterActive ? 0 : currentPage - 1;
      const response = await fetchNotifications({
        page: requestedPage,
        size: rowsPerPage,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const normalizedResponse = normalizeNotificationsResponse(response, rowsPerPage);
      let normalizedRows = normalizedResponse.rawRows.map((row, index) =>
        normalizeNotificationRow(row, index, requestedPage * rowsPerPage),
      );

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            fetchNotifications({ page: index + 1, size: rowsPerPage }),
          ),
        );

        remainingResponses.forEach((pageResponse, pageIndex) => {
          const pageOffset = (pageIndex + 1) * rowsPerPage;
          normalizedRows = normalizedRows.concat(
            findFirstArray(pageResponse?.responseData ?? pageResponse).map((row, index) =>
              normalizeNotificationRow(row, index, pageOffset),
            ),
          );
        });
      }

      setRows(normalizedRows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalApiPages(normalizedResponse.totalPages);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setRows([]);
      setTotalRecords(0);
      setTotalApiPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load notification records. Please try again."),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, isLocalFilterActive]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      if (year && parseRecordDate(row.createdDate)?.getFullYear() !== Number(year)) {
        return false;
      }

      const rowDate = parseRecordDate(row.createdDate);

      if (fromDate && rowDate && rowDate < new Date(fromDate)) {
        return false;
      }

      if (toDate && rowDate && rowDate > new Date(toDate)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [row.transactionId, row.type, row.recipient, row.subject, row.fraudDecision, row.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [rows, year, fromDate, toDate, searchQuery]);

  const isPaginatingLocally = isLocalFilterActive;
  const totalPages = isPaginatingLocally
    ? Math.max(Math.ceil(filteredRows.length / rowsPerPage), 1)
    : totalApiPages;
  const visibleRows = isPaginatingLocally
    ? filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredRows;
  const effectiveTotalRecords = isPaginatingLocally ? filteredRows.length : totalRecords;
  const showingFrom = effectiveTotalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, effectiveTotalRecords);

  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    0,
    5,
  );

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">
      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">
        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Notification Record
          </h2>

          <div className="flex items-center gap-3">
            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(event) => {
                  setYear(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-[105px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] text-[#202224] outline-none"
              >
                <option value="">Year</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>

            {/* From */}
            <>
              <input
                ref={fromInputRef}
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setCurrentPage(1);
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={(event) => openDashboardDatePicker(fromInputRef.current, event.currentTarget)}
                className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
              >
                <span>{fromDate || "From"}</span>
                <CalendarDays size={15} />
              </button>
            </>

            {/* To */}
            <>
              <input
                ref={toInputRef}
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setCurrentPage(1);
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={(event) => openDashboardDatePicker(toInputRef.current, event.currentTarget)}
                className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
              >
                <span>{toDate || "To"}</span>
                <CalendarDays size={15} />
              </button>
            </>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <ExportFile rows={filteredRows} />
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-visible rounded-xl border border-[#ECECEC] bg-white">
          {errorMessage && (
            <div className="mx-4 mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#D92D20]">
              {errorMessage}
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1450px] border-collapse">
              <thead className="bg-[#F8F9FB]">
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap border-b border-[#ECECEC] px-4 py-4 text-left text-[13px] font-semibold text-[#5A5A5A]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
                      Loading notification records...
                    </td>
                  </tr>
                )}

                {!isLoading && visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
                      No notification records found.
                    </td>
                  </tr>
                )}

                {!isLoading && visibleRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#EEF1F5] text-[13px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {isPaginatingLocally
                        ? (currentPage - 1) * rowsPerPage + index + 1
                        : row.srNo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">{row.transactionId}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.type}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.recipient}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.subject}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-4 font-semibold ${
                        FRAUD_DECISION_STYLES[row.fraudDecision] ?? "text-[#202224]"
                      }`}
                    >
                      {row.fraudDecision}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${
                          STATUS_STYLES[row.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="max-w-[240px] px-4 py-4 text-[#6F6F6F]">{row.failedReason}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.createdBy}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[13px] leading-5">
                        <span className="font-medium text-[#2F80ED]">{row.createdDate}</span>
                        <span className="text-[#27AE60]">{row.createdTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[13px] leading-5">
                        <span className="font-medium text-[#2F80ED]">{row.updatedDate}</span>
                        <span className="text-[#27AE60]">{row.updatedTime}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">
            <p className="text-[13px] text-[#7A7A7A]">
              Showing <strong>{showingFrom}</strong> - <strong>{showingTo}</strong> of{" "}
              <strong>{effectiveTotalRecords}</strong> notifications
            </p>

            <div className="flex items-center gap-2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                type="button"
              >
                &lt;
              </button>

              {visiblePageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                    page === currentPage
                      ? "bg-[#F3F4F6] text-[#111827]"
                      : "text-[#6B7280] hover:bg-[#F8F8F8]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                type="button"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
