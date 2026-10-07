import { scrollIntoHorizontalStrip } from "../../utils/scrollPageStrip";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import ExportFile from "../../components/ExportFile";
import { getAuthErrorMessage } from "../../../auth/services/authError";
import { getLoginHistory } from "../../services/loginHistoryService";
import DashboardStatusToggle from "../../components/DashboardStatusToggle";

import { openDashboardDatePicker } from "../../utils/dashboardDatePicker";
import { LIVE_REFRESH_MS, useRefreshTick } from "../../utils/useAutoRefresh";
const TABLE_COLUMNS = [
  "Sr No",
  "User Name",
  "Date",
  "Time",
  "IP",
  "Mac Address",
  "Latitude",
  "Longitude",
  "Url",
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

export default function LoginHistoryPage({ searchQuery = "" }) {
  const pageSize = 10;
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const initialCache = pageCache.get(pageCacheKey(0, pageSize, searchQuery, false));
  const [loginHistoryRows, setLoginHistoryRows] = useState(() => initialCache?.rows ?? []);
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

  // Auto-refresh: bumps every few seconds (while the tab is visible) and is
  // a dependency of the loader effect below, so the current page re-fetches
  // quietly. Paused while a Year/From/To filter is active, because that mode
  // fetches every page.
  const refreshTick = useRefreshTick({
    intervalMs: LIVE_REFRESH_MS,
    enabled: !isLocalFilterActive,
  });

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
    async function loadLoginHistory() {
      const requestedPage = isLocalFilterActive ? 0 : currentPage;
      const cacheKey = pageCacheKey(
        requestedPage,
        pageSize,
        searchQuery,
        isLocalFilterActive,
      );
      const cached = pageCache.get(cacheKey);

      if (cached) {
        setLoginHistoryRows(cached.rows);
        setTotalRecords(cached.totalRecords);
        setTotalPages(cached.totalPages);
        setIsLoading(false);
      } else {
        // The current rows stay on screen (dimmed) until the new ones arrive.
        setIsLoading(true);
      }
      setError("");

      try {
        const response = await getLoginHistory({
          page: requestedPage,
          size: pageSize,
          search: searchQuery,
        });
        const normalizedResponse = normalizeLoginHistoryResponse(response.data);
        const normalizedRows = [...normalizedResponse.rows];

        if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
          const remainingResponses = await Promise.all(
            Array.from(
              { length: normalizedResponse.totalPages - 1 },
              (_, index) =>
                getLoginHistory({
                  page: index + 1,
                  size: pageSize,
                  search: searchQuery,
                }),
            ),
          );

          remainingResponses.forEach((pageResponse) => {
            normalizedRows.push(
              ...normalizeLoginHistoryResponse(pageResponse.data).rows,
            );
          });
        }

        if (normalizedRows.length === 0) {
          console.warn("Login history response did not contain rows:", response.data);
        }

        if (!isActive) {
          return;
        }

        setLoginHistoryRows(normalizedRows);
        pageCache.set(cacheKey, {
          rows: normalizedRows,
          totalRecords: normalizedResponse.totalRecords,
          totalPages: normalizedResponse.totalPages,
        });
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalPages(normalizedResponse.totalPages);
      } catch (loginHistoryError) {
        if (!isActive) {
          return;
        }
        // Keep showing the cached rows if a background refresh fails.
        if (cached) return;

        setError(
          getAuthErrorMessage(
            loginHistoryError,
            "Unable to load login history. Please try again.",
          ),
        );
        setLoginHistoryRows([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadLoginHistory();

    return () => {
      isActive = false;
    };
  }, [currentPage, isLocalFilterActive, searchQuery, refreshTick]);

  const filteredData = useMemo(() => {
    return loginHistoryRows.filter((item) => {
      const itemDate = parseDisplayDate(item.createdDate);

      if (!itemDate) return true;

      const yearValue = String(itemDate.getFullYear());

      if (year && yearValue !== year) return false;
      if (fromDate && itemDate < parseDateOnly(fromDate)) return false;
      if (toDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    });
  }, [fromDate, loginHistoryRows, toDate, year]);

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
            All Login History Details
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

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="relative w-full overflow-x-auto">

            {isLoading && visibleData.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-16">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#333333]" />
              </div>
            )}

            <table className="w-full min-w-[1500px] border-collapse">

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
                    className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {currentPage * pageSize + index + 1}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {item.userName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.date}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.time}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.ip}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.macAddress}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.latitude}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.longitude}
                    </td>

                    <td className="px-4 py-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2F80ED] hover:underline"
                      >
                        {item.url}
                      </a>
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle status={item.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.createdBy}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
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
                      No login history found.
                    </td>
                  </tr>
                )}

                {isLoading && visibleData.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-[13px] font-medium text-[#7A7A7A]"
                      colSpan={TABLE_COLUMNS.length}
                    >
                      Loading login history...
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

function normalizeLoginHistoryResponse(responseData) {
  const pageData = getPagePayload(responseData);
  const sourceRows = findFirstArray(pageData);
  const rows = sourceRows.map(normalizeLoginHistoryRow);
  const totalRecords =
    findFirstNumber(responseData, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ??
    rows.length;
  const totalPages =
    findFirstNumber(responseData, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / 10), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeLoginHistoryRow(row, index) {
  const createdAt =
    row.createdAt ??
    row.createdDate ??
    row.loginAt ??
    row.loginTime ??
    row.timestamp ??
    row.createdOn;
  const updatedAt = row.updatedAt ?? row.updatedDate ?? row.updatedOn;
  const userName = getUserName(row);

  return {
    id: row.id ?? row.loginHistoryId ?? row.historyId ?? index + 1,
    userId: row.userId ?? row.user_id ?? row.user?.id ?? row.user?.userId ?? "-",
    userName,
    date: row.date ?? row.loginDate ?? formatDate(createdAt),
    time: row.time ?? row.loginTimeValue ?? formatTime(createdAt),
    ip: row.ip ?? row.ipAddress ?? row.loginIp ?? row.clientIp ?? "-",
    macAddress:
      row.macAddress ??
      row.mac_address ??
      row.deviceMac ??
      row.deviceMacAddress ??
      "-",
    latitude: formatCoordinate(
      row.latitude ??
        row.lat ??
        row.latitute ??
        row.lattitude ??
        row.location?.latitude ??
        row.location?.lat,
    ),
    longitude: formatCoordinate(
      row.longitude ??
        row.lng ??
        row.long ??
        row.longitute ??
        row.longtitude ??
        row.location?.longitude ??
        row.location?.lng ??
        row.location?.long,
    ),
    url: row.url ?? row.requestUrl ?? row.endpoint ?? row.apiUrl ?? "-",
    createdBy:
      row.createdBy ??
      userName ??
      row.username ??
      row.name ??
      row.user?.name ??
      "-",
    ...splitLoginDateTime(row.createdDate ?? createdAt),
    status: row.status ?? row.loginStatus ?? row.result ?? "Success",
    ...splitLoginDateTime(row.updatedDate ?? updatedAt, "updated"),
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

function getPagePayload(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  return (
    responseData?.data?.content ??
    responseData?.data?.records ??
    responseData?.data?.items ??
    responseData?.data?.loginHistory ??
    responseData?.data?.loginHistoryList ??
    responseData?.data ??
    responseData
  );
}

function findFirstArray(value, visited = new Set()) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "object" || visited.has(value)) {
    return [];
  }

  visited.add(value);

  const preferredKeys = [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "loginHistory",
    "loginHistoryList",
    "data",
  ];

  for (const key of preferredKeys) {
    const childArray = findFirstArray(value[key], visited);

    if (childArray.length > 0) {
      return childArray;
    }
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);

    if (childArray.length > 0) {
      return childArray;
    }
  }

  return [];
}

function findFirstNumber(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) {
    return undefined;
  }

  visited.add(value);

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "number") {
      return candidate;
    }

    if (typeof candidate === "string" && candidate.trim() && !Number.isNaN(Number(candidate))) {
      return Number(candidate);
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);

    if (candidate !== undefined) {
      return candidate;
    }
  }

  return undefined;
}

function parseDisplayDate(dateValue) {
  if (!dateValue || dateValue === "-") {
    return null;
  }

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
  if (!value) {
    return "-";
  }

  const stringValue = String(value).replace("T", " ").split(".")[0];
  const isoDate = stringValue.match(/^\d{4}-\d{2}-\d{2}/);

  if (isoDate) return isoDate[0];

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString().slice(0, 10);
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const stringValue = String(value).replace("T", " ").split(".")[0];
  const timeMatch = stringValue.match(/\b\d{2}:\d{2}(?::\d{2})?/);

  if (timeMatch) return timeMatch[0];

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function splitLoginDateTime(value, prefix = "created") {
  const date = formatDate(value);
  const time = formatTime(value);

  return prefix === "updated"
    ? { updatedDate: date, updatedTime: time }
    : { createdDate: date, createdTime: time };
}

function formatCoordinate(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "-";
  }

  return String(value);
}
