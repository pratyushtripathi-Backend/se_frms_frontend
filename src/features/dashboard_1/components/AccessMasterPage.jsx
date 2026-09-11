import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createAccessName,
  deleteAccessName,
  getAccessList,
  updateAccessName,
  updateAccessStatus,
} from "../services/adminEmployeeService";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";
import DashboardSuccessModal from "./DashboardSuccessModal";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const TABLE_COLUMNS = [
  "Sr No",
  "Access",
  "Status",
  "Created By",
  "Created at",
  "Updated At",
  "Action",
];

export default function AccessMasterPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [accessRows, setAccessRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add Access modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null);
  const [accessName, setAccessName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalVariant, setSuccessModalVariant] = useState("success");
  const [successModalTitle, setSuccessModalTitle] = useState(
    "Access Created Successfully",
  );

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 20;
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadAccessList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAccessList({
        page: isLocalFilterActive ? 0 : currentPage - 1,
        size: rowsPerPage,
        accessName: searchQuery,
      });
      const normalizedResponse = normalizeAccessResponse(
        response.data,
        rowsPerPage,
      );
      const normalizedRows = [...normalizedResponse.rows];

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            getAccessList({
              page: index + 1,
              size: rowsPerPage,
              accessName: searchQuery,
            }),
          ),
        );

        remainingResponses.forEach((pageResponse) => {
          normalizedRows.push(
            ...normalizeAccessResponse(pageResponse.data, rowsPerPage).rows,
          );
        });
      }

      setAccessRows(normalizedRows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
    } catch (error) {
      setAccessRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to load access details. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLocalFilterActive, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAccessList();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAccessList]);

  const filteredData = useMemo(() => {
    return accessRows.filter((item) => {
      const itemDate = parseAccessDate(item.createdDate);
      const itemYear = itemDate ? String(itemDate.getFullYear()) : "";

      if (year && itemYear !== year) return false;

      if (fromDate && itemDate < parseDateOnly(fromDate)) return false;

      if (toDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    });
  }, [accessRows, fromDate, toDate, year]);

  const effectiveTotalRecords = isLocalFilterActive ? filteredData.length : totalRecords;
  const effectiveTotalPages = Math.max(Math.ceil(effectiveTotalRecords / rowsPerPage), 1);
  const visibleData = isLocalFilterActive
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;

  const handleYearChange = (value) => {
    setYear(value);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccess(null);
    setAccessName("");
  };

  const handleSave = async () => {
    const trimmedAccessName = accessName.trim();

    if (!trimmedAccessName) {
      setSuccessMessage("Access name is required.");
      setSuccessModalVariant("error");
      setShowSuccessModal(true);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        accessName: trimmedAccessName,
      };
      const response = editingAccess
        ? await updateAccessName(editingAccess.id, payload)
        : await createAccessName(payload);
      const nextSuccessTitle = editingAccess
        ? "Access Updated Successfully"
        : "Access Created Successfully";

      closeModal();
      setSuccessModalTitle(nextSuccessTitle);
      setSuccessModalVariant("success");
      setSuccessMessage(
        response.data?.responseMessage ||
          (editingAccess
            ? "Access updated successfully."
            : "Access created successfully."),
      );
      setShowSuccessModal(true);
      await loadAccessList();
    } catch (error) {
      setSuccessMessage(
        getAuthErrorMessage(
          error,
          "Unable to create access. Please try again.",
        ),
      );
      setSuccessModalVariant("error");
      setShowSuccessModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToPage = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  const handleEditAccess = (item) => {
    setOpenActionMenu(null);
    setEditingAccess(item);
    setAccessName(item.access === "-" ? "" : item.access);
    setIsModalOpen(true);
  };

  const handleDeleteAccess = async (item) => {
    setOpenActionMenu(null);
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await deleteAccessName(item.id);

      setSuccessMessage(
        response.data?.responseMessage || "Access deleted successfully.",
      );
      setSuccessModalVariant("success");
      setShowSuccessModal(true);
      await loadAccessList();
    } catch (error) {
      setSuccessMessage(
        getAuthErrorMessage(
          error,
          "Unable to delete access. Please try again.",
        ),
      );
      setSuccessModalVariant("error");
      setShowSuccessModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (item, nextStatus) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await updateAccessStatus(item.id, nextStatus);

      setSuccessMessage(
        response.data?.responseMessage || "Access status updated successfully.",
      );
      setSuccessModalVariant("success");
      setShowSuccessModal(true);
      await loadAccessList();
    } catch (error) {
      setSuccessMessage(
        getAuthErrorMessage(
          error,
          "Unable to update access status. Please try again.",
        ),
      );
      setSuccessModalVariant("error");
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Access Details
          </h2>

          <div className="flex items-center gap-3">
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
              onClick={handleResetFilters}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            {/* Add Access */}
            <button
              type="button"
              onClick={() => {
                setEditingAccess(null);
                setAccessName("");
                setIsModalOpen(true);
              }}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#FF0D0D] bg-white px-4 text-[13px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1]"
            >
              <span>Add Access</span>
              <Plus size={16} strokeWidth={2.5} />
            </button>

          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1000px] border-collapse">

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
                {isLoading && (
                  <tr className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563]">
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-6 text-center">
                      Loading access details...
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.length === 0 && (
                  <tr className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563]">
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-6 text-center">
                      No access details found.
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.access}
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) =>
                          handleStatusToggle(item, nextStatus)
                        }
                        status={item.status}
                      />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
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

                    <td className="relative px-4 py-4">
                      <DashboardEditButton
                        onClick={() => handleEditAccess(item)}
                      >
                        Edit
                      </DashboardEditButton>
                    </td>
                  </tr>
                ))}
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
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                type="button"
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(effectiveTotalPages, 5) }, (_, index) => index + 1).map((page) => (
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
                disabled={currentPage >= effectiveTotalPages}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, effectiveTotalPages))}
                type="button"
              >
                &gt;
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* Add Access Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={closeModal}
        >
          <div
            className="w-[400px] max-w-[92vw] rounded-2xl bg-white px-8 py-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="flex h-7 w-7 items-center justify-center text-[#111111]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[#333]">
                {editingAccess ? "Edit Access" : "Add Access"}
              </label>
              <input
                type="text"
                value={accessName}
                onChange={(e) => setAccessName(e.target.value)}
                placeholder="Add Access"
                className="h-[46px] w-full rounded-lg border border-[#E5E7EB] px-3.5 text-[13px] text-[#333] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-[46px] rounded-lg bg-[#6B6B6B] px-8 text-[14px] font-semibold text-white"
            >
              {isSaving ? "Saving..." : editingAccess ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <DashboardSuccessModal
          message={successMessage || successModalTitle}
          onClose={handleBackToPage}
          variant={successModalVariant}
        />
      )}

    </div>
  );
}

function normalizeAccessResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeAccessRow).filter(Boolean);
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
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeAccessRow(item, index) {
  if (!item || typeof item !== "object") return null;

  const createdAt = item.createdAt ?? item.createdDate ?? item.createdOn;
  const updatedAt = item.updatedAt ?? item.updatedDate ?? item.updatedOn;

  return {
    id: item.id ?? item.accessId ?? index + 1,
    access:
      item.access ??
      item.accessName ??
      item.name ??
      item.permissionName ??
      "-",
    createdBy: item.createdBy ?? item.createdByName ?? "-",
    createdDate: formatDatePart(createdAt),
    createdTime: formatTimePart(createdAt),
    updatedDate: formatDatePart(updatedAt),
    updatedTime: formatTimePart(updatedAt),
    status: formatStatus(item.status),
  };
}

function formatStatus(status) {
  if (status === null || status === undefined || status === "") return "-";
  if (typeof status === "boolean") return status ? "Success" : "Block";

  return String(status);
}

function formatDatePart(value) {
  if (!value) return "-";
  const stringValue = String(value);
  const datePart = stringValue.split("T")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-");
    return `${day}-${month}-${year}`;
  }

  return datePart;
}

function formatTimePart(value) {
  if (!value) return "-";
  const stringValue = String(value);

  if (!stringValue.includes("T")) return "-";

  return stringValue.split("T")[1]?.split(".")[0] ?? "-";
}

function parseAccessDate(value) {
  if (!value || value === "-") return new Date(0);
  const dateValue = String(value);

  if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
    const [day, month, year] = dateValue.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(dateValue);
}

function parseDateOnly(dateValue, endOfDay = false) {
  const date = new Date(`${dateValue}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);

  return Number.isNaN(date.getTime()) ? null : date;
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
    "accessList",
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

  return hasAccessIdentity(value) ? [value] : [];
}

function hasAccessIdentity(item) {
  return Boolean(
    item?.id ||
      item?.accessId ||
      item?.access ||
      item?.accessName ||
      item?.name ||
      item?.permissionName,
  );
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
