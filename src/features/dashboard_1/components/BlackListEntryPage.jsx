import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import DashboardStatusToggle from "./DashboardStatusToggle";
import DashboardSuccessModal from "./DashboardSuccessModal";
import { openDashboardDatePicker } from "./dashboardDatePicker";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createBlacklistEntry,
  getBlacklistEntries,
  removeBlacklistEntry,
} from "../services/blacklistService";

const TABLE_COLUMNS = [
  "Sr no",
  "Type",
  "Value",
  "Reason",
  "RiskType",
  "Created At",
  "Created By",
  "Updated At",
  "Status",
  "Action",
];

const TYPE_OPTIONS = ["Device", "Location", "IP"];
const RISK_TYPE_OPTIONS = ["High", "Medium", "Low"];

const EMPTY_FORM = { type: "", value: "", reason: "", riskType: "" };

function parseEntryDate(value) {
  if (!value) {
    return null;
  }

  const [day, month, year] = String(value).split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function splitEntryDateTime(value) {
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

function normalizeBlacklistResponse(responseData, pageSize) {
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

function normalizeBlacklistRow(row, index, pageOffset) {
  const created = splitEntryDateTime(row.createdAt ?? row.createdDate ?? row.created_at);
  const updated = splitEntryDateTime(row.updatedAt ?? row.updatedDate ?? row.updated_at);

  return {
    id: row.id ?? row.entryId ?? row.blacklistId ?? pageOffset + index + 1,
    srNo: pageOffset + index + 1,
    type: row.type ?? row.entryType ?? "-",
    value: row.value ?? row.entryValue ?? "-",
    reason: row.reason ?? row.remarks ?? row.description ?? "-",
    riskType: row.riskType ?? row.risk ?? row.riskLevel ?? "-",
    status:
      typeof row.status === "boolean"
        ? row.status
          ? "Active"
          : "Inactive"
        : row.status ?? (row.isActive === false ? "Inactive" : "Active"),
    createdBy: row.createdBy ?? "-",
    createdDate: created.date,
    createdTime: created.time,
    updatedDate: updated.date,
    updatedTime: updated.time,
  };
}

export default function BlackListEntryPage({ searchQuery = "" }) {
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 10;
  const requestIdRef = useRef(0);
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadEntries = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const requestedPage = isLocalFilterActive ? 0 : currentPage - 1;
      const response = await getBlacklistEntries({
        page: requestedPage,
        size: rowsPerPage,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const normalizedResponse = normalizeBlacklistResponse(response?.data, rowsPerPage);
      let normalizedRows = normalizedResponse.rawRows.map((row, index) =>
        normalizeBlacklistRow(row, index, requestedPage * rowsPerPage),
      );

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            getBlacklistEntries({ page: index + 1, size: rowsPerPage }),
          ),
        );

        remainingResponses.forEach((pageResponse, pageIndex) => {
          const pageOffset = (pageIndex + 1) * rowsPerPage;
          normalizedRows = normalizedRows.concat(
            findFirstArray(
              pageResponse?.data?.responseData ?? pageResponse?.data,
            ).map((row, index) => normalizeBlacklistRow(row, index, pageOffset)),
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
        getAuthErrorMessage(error, "Unable to load blacklist entries. Please try again."),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, isLocalFilterActive]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      if (year && parseEntryDate(row.createdDate)?.getFullYear() !== Number(year)) {
        return false;
      }

      const rowDate = parseEntryDate(row.createdDate);

      if (fromDate && rowDate && rowDate < new Date(fromDate)) {
        return false;
      }

      if (toDate && rowDate && rowDate > new Date(toDate)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [row.type, row.value, row.reason, row.riskType]
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

  const handleAddEntryClick = () => {
    setFormValues(EMPTY_FORM);
    setFormError("");
    setShowAddEntryModal(true);
  };

  const handleCloseModal = () => {
    setShowAddEntryModal(false);
  };

  const handleFormChange = (field, value) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmitEntry = async () => {
    if (!formValues.type || !formValues.value || !formValues.reason || !formValues.riskType) {
      setFormError("Please fill all fields to blacklist entry.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      await createBlacklistEntry({
        type: formValues.type,
        value: formValues.value,
        reason: formValues.reason,
        riskType: formValues.riskType,
      });

      setShowAddEntryModal(false);
      setSuccessMessage("Blacklist entry added successfully.");
      setCurrentPage(1);
      await loadEntries();
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "Unable to add blacklist entry. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClick = (row) => {
    setRemoveError("");
    setRemoveTarget(row);
  };

  const handleCancelRemove = () => {
    setRemoveTarget(null);
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) {
      return;
    }

    setIsRemoving(true);
    setRemoveError("");

    try {
      await removeBlacklistEntry(removeTarget.id);
      setRemoveTarget(null);
      setSuccessMessage("Blacklist entry removed successfully.");
      await loadEntries();
    } catch (error) {
      setRemoveError(
        getAuthErrorMessage(error, "Unable to remove this blacklist entry. Please try again."),
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">
      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">
        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#202224]">
            Black List Entry
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

            <button
              type="button"
              onClick={handleAddEntryClick}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#EB5757] bg-white px-4 text-[12px] font-semibold text-[#EB5757]"
            >
              Add Entry
              <Plus size={15} />
            </button>
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
                      Loading blacklist entries...
                    </td>
                  </tr>
                )}

                {!isLoading && visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
                      No blacklist entries found.
                    </td>
                  </tr>
                )}

                {!isLoading && visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#EEF1F5] text-[13px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">{row.srNo}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.type}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.value}</td>
                    <td className="max-w-[280px] px-4 py-4 text-[#6F6F6F]">{row.reason}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.riskType}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[13px] leading-5">
                        <span className="font-medium text-[#2F80ED]">{row.createdDate}</span>
                        <span className="text-[#27AE60]">{row.createdTime}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">{row.createdBy}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[13px] leading-5">
                        <span className="font-medium text-[#2F80ED]">{row.updatedDate}</span>
                        <span className="text-[#27AE60]">{row.updatedTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) => {
                          // No status-update endpoint has been provided for
                          // blacklist entries yet, so this only updates the
                          // local view - it does not persist to the backend.
                          setRows((previousRows) =>
                            previousRows.map((item) =>
                              item.id === row.id
                                ? { ...item, status: nextStatus ? "Active" : "Inactive" }
                                : item,
                            ),
                          );
                        }}
                        status={row.status}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(row)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#EB5757] px-3 py-1.5 text-[12px] font-semibold text-[#EB5757]"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
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
              <strong>{effectiveTotalRecords}</strong> transactions
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

      {showAddEntryModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-[560px] max-w-[94vw] rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute right-6 top-6 text-[#202224]"
            >
              <X size={20} />
            </button>

            <h3 className="mb-1 text-[16px] font-semibold text-[#202224]">
              Add Blacklist Entry
            </h3>
            <p className="mb-6 text-[13px] text-[#7A7A7A]">
              Fill all fileds to blacklist entry
            </p>

            <div className="mb-5 grid grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#202224]">
                  Type
                </label>
                <div className="relative">
                  <select
                    value={formValues.type}
                    onChange={(event) => handleFormChange("type", event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[13px] text-[#202224] outline-none"
                  >
                    <option value="">Type</option>
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#202224]">
                  Value
                </label>
                <input
                  type="text"
                  value={formValues.value}
                  onChange={(event) => handleFormChange("value", event.target.value)}
                  placeholder="Value"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#202224] outline-none placeholder:text-[#A0A0A0]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#202224]">
                  Reason
                </label>
                <input
                  type="text"
                  value={formValues.reason}
                  onChange={(event) => handleFormChange("reason", event.target.value)}
                  placeholder="Writer a Reason"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#202224] outline-none placeholder:text-[#A0A0A0]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#202224]">
                  Risk Type
                </label>
                <div className="relative">
                  <select
                    value={formValues.riskType}
                    onChange={(event) => handleFormChange("riskType", event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[13px] text-[#202224] outline-none"
                  >
                    <option value="">Risk Type</option>
                    {RISK_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <p className="mb-4 text-[13px] font-semibold text-[#D92D20]">{formError}</p>
            )}

            <button
              type="button"
              onClick={handleSubmitEntry}
              disabled={isSubmitting}
              className="h-[46px] w-[160px] rounded-lg border-none bg-[#333333] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {removeTarget && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={handleCancelRemove}
        >
          <div
            className="w-[520px] max-w-[94vw] rounded-lg bg-white px-10 py-12 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex justify-center">
              <Trash2 size={52} className="text-black" strokeWidth={1.75} />
            </div>

            <h3 className="mb-4 text-[20px] font-semibold text-[#202224]">
              Remove Blacklist Entry
            </h3>

            <p className="mx-auto mb-6 max-w-[380px] text-[14px] leading-6 text-[#7A7A7A]">
              Are you sure you want to remove{" "}
              <strong className="text-[#202224]">{removeTarget.value}</strong> from the
              blacklist?
            </p>

            {removeError && (
              <p className="mb-4 text-[13px] font-semibold text-[#D92D20]">{removeError}</p>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelRemove}
                disabled={isRemoving}
                className="h-[46px] w-[140px] rounded-lg border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#202224] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="h-[46px] w-[140px] rounded-lg border-none bg-[#EB5757] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <DashboardSuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
}
