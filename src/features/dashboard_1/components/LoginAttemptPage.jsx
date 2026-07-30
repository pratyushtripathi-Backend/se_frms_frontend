import { useState, useRef, useMemo, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import ExportFile from "./ExportFile";
import { getAuthErrorMessage } from "../../auth/services/authError";
import { getLoginAttempts } from "../services/loginAttemptService";
import DashboardStatusToggle from "./DashboardStatusToggle";

const TABLE_COLUMNS = [
  "Sr No",
  "User Name",
  "Email",
  "IP",
  "Created By",
  "Attempt Reason",
  "Status",
  "Created At",
  "Updated At",
];

export default function LoginAttemptPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loginAttemptRows, setLoginAttemptRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const pageSize = 10;

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadLoginAttempts() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getLoginAttempts({
          page: currentPage,
          search: searchQuery,
          size: pageSize,
        });
        const normalizedResponse = normalizeLoginAttemptResponse(response.data);

        if (!isActive) return;

        if (normalizedResponse.rows.length === 0) {
          console.warn("Login attempt response did not contain rows:", response.data);
        }

        setLoginAttemptRows(normalizedResponse.rows);
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalPages(normalizedResponse.totalPages);
      } catch (loginAttemptError) {
        if (!isActive) return;

        setError(
          getAuthErrorMessage(
            loginAttemptError,
            "Unable to load login attempts. Please try again.",
          ),
        );
        setLoginAttemptRows([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadLoginAttempts();

    return () => {
      isActive = false;
    };
  }, [currentPage, searchQuery]);

  const filteredData = useMemo(() => {
    return loginAttemptRows.filter((item) => {
      const itemDate = parseDisplayDate(item.attemptDate);

      if (!itemDate) return true;

      const yearValue = String(itemDate.getFullYear());

      if (year && yearValue !== year) return false;

      if (fromDate && itemDate < new Date(fromDate)) return false;

      if (toDate && itemDate > new Date(toDate)) return false;

      return true;
    });
  }, [fromDate, loginAttemptRows, toDate, year]);

  const visiblePageNumbers = useMemo(() => {
    const pageCount = Math.max(totalPages, 1);
    const startPage = Math.max(Math.min(currentPage - 2, pageCount - 5), 0);
    const endPage = Math.min(startPage + 5, pageCount);

    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
  }, [currentPage, totalPages]);

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            Login Attempt Details
          </h2>

          <div className="flex items-center gap-3">
            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
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
                className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
              >
                <span>{toDate || "To"}</span>
                <CalendarDays size={15} />
              </button>
            </>

            {/* Export */}
            <ExportFile rows={filteredData} />

          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1050px] border-collapse">

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

              <tbody>
                {filteredData.map((item, index) => (
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

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.email}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.ip}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.createdBy}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.attemptReason}
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle status={item.status} />
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

                {!isLoading && !error && filteredData.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-[13px] font-medium text-[#7A7A7A]"
                      colSpan={TABLE_COLUMNS.length}
                    >
                      No login attempts found.
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-[13px] font-medium text-[#7A7A7A]"
                      colSpan={TABLE_COLUMNS.length}
                    >
                      Loading login attempts...
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
              Showing {filteredData.length} of {totalRecords} transactions
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

              {visiblePageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                    page === currentPage
                      ? "bg-[#F3F4F6] text-[#111827]"
                      : "text-[#6B7280] hover:bg-[#F8F8F8]"
                  }`}
                  type="button"
                >
                  {page + 1}
                </button>
              ))}

              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage >= totalPages - 1 || isLoading}
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages - 1))
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

function normalizeLoginAttemptResponse(responseData) {
  const pageData = getLoginAttemptPagePayload(responseData);
  const sourceRows = findFirstArray(pageData);
  const rows = sourceRows.map(normalizeLoginAttemptRow);
  const totalRecords =
    findFirstNumber(responseData, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rows.length;
  const totalPages =
    findFirstNumber(responseData, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / 10), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function getLoginAttemptPagePayload(responseData) {
  if (Array.isArray(responseData)) return responseData;

  const responsePayload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  if (Array.isArray(responsePayload)) return responsePayload;

  return (
    responsePayload?.content ??
    responsePayload?.records ??
    responsePayload?.items ??
    responsePayload?.rows ??
    responsePayload?.loginAttempts ??
    responsePayload?.loginAttemptList ??
    responsePayload?.data ??
    responsePayload
  );
}

function normalizeLoginAttemptRow(row, index) {
  const attemptAt = getAttemptTimestamp(row);
  const rawStatus = getLoginAttemptStatus(row);
  const createdDate = getFirstDisplayValue(
    row.createdAtDate,
    row.createdDateOnly,
    row.createdDate,
    row.CreatedDate,
    row.attemptDate,
    row.AttemptDate,
    row.loginDate,
    formatDate(attemptAt),
  );
  const createdTime = getFirstDisplayValue(
    row.createdAtTime,
    row.createdTimeOnly,
    row.createdTime,
    row.CreatedTime,
    row.attemptTime,
    row.AttemptTime,
    row.loginTime,
    formatTime(attemptAt),
  );
  const updatedDate = getFirstDisplayValue(
    row.updatedAtDate,
    row.updatedDateOnly,
    row.updatedAt,
    row.updatedDate,
    row.UpdatedDate,
    row.attemptDate,
    row.AttemptDate,
    row.loginDate,
    formatDate(attemptAt),
  );
  const updatedTime = getFirstDisplayValue(
    row.updatedAtTime,
    row.updatedTimeOnly,
    row.updatedTime,
    row.UpdatedTime,
    row.attemptTime,
    row.AttemptTime,
    row.loginTime,
    formatTime(attemptAt),
  );
  const userName = getUserName(row);

  return {
    id: row.id ?? row.loginAttemptId ?? row.attemptId ?? index + 1,
    userId: row.userId ?? row.user_id ?? row.user?.id ?? row.user?.userId ?? "-",
    userName,
    email: row.email ?? row.userEmail ?? row.user?.email ?? "-",
    ip: row.ip ?? row.ipAddress ?? row.loginIp ?? row.clientIp ?? "-",
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
    attemptReason:
      row.attemptReason ??
      row.reason ??
      row.failureReason ??
      row.message ??
      "-",
    status: normalizeAttemptStatus(
      rawStatus,
    ),
    attemptDate: createdDate,
    attemptTime: createdTime,
    createdDate,
    createdTime,
    updatedDate,
    updatedTime,
  };
}

function getLoginAttemptStatus(row) {
  return getFirstDisplayValue(
    row.AttemptStatus,
    row.attemptStatus,
    row.attempt_status,
    row.attemptstatus,
    row.attemptedStatus,
    row.attempted_status,
    row.loginAttemptStatus,
    row.login_attempt_status,
    row.status,
    row.success,
    row.isSuccess,
    getValueByNormalizedKey(row, [
      "attemptstatus",
      "attemptedstatus",
      "loginattemptstatus",
      "status",
      "success",
      "issuccess",
    ]),
  );
}

function getAttemptTimestamp(row) {
  const combinedDateTime = combineDateAndTime(
    row.attemptDate ?? row.AttemptDate ?? row.loginDate,
    row.attemptTime ?? row.AttemptTime ?? row.loginTime,
  );

  return (
    row.attemptAt ??
    row.AttemptAt ??
    row.AttemptAT ??
    row.attemptAT ??
    row.attempt_at ??
    row.loginAttemptAt ??
    row.loginAttemptDateTime ??
    row.createdAt ??
    row.CreatedAt ??
    row.createdDateTime ??
    row.timestamp ??
    combinedDateTime ??
    row.createdDate
  );
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue) return undefined;
  if (!timeValue) return dateValue;

  return `${dateValue}T${timeValue}`;
}

function getFirstDisplayValue(...values) {
  const value = values.find(
    (item) => item !== null && item !== undefined && item !== "",
  );

  return value ?? "-";
}

function getValueByNormalizedKey(row, keys) {
  if (!row || typeof row !== "object") return undefined;

  const keySet = new Set(keys);
  const entry = Object.entries(row).find(([key, value]) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

    return (
      keySet.has(normalizedKey) &&
      value !== null &&
      value !== undefined &&
      value !== ""
    );
  });

  return entry?.[1];
}

function normalizeAttemptStatus(status) {
  if (status === true) return "True";
  if (status === false) return "False";
  if (status === null || status === undefined || status === "") return "-";

  const normalizedStatus = String(status).trim();

  if (normalizedStatus.toLowerCase() === "true") return "True";
  if (normalizedStatus.toLowerCase() === "false") return "False";

  return normalizedStatus;
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

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-GB");
}

function formatTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    "loginAttempts",
    "loginAttempt",
    "loginAttemptList",
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

  return hasLoginAttemptIdentity(value) ? [value] : [];
}

function hasLoginAttemptIdentity(row) {
  if (!row || typeof row !== "object") return false;

  return [
    row.id,
    row.loginAttemptId,
    row.attemptId,
    row.email,
    row.userName,
    row.username,
    row.AttemptStatus,
    row.attemptStatus,
    row.attemptReason,
    row.reason,
    row.ipAddress,
    row.url,
    row.createdDate,
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
