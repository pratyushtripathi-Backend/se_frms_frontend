import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import ExportFile from "./ExportFile";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createFraudRule,
  deleteFraudRule,
  getFraudRules,
  getRuleCategories,
  updateFraudRule,
  updateFraudRuleStatus,
} from "../services/fraudDetailsService";
import DashboardSuccessModal from "./DashboardSuccessModal";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const TABLE_COLUMNS = [
  "S.No",
  "Category Name",
  "Rule Code",
  "Rule Name",
  "Rule Description",
  "Rule Expression",
  "Status",
  "Created By",
  "Created At",
  "Updated At",
  "Action",
];

export default function AllFraudRulesPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fraudRules, setFraudRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [isDeletingRule, setIsDeletingRule] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [failureModalMessage, setFailureModalMessage] = useState("");
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [ruleCode, setRuleCode] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleExpression, setRuleExpression] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 10;
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadFraudRules = useCallback(async ({ showLoader = true, searchValue = searchQuery } = {}) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage("");

    try {
      const requestedPage = isLocalFilterActive ? 0 : currentPage - 1;
      const response = await getFraudRules({
        page: requestedPage,
        search: searchValue,
        size: rowsPerPage,
      });
      const normalizedResponse = normalizeFraudRulesResponse(
        response.data,
        rowsPerPage,
      );
      const normalizedRows = [...normalizedResponse.rows];

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            getFraudRules({
              page: index + 1,
              search: searchValue,
              size: rowsPerPage,
            }),
          ),
        );

        remainingResponses.forEach((pageResponse) => {
          normalizedRows.push(
            ...normalizeFraudRulesResponse(pageResponse.data, rowsPerPage).rows,
          );
        });
      }

      setFraudRules(normalizedRows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
      if (currentPage > normalizedResponse.totalPages) {
        setCurrentPage(normalizedResponse.totalPages);
      }
    } catch (error) {
      setFraudRules([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load fraud rules. Please try again."),
      );
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [currentPage, isLocalFilterActive, searchQuery]);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const response = await getRuleCategories({ page: 0, size: 10 });
      setCategories(normalizeCategoryOptions(response.data));
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to fetch categories. Please try again."),
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialFraudRules() {
      if (!isActive) return;
      await Promise.all([
        loadFraudRules({ searchValue: searchQuery }),
        loadCategories(),
      ]);
    }

    loadInitialFraudRules();

    return () => {
      isActive = false;
    };
  }, [searchQuery, loadCategories, loadFraudRules]);

  const filteredData = useMemo(() => {
    return fraudRules.filter((item) => {
      const itemDate = parseDateValue(item.createdDate);
      const yearValue = itemDate ? String(itemDate.getFullYear()) : "";

      if (year && yearValue !== year) return false;

      if (fromDate && itemDate && itemDate < parseDateOnly(fromDate)) return false;

      if (toDate && itemDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    }).sort(sortByRecentCreated);
  }, [fraudRules, year, fromDate, toDate]);

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

  const categoryById = useMemo(() => {
    return categories.reduce((lookup, category) => {
      lookup.set(String(category.id), category);
      return lookup;
    }, new Map());
  }, [categories]);
  const activeCategories = useMemo(
    () => categories.filter((category) => isActiveStatus(category.status)),
    [categories],
  );

  const isRuleSectionActive = selectedCategoryId !== "";
  const canSaveRule =
    isRuleSectionActive && ruleName.trim() !== "" && ruleCode.trim() !== "";

  const handleOpenAddRule = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    setSelectedCategoryId("");
    setRuleName("");
    setRuleCode("");
    setRuleDescription("");
    setRuleExpression("");
    setEditingRule(null);
    setShowAddRuleModal(true);
    if (categories.length === 0) await loadCategories();
  };

  const handleCloseAddRule = () => {
    if (isSavingRule) return;
    setShowAddRuleModal(false);
    setEditingRule(null);
  };

  const handleSaveRule = async () => {
    if (!canSaveRule) return;

    setIsSavingRule(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFailureModalMessage("");

    try {
      const payload = {
        categoryId: Number(selectedCategoryId),
        ruleCode: ruleCode.trim(),
        ruleDescription: ruleDescription.trim(),
        ruleExpression: ruleExpression.trim(),
        ruleName: ruleName.trim(),
        status: true,
      };
      const response = editingRule
        ? await updateFraudRule(editingRule.id, {
            ...payload,
            status: editingRule.status === "Failed" ? false : true,
          })
        : await createFraudRule(payload);

      setShowAddRuleModal(false);
      setEditingRule(null);
      const nextMessage =
        response.data?.responseMessage ||
        (editingRule
          ? "Fraud rule updated successfully."
          : "Fraud rule created successfully.");
      setSuccessMessage(nextMessage);
      setSuccessModalMessage(nextMessage);
      await loadFraudRules({
        searchValue: searchQuery,
        showLoader: false,
      });
    } catch (error) {
      const nextErrorMessage = getAuthErrorMessage(
        error,
        editingRule
          ? "Unable to update fraud rule. Please try again."
          : "Unable to create fraud rule. Please try again.",
      );
      setErrorMessage(nextErrorMessage);
      setFailureModalMessage(nextErrorMessage);
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleEditRule = async (item) => {
    setOpenActionId(null);
    setSuccessMessage("");
    setErrorMessage("");
    setEditingRule(item);
    setSelectedCategoryId(item.categoryId === "-" ? "" : String(item.categoryId));
    setRuleName(item.ruleName === "-" ? "" : item.ruleName);
    setRuleCode(item.ruleCode === "-" ? "" : item.ruleCode);
    setRuleDescription(
      item.ruleDescription === "-" ? "" : item.ruleDescription,
    );
    setRuleExpression(item.ruleExpression === "-" ? "" : item.ruleExpression);
    setShowAddRuleModal(true);
    if (categories.length === 0) await loadCategories();
  };

  const handleDeleteRule = (item) => {
    setOpenActionId(null);
    setSuccessMessage("");
    setErrorMessage("");
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    if (isDeletingRule) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeletingRule(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await deleteFraudRule(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMessage(
        response.data?.responseMessage || "Fraud rule deleted successfully.",
      );
      await loadFraudRules({
        searchValue: searchQuery,
        showLoader: false,
      });
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to delete fraud rule. Please try again."),
      );
    } finally {
      setIsDeletingRule(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Fraud Rules Overview
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

            {/* Export */}
            <ExportFile rows={filteredData} />

            <button
              type="button"
              onClick={handleOpenAddRule}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#EB5757] bg-white px-4 text-[12px] font-semibold text-[#EB5757]"
            >
              Add Fraud Rule
              <Plus size={15} />
            </button>

          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">
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

            <table className="w-full min-w-[1650px] border-collapse">

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
                      Loading fraud rules...
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
                      No fraud rules found.
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#EEF1F5] text-[13px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {getCategoryDisplay(item, categoryById)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.ruleCode}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.ruleName}
                    </td>

                    <td className="max-w-[320px] px-4 py-4">
                      {item.ruleDescription}
                    </td>

                    <td className="max-w-[320px] px-4 py-4">
                      {item.ruleExpression}
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) =>
                          updateFraudRuleStatus(item.id, nextStatus)
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
                        onClick={() => handleEditRule(item)}
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

      {showAddRuleModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4"
          onClick={handleCloseAddRule}
        >
          <div
            className="w-[940px] max-h-[90vh] max-w-[92vw] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-[17px] font-bold text-[#202224]">
                {editingRule ? "Edit Fraud Rule" : "Create Fraud Rule"}
              </h3>

              <button
                type="button"
                onClick={handleCloseAddRule}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#202224] text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Choose Category
                </label>

                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    disabled={isLoadingCategories}
                    onChange={(event) => setSelectedCategoryId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 pr-9 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                  >
                    <option value="">
                      {isLoadingCategories ? "Loading categories..." : "Select Category"}
                    </option>
                    {!isLoadingCategories && activeCategories.length === 0 && (
                      <option disabled value="">
                        No active categories found
                      </option>
                    )}
                    {activeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Name
                </label>

                <input
                  type="text"
                  value={ruleName}
                  disabled={!isRuleSectionActive}
                  onChange={(event) => setRuleName(event.target.value)}
                  placeholder="Rule Name"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Code
                </label>

                <input
                  type="text"
                  value={ruleCode}
                  disabled={!isRuleSectionActive}
                  onChange={(event) => setRuleCode(event.target.value)}
                  placeholder="Rule Code"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Description
                </label>

                <textarea
                  value={ruleDescription}
                  disabled={!isRuleSectionActive}
                  onChange={(event) => setRuleDescription(event.target.value)}
                  placeholder="Write a description"
                  rows={1}
                  className="h-11 w-full resize-none overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Expression
                </label>

                <input
                  type="text"
                  value={ruleExpression}
                  disabled={!isRuleSectionActive}
                  onChange={(event) => setRuleExpression(event.target.value)}
                  placeholder="Rule Expression"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>
            </div>

            {!isRuleSectionActive && (
              <p className="mt-5 text-[13px] font-semibold text-[#FF4D4F]">
                Please select a category first to fill in the other fields.
              </p>
            )}

            <button
              type="button"
              disabled={!canSaveRule || isSavingRule}
              onClick={handleSaveRule}
              className="mt-6 h-[46px] w-[140px] rounded-lg border-none bg-[#3A3A3A] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#B9BCC2]"
            >
              {isSavingRule ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 px-4"
          onClick={handleCancelDelete}
        >
          <div
            className="w-[520px] max-w-[94vw] rounded-xl bg-white p-8 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-4 text-[20px] font-semibold text-[#202224]">
              Delete Fraud Rule
            </h3>
            <p className="mx-auto mb-8 max-w-[360px] text-[14px] leading-6 text-[#7A7A7A]">
              Are you sure you want to delete this fraud rule? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeletingRule}
                className="h-[42px] w-[120px] rounded-lg border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#202224] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingRule}
                className="h-[42px] w-[120px] rounded-lg bg-[#EB5757] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingRule ? "Deleting..." : "Delete"}
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

function normalizeFraudRulesResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeFraudRuleRow);
  const totalRecords =
    findFirstNumber(payload, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeFraudRuleRow(row, index) {
  const category = row.category ?? row.ruleCategory ?? {};

  return {
    id: row.id ?? row.ruleId ?? index + 1,
    categoryId: row.categoryId ?? row.ruleCategoryId ?? category.id ?? "-",
    categoryName:
      row.categoryName ??
      row.ruleCategoryName ??
      category.categoryName ??
      category.name ??
      "-",
    ruleCode: row.ruleCode ?? row.code ?? "-",
    ruleName: row.ruleName ?? row.name ?? "-",
    ruleDescription: row.ruleDescription ?? row.description ?? "-",
    ruleExpression: row.ruleExpression ?? row.expression ?? "-",
    createdBy: row.createdBy ?? "-",
    ...splitDateTime(row.createdAt ?? row.createdDate),
    ...splitDateTime(row.updatedAt, "updated"),
    status: formatStatus(row.status),
  };
}

function normalizeCategoryOptions(responseData) {
  return findFirstArray(
    responseData?.responseData ??
      responseData?.data?.responseData ??
      responseData?.data ??
      responseData,
  )
    .map(normalizeCategoryOption)
    .filter((category) => category.id && category.name);
}

function normalizeCategoryOption(category, index) {
  if (typeof category === "string") {
    return {
      id: category,
      name: category,
    };
  }

  const id = category?.id ?? category?.categoryId ?? category?.ruleCategoryId ?? index + 1;

  return {
    id,
    name:
      category?.categoryName ||
      category?.name ||
      category?.ruleCategoryName ||
      category?.category ||
      category?.categoryTitle ||
      category?.ruleCategory ||
      String(id),
    status: category?.status,
  };
}

function isActiveStatus(status) {
  if (typeof status === "boolean") return status;
  if (status === null || status === undefined || status === "") return true;

  return ["active", "success", "true", "enabled"].includes(
    String(status).trim().toLowerCase(),
  );
}

function getCategoryDisplay(fraudRuleItem, categoryById) {
  if (fraudRuleItem.categoryName && fraudRuleItem.categoryName !== "-") {
    return fraudRuleItem.categoryName;
  }

  const matchedCategory = categoryById.get(String(fraudRuleItem.categoryId));
  if (matchedCategory?.name) return matchedCategory.name;

  return fraudRuleItem.categoryId;
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

  for (const key of ["content", "records", "items", "rows", "list", "fraudRules", "data"]) {
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
  return Boolean(row?.id || row?.ruleCode || row?.ruleName || row?.name);
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
