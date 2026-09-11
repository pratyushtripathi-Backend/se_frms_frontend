import { useEffect, useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";
import ExportFile from "./ExportFile";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createRuleCategory,
  getRuleCategories,
  updateRuleCategory,
  updateRuleCategoryStatus,
} from "../services/fraudDetailsService";
import DashboardSuccessModal from "./DashboardSuccessModal";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const TABLE_COLUMNS = [
  "S.No",
  "Category Name",
  "Status",
  "Created By",
  "Created At",
  "Updated At",
  "Action",
];

export default function AllCategoryPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [failureModalMessage, setFailureModalMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 10;
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadCategories = async ({ showLoader = true } = {}) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage("");

    try {
      const requestedPage = isLocalFilterActive ? 0 : currentPage - 1;
      const response = await getRuleCategories({
        page: requestedPage,
        search: searchQuery,
        size: rowsPerPage,
      });
      const normalizedResponse = normalizeCategoryResponse(
        response.data,
        rowsPerPage,
      );
      const normalizedRows = [...normalizedResponse.rows];

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            getRuleCategories({
              page: index + 1,
              search: searchQuery,
              size: rowsPerPage,
            }),
          ),
        );

        remainingResponses.forEach((pageResponse) => {
          normalizedRows.push(
            ...normalizeCategoryResponse(pageResponse.data, rowsPerPage).rows,
          );
        });
      }

      setCategories(normalizedRows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
    } catch (error) {
      setCategories([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load categories. Please try again."),
      );
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialCategories() {
      if (isActive) await loadCategories();
    }

    loadInitialCategories();

    return () => {
      isActive = false;
    };
  }, [currentPage, searchQuery, isLocalFilterActive]);

  const filteredData = useMemo(() => {
    return categories.filter((item) => {
      const itemDate = parseDateValue(item.createdDate);
      const yearValue = itemDate ? String(itemDate.getFullYear()) : "";

      if (year && yearValue !== year) return false;

      if (fromDate && itemDate && itemDate < parseDateOnly(fromDate)) return false;

      if (toDate && itemDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    }).sort(sortByRecentCreated);
  }, [categories, year, fromDate, toDate]);

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

  const effectiveTotalRecords = isLocalFilterActive ? filteredData.length : totalRecords;
  const effectiveTotalPages = Math.max(Math.ceil(effectiveTotalRecords / rowsPerPage), 1);
  const visibleData = isLocalFilterActive
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;
  const visiblePageNumbers = useMemo(() => {
    const pageCount = Math.max(effectiveTotalPages, 1);
    const startPage = Math.max(Math.min(currentPage - 2, pageCount - 4), 1);
    const endPage = Math.min(startPage + 4, pageCount);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [currentPage, effectiveTotalPages]);
  const showingFrom = effectiveTotalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, effectiveTotalRecords);

  const handleAddCategoryClick = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setNewCategoryName("");
    setEditingCategory(null);
    setShowAddCategoryModal(true);
  };

  const handleCancelAddCategory = () => {
    if (isSavingCategory) return;
    setShowAddCategoryModal(false);
    setEditingCategory(null);
    setNewCategoryName("");
  };

  const handleAddCategorySave = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setErrorMessage("Category name is required.");
      return;
    }

    setIsSavingCategory(true);
    setErrorMessage("");
    setSuccessMessage("");
    setFailureModalMessage("");

    try {
      const payload = {
        categoryName: trimmedName,
      };
      const response = editingCategory
        ? await updateRuleCategory(editingCategory.id, payload)
        : await createRuleCategory(payload);

      setShowAddCategoryModal(false);
      setEditingCategory(null);
      setNewCategoryName("");
      const nextMessage =
        response.data?.responseMessage ||
        (editingCategory
          ? "Category updated successfully."
          : "Category created successfully.");
      setSuccessMessage(nextMessage);
      setSuccessModalMessage(nextMessage);
      await loadCategories({ showLoader: false });
    } catch (error) {
      const nextErrorMessage = getAuthErrorMessage(
        error,
        editingCategory
          ? "Unable to update category. Please try again."
          : "Unable to create category. Please try again.",
      );
      setErrorMessage(nextErrorMessage);
      setFailureModalMessage(nextErrorMessage);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleEditClick = (item) => {
    setOpenActionId(null);
    setSuccessMessage("");
    setErrorMessage("");
    setEditingCategory(item);
    setNewCategoryName(item.categoryName === "-" ? "" : item.categoryName);
    setShowAddCategoryModal(true);
  };

  const handleDeleteClick = (item) => {
    setOpenActionId(null);
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    setDeleteTarget(null);
    setSuccessMessage("Category deleted successfully.");
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            Category Overview
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
              onClick={handleResetFilters}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <ExportFile rows={filteredData} />

            <button
              type="button"
              onClick={handleAddCategoryClick}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#EB5757] bg-white px-4 text-[12px] font-semibold text-[#EB5757]"
            >
              Add Category
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
          {successMessage && (
            <div className="mx-4 mt-4 rounded-lg bg-green-50 px-4 py-3 text-[13px] font-semibold text-[#15803D]">
              {successMessage}
            </div>
          )}

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1100px] border-collapse">

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
                      Loading categories...
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
                      No categories found.
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="relative border-b border-[#EEF1F5] text-[13px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.categoryName}
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) =>
                          updateRuleCategoryStatus(item.id, nextStatus)
                        }
                        status={item.status}
                      />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.createdBy}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[13px] leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.createdDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.createdTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[13px] leading-5">
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
                        onClick={() => handleEditClick(item)}
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

            <p className="text-[13px] text-[#7A7A7A]">
              Showing <strong>{showingFrom}</strong> - <strong>{showingTo}</strong>{" "}
              of <strong>{effectiveTotalRecords}</strong> transactions
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
                disabled={currentPage >= effectiveTotalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, effectiveTotalPages))
                }
                type="button"
              >
                &gt;
              </button>

            </div>

          </div>

        </div>
      </div>

      {showAddCategoryModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={handleCancelAddCategory}
        >
          <div
            className="relative w-[760px] max-w-[94vw] rounded-lg bg-white p-10 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCancelAddCategory}
              className="absolute right-6 top-6 text-[#202224]"
            >
              <X size={20} />
            </button>

            <p className="mb-3 text-[14px] font-medium text-[#202224]">
              {editingCategory ? "Edit Category" : "Add Category"}
            </p>

            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder={editingCategory ? "Edit Category" : "Add Category"}
              className="mb-8 h-12 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] text-[#202224] outline-none placeholder:text-[#A0A0A0]"
            />

            <button
              type="button"
              onClick={handleAddCategorySave}
              disabled={isSavingCategory}
              className="h-[46px] w-[140px] rounded-lg border-none bg-[#4B4B4B] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingCategory ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={handleCancelDelete}
        >
          <div
            className="w-[760px] max-w-[94vw] rounded-lg bg-white px-12 py-14 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex justify-center">
              <Trash2 size={56} className="text-black" strokeWidth={1.75} />
            </div>

            <h3 className="mb-4 text-[20px] font-semibold text-[#202224]">
              Delete Category
            </h3>

            <p className="mx-auto mb-8 max-w-[420px] text-[14px] leading-6 text-[#7A7A7A]">
              Are you sure you want to delete this Category. This action is
              permanent and cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="h-[46px] w-[140px] rounded-lg border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#202224]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-[46px] w-[140px] rounded-lg border-none bg-[#EB5757] text-[14px] font-semibold text-white"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {successModalMessage && (
        <DashboardSuccessModal
          message={successModalMessage}
          onClose={() => setSuccessModalMessage("")}
        />
      )}

      {failureModalMessage && (
        <DashboardSuccessModal
          message={failureModalMessage}
          onClose={() => setFailureModalMessage("")}
          variant="error"
        />
      )}

    </div>
  );
}

function normalizeCategoryResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeCategoryRow);
  const totalRecords =
    findFirstNumber(payload, ["totalElements", "totalRecords", "totalCount", "total", "count"]) ??
    rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeCategoryRow(row, index) {
  return {
    id: row.id ?? row.categoryId ?? index + 1,
    categoryName: row.categoryName ?? row.name ?? row.ruleCategoryName ?? "-",
    ...splitDateTime(row.createdAt ?? row.createdDate),
    createdBy: row.createdBy ?? "-",
    ...splitDateTime(row.updatedAt, "updated"),
    status: formatStatus(row.status),
  };
}

function splitDateTime(value, prefix = "created") {
  const formatted = formatDateTime(value);
  const [date, time = ""] = formatted.split(" ");

  return prefix === "updated"
    ? { updatedDate: date, updatedTime: time }
    : { createdDate: date, createdTime: time };
}

function formatDateTime(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").split(".")[0];
}

function formatStatus(status) {
  if (typeof status === "boolean") return status ? "Success" : "Failed";
  if (status === null || status === undefined || status === "") return "-";
  return String(status);
}

function parseDateValue(value) {
  if (!value || value === "-") return null;
  const normalized = String(value).replace("T", " ").split(" ")[0];
  const parts = normalized.split("-");

  if (parts[0]?.length === 4) return new Date(normalized);
  if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

  return null;
}

function parseDateOnly(dateValue, endOfDay = false) {
  const date = new Date(`${dateValue}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function sortByRecentCreated(currentItem, nextItem) {
  const currentTime = parseDateTimeValue(
    currentItem.createdDate,
    currentItem.createdTime,
  );
  const nextTime = parseDateTimeValue(nextItem.createdDate, nextItem.createdTime);

  return nextTime - currentTime;
}

function parseDateTimeValue(dateValue, timeValue) {
  const date = parseDateValue(dateValue);

  if (!date) return 0;
  if (!timeValue || timeValue === "-") return date.getTime();

  const [hours = 0, minutes = 0, seconds = 0] = String(timeValue)
    .split(":")
    .map((part) => Number(part) || 0);

  date.setHours(hours, minutes, seconds, 0);

  return date.getTime();
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  for (const key of ["content", "records", "items", "rows", "list", "categories", "ruleCategories", "data"]) {
    const childArray = findFirstArray(value[key], visited);
    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);
    if (childArray.length > 0) return childArray;
  }

  return hasRowIdentity(value) ? [value] : [];
}

function hasRowIdentity(row) {
  return Boolean(row?.id || row?.categoryName || row?.name || row?.ruleCategoryName);
}

function findFirstNumber(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return undefined;

  visited.add(value);

  for (const key of keys) {
    const candidate = Number(value[key]);
    if (Number.isFinite(candidate)) return candidate;
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);
    if (candidate !== undefined) return candidate;
  }

  return undefined;
}
