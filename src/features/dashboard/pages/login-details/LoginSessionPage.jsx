import { scrollIntoHorizontalStrip } from "../../utils/scrollPageStrip";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import ExportFile from "../../components/ExportFile";
import { getAuthErrorMessage } from "../../../auth/services/authError";
import { getLoginSessions } from "../../services/loginSessionService";
import DashboardStatusToggle from "../../components/DashboardStatusToggle";

import { openDashboardDatePicker } from "../../utils/dashboardDatePicker";
const TABLE_COLUMNS = [
  "Sr No",
  "User Name",
  "Session Active Date",
  "Session Active Time",
  "Token",
  "Status",
  "Created By",
  "Created Date",
  "Updated At",
];

// Rows already loaded on this page, kept across visits (the page unmounts
// when you leave it) and keyed by page / size / search / filter mode, so the
// table shows instantly when you come back and then refreshes quietly.
const pageCache = new Map();
const pageCacheKey = (requestedPage, size, search, isLocalFilterActive) =>
  JSON.stringify([requestedPage, size, search ?? "", isLocalFilterActive]);

export default function LoginSessionPage({ searchQuery = "" }) {
  const pageSize = 10;
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const initialCache = pageCache.get(pageCacheKey(0, pageSize, searchQuery, false));
  const [loginSessionRows, setLoginSessionRows] = useState(() => initialCache?.rows ?? []);
  const [totalRecords, setTotalRecords] = useState(() => initialCache?.totalRecords ?? 0);
  const [totalPages, setTotalPages] = useState(() => initialCache?.totalPages ?? 1);
  // Starts true when nothing is cached, so the first paint shows
  // "Loading…" rather than flashing "No … found".
  const [isLoading, setIsLoading] = useState(() => !initialCache);
  const [error, setError] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const pageScrollRef = useRef(null);
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleYearChange = (value) => {
    setYear(value);
    setCurrentPage(0);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(0);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(0);
  };

  useEffect(() => {
    let isActive = true;

    // isActive (reset by the effect cleanup) is the stale-response guard:
    // a slower request for a page/search you've already left is ignored.
    async function loadLoginSessions() {
      const requestedPage = isLocalFilterActive ? 0 : currentPage;
      const cacheKey = pageCacheKey(
        requestedPage,
        pageSize,
        searchQuery,
        isLocalFilterActive,
      );
      const cached = pageCache.get(cacheKey);

      if (cached) {
        setLoginSessionRows(cached.rows);
        setTotalRecords(cached.totalRecords);
        setTotalPages(cached.totalPages);
        setIsLoading(false);
      } else {
        // The current rows stay on screen (dimmed) until the new ones arrive.
        setIsLoading(true);
      }
      setError("");

      try {
        const response = await getLoginSessions({
          page: requestedPage,
          size: pageSize,
          email: searchQuery,
        });
        const normalizedResponse = normalizeLoginSessionResponse(response.data);
        const normalizedRows = [...normalizedResponse.rows];

        if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
          const remainingResponses = await Promise.all(
            Array.from(
              { length: normalizedResponse.totalPages - 1 },
              (_, index) =>
                getLoginSessions({
                  page: index + 1,
                  size: pageSize,
                  email: searchQuery,
                }),
            ),
          );

          remainingResponses.forEach((pageResponse) => {
            normalizedRows.push(
              ...normalizeLoginSessionResponse(pageResponse.data).rows,
            );
          });
        }

        if (!isActive) return;

        if (normalizedRows.length === 0) {
          console.warn("Login session response did not contain rows:", response.data);
        }

        setLoginSessionRows(normalizedRows);
        pageCache.set(cacheKey, {
          rows: normalizedRows,
          totalRecords: normalizedResponse.totalRecords,
          totalPages: normalizedResponse.totalPages,
        });
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalPages(normalizedResponse.totalPages);
      } catch (loginSessionError) {
        if (!isActive) return;
        // Keep showing the cached rows if a background refresh fails.
        if (cached) return;

        setError(
          getAuthErrorMessage(
            loginSessionError,
            "Unable to load login sessions. Please try again.",
          ),
        );
        setLoginSessionRows([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadLoginSessions();

    return () => {
      isActive = false;
    };
  }, [currentPage, isLocalFilterActive, searchQuery]);

  const filteredData = useMemo(() => {
    return loginSessionRows.filter((item) => {
      const itemDate = parseDisplayDate(item.createdDate);

      if (!itemDate) return true;

      const yearValue = String(itemDate.getFullYear());

      if (year && yearValue !== year) return false;
      if (fromDate && itemDate < parseDateOnly(fromDate)) return false;
      if (toDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    });
  }, [fromDate, loginSessionRows, toDate, year]);

  const handleClearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setCurrentPage(0);
  };

  const effectiveTotalRecords = isLocalFilterActive ? filteredData.length : totalRecords;
  const effectiveTotalPages = Math.max(Math.ceil(effectiveTotalRecords / pageSize), 1);
  const visibleData = isLocalFilterActive
    ? filteredData.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
    : filteredData;

  // Keeps the current page's button scrolled into view within the
  // horizontally-scrollable page-number strip (e.g. after using the
  // prev/next arrows to move past what's currently visible).
  useEffect(() => {
    const container = pageScrollRef.current;
    const activeButton = container?.querySelector(`[data-page="${currentPage}"]`);
    scrollIntoHorizontalStrip(activeButton);
  }, [currentPage, effectiveTotalPages]);

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            Login Session Details
          </h2>

          <div className="flex items-center gap-3">
            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
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
                onChange={(e) => handleFromDateChange(e.target.value)}
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
                onChange={(e) => handleToDateChange(e.target.value)}
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
              onClick={handleClearDateFilter}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            {/* Export */}
            <ExportFile rows={filteredData} />

          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="relative w-full overflow-x-auto">

            {isLoading && visibleData.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-16">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#333333]" />
              </div>
            )}

            <table className="w-full min-w-[1350px] border-collapse">

              <thead className="bg-[#F8F9FB]">
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap border-b border-[#ECECEC] px-4 py-4 text-left text-[12px] font-semibold text-[#5A5A5A]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody
                className={`transition-opacity duration-200 ${
                  isLoading && visibleData.length > 0 ? "opacity-50" : "opacity-100"
                }`}
              >
                {visibleData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {currentPage * pageSize + index + 1}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {item.userName}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.sessionDate}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.sessionTime}
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px]">
                      {item.token}
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle status={item.status} />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.createdBy}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[12px] leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.createdDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.createdTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[12px] leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.updatedDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.updatedTime}
                        </span>
                      </div>
                    </td>

                  </tr>
                ))}

                {!isLoading && !error && visibleData.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-[13px] font-medium text-[#7A7A7A]"
                      colSpan={TABLE_COLUMNS.length}
                    >
                      No login sessions found.
                    </td>
                  </tr>
                )}

                {isLoading && visibleData.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-[13px] font-medium text-[#7A7A7A]"
                      colSpan={TABLE_COLUMNS.length}
                    >
                      Loading login sessions...
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-[13px] font-medium text-[#D81F2C]"
                      colSpan={TABLE_COLUMNS.length}
                    >
                      {error}
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
                    {/* Bottom Bar */}
          <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">

            <p className="text-[12px] text-[#7A7A7A]">
              Showing {visibleData.length} of {effectiveTotalRecords} transactions
            </p>

            <div className="flex items-center gap-2">

              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === 0 || isLoading}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                type="button"
              >
                &lt;
              </button>

              <div
                ref={pageScrollRef}
                className="flex items-center gap-2 overflow-x-auto scroll-smooth"
                style={{ maxWidth: `${5 * 32 + 4 * 8}px`, scrollbarWidth: "thin" }}
              >
                {Array.from({ length: effectiveTotalPages }, (_, index) => index).map((page) => (
                  <button
                    key={page}
                    data-page={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[12px] font-medium transition ${
                      page === currentPage
                        ? "bg-[#F3F4F6] text-[#111827]"
                        : "text-[#6B7280] hover:bg-[#F8F8F8]"
                    }`}
                    type="button"
                  >
                    {page + 1}
                  </button>
                ))}
              </div>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage >= effectiveTotalPages - 1 || isLoading}
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, effectiveTotalPages - 1))
                }
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

function normalizeLoginSessionResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  if (payload === null || payload === undefined) {
    return {
      rows: [],
      totalRecords: 0,
      totalPages: 1,
    };
  }

  if (typeof payload !== "object") {
    return {
      rows: [normalizeLoginSessionRow({ status: payload }, 0)],
      totalRecords: 1,
      totalPages: 1,
    };
  }

  const rows = findFirstArray(payload);
  const normalizedRows =
    rows.length > 0
      ? rows.map(normalizeLoginSessionRow)
      : hasLoginSessionIdentity(payload)
        ? [normalizeLoginSessionRow(payload, 0)]
        : [];
  const totalRecords =
    findFirstNumber(responseData, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? normalizedRows.length;
  const totalPages =
    findFirstNumber(responseData, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / 10), 1);

  return {
    rows: normalizedRows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeLoginSessionRow(row, index) {
  const createdAt =
    row.createdAt ??
    combineDateAndTime(
      row.createdDate ?? row.createdOn ?? row.sessionActiveDate,
      row.createdTime ?? row.createdOnTime ?? row.sessionActiveTime,
    ) ??
    row.sessionCreatedAt ??
    row.loginAt ??
    row.timestamp;
  const activeAt =
    combineDateAndTime(
      row.sessionDate ?? row.sessionActiveDate,
      row.sessionTime ?? row.sessionActiveTime,
    ) ??
    row.sessionActiveAt ??
    row.activeAt ??
    row.lastActiveAt ??
    row.updatedAt ??
    row.updatedDate;
  const updatedAt =
    row.updatedAt ??
    combineDateAndTime(row.updatedDate ?? row.updatedOn, row.updatedTime ?? row.updatedOnTime) ??
    activeAt;
  const sessionDate = formatDate(activeAt);
  const sessionTime = formatTime(activeAt);
  const createdDate = formatDate(createdAt);
  const createdTime = formatTime(createdAt);
  const updatedDate = formatDate(updatedAt);
  const updatedTime = formatTime(updatedAt);
  const userName = getUserName(row);

  return {
    id: row.id ?? row.sessionId ?? row.loginSessionId ?? index + 1,
    userId: row.userId ?? row.user_id ?? row.user?.id ?? row.user?.userId ?? "-",
    userName,
    createdDate,
    createdTime,
    sessionDate,
    sessionTime,
    createdBy:
      row.createdBy ??
      row.email ??
      userName ??
      row.username ??
      row.name ??
      row.user?.name ??
      "-",
    token: maskToken(row.token ?? row.accessToken ?? row.jwt ?? row.sessionToken ?? "-"),
    status:
      normalizeStatus(
        row.status ??
      row.sessionStatus ??
      row.active ??
      row.isActive ??
      row.valid ??
      row.isValid,
      ),
    updatedDate,
    updatedTime,
  };
}

function getUserName(row) {
  const firstName = row.firstName ?? row.first_name ?? row.user?.firstName ?? "";
  const lastName = row.lastName ?? row.last_name ?? row.user?.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const userName =
    row.userName ??
    row.username ??
    row.name ??
    row.fullName ??
    row.employeeName ??
    row.user?.userName ??
    row.user?.username ??
    row.user?.name ??
    row.user?.fullName ??
    fullName;

  return userName || "-";
}

function parseDisplayDate(dateValue) {
  if (!dateValue || dateValue === "-") return null;

  if (dateValue.includes("/")) {
    const [day, month, year] = dateValue.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(dateValue);
}

function parseDateOnly(dateValue, endOfDay = false) {
  const date = new Date(`${dateValue}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  if (!value) return "-";

  const stringValue = String(value).replace("T", " ").split(".")[0];
  const isoDate = stringValue.match(/^\d{4}-\d{2}-\d{2}/);

  if (isoDate) return isoDate[0];

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString().slice(0, 10);
}

function formatTime(value) {
  if (!value) return "-";

  const stringValue = String(value).replace("T", " ").split(".")[0];
  const timeMatch = stringValue.match(/\b\d{2}:\d{2}(?::\d{2})?/);

  if (timeMatch) return timeMatch[0];

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue) return undefined;
  if (!timeValue) return dateValue;

  return `${dateValue}T${timeValue}`;
}

function maskToken(token) {
  if (typeof token !== "string" || token.length <= 16) {
    return token;
  }

  return `${token.slice(0, 8)}...${token.slice(-8)}`;
}

function normalizeStatus(status) {
  if (status === true) return "True";
  if (status === false) return "False";
  if (status === null || status === undefined || status === "") return "-";

  return String(status);
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
    "sessions",
    "session",
    "loginSessions",
    "loginSessionList",
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

  if (hasLoginSessionIdentity(value)) {
    return [value];
  }

  return [];
}

function hasLoginSessionIdentity(row) {
  if (!row || typeof row !== "object") return false;

  return [
    row.id,
    row.sessionId,
    row.loginSessionId,
    row.userId,
    row.user_id,
    row.user?.id,
    row.user?.userId,
    row.email,
    row.userName,
    row.username,
    row.name,
    row.token,
    row.accessToken,
    row.jwt,
    row.sessionToken,
    row.sessionActiveDate,
    row.sessionActiveTime,
    row.sessionActiveAt,
    row.activeAt,
    row.lastActiveAt,
  ].some((value) => value !== null && value !== undefined && value !== "");
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
