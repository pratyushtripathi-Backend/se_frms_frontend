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
  createRuleScore,
  deleteRuleScore,
  getFraudRules,
  getRuleScores,
  updateRuleScore,
  updateRuleScoreStatus,
} from "../services/fraudDetailsService";
import DashboardSuccessModal from "./DashboardSuccessModal";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const TABLE_COLUMNS = [
  "S.No",
  "Fraud Rule",
  "Rule Score",
  "Status",
  "Created By",
  "Created At",
  "Updated At",
  "Action",
];

export default function AllRuleScorePage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [ruleScores, setRuleScores] = useState([]);
  const [fraudRules, setFraudRules] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFraudRules, setIsLoadingFraudRules] = useState(false);
  const [isSavingRuleScore, setIsSavingRuleScore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [failureModalMessage, setFailureModalMessage] = useState("");
  const [showAddRuleScoreModal, setShowAddRuleScoreModal] = useState(false);
  const [editingRuleScore, setEditingRuleScore] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletingRuleScore, setIsDeletingRuleScore] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [ruleScore, setRuleScore] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 10;
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadRuleScores = useCallback(async ({ showLoader = true, searchValue = searchQuery } = {}) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage("");

    try {
      const requestedPage = isLocalFilterActive ? 0 : currentPage - 1;
      const response = await getRuleScores({
        page: requestedPage,
        search: searchValue,
        size: rowsPerPage,
      });
      const normalizedResponse = normalizeRuleScoreResponse(response.data);
      const normalizedRows = [...normalizedResponse.rows];

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            getRuleScores({
              page: index + 1,
              search: searchValue,
              size: rowsPerPage,
            }),
          ),
        );

        remainingResponses.forEach((pageResponse) => {
          normalizedRows.push(...normalizeRuleScoreResponse(pageResponse.data).rows);
        });
      }

      setRuleScores(normalizedRows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
    } catch (error) {
      setRuleScores([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load rule scores. Please try again."),
      );
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [currentPage, isLocalFilterActive, searchQuery]);

  const loadFraudRules = useCallback(async () => {
    setIsLoadingFraudRules(true);

    try {
      const response = await getFraudRules({ page: 0, size: 10 });
      setFraudRules(normalizeFraudRuleOptions(response.data));
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to fetch fraud rules. Please try again."),
      );
    } finally {
      setIsLoadingFraudRules(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialRuleScores() {
      if (!isActive) return;
      await Promise.all([
        loadRuleScores({ searchValue: searchQuery }),
        loadFraudRules(),
      ]);
    }

    loadInitialRuleScores();

    return () => {
      isActive = false;
    };
  }, [searchQuery, loadFraudRules, loadRuleScores]);

  const filteredData = useMemo(() => {
    return ruleScores.filter((item) => {
      const itemDate = parseDateValue(item.createdDate);
      const yearValue = itemDate ? String(itemDate.getFullYear()) : "";

      if (year && yearValue !== year) return false;

      if (fromDate && itemDate && itemDate < parseDateOnly(fromDate)) return false;

      if (toDate && itemDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    }).sort(sortByRecentCreated);
  }, [ruleScores, year, fromDate, toDate]);

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

  const fraudRuleById = useMemo(() => {
    return fraudRules.reduce((lookup, rule) => {
      lookup.set(String(rule.id), rule);
      return lookup;
    }, new Map());
  }, [fraudRules]);
  const activeFraudRules = useMemo(
    () => fraudRules.filter((rule) => isActiveStatus(rule.status)),
    [fraudRules],
  );

  const isScoreSectionActive = selectedRuleId !== "";
  const canSaveRuleScore = isScoreSectionActive && ruleScore.trim() !== "";

  const handleOpenAddRuleScore = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    setSelectedRuleId("");
    setRuleScore("");
    setEditingRuleScore(null);
    setShowAddRuleScoreModal(true);
    if (fraudRules.length === 0) await loadFraudRules();
  };

  const handleCloseAddRuleScore = () => {
    if (isSavingRuleScore) return;
    setShowAddRuleScoreModal(false);
    setEditingRuleScore(null);
  };

  const handleSaveRuleScore = async () => {
    if (!canSaveRuleScore) return;

    setIsSavingRuleScore(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFailureModalMessage("");

    try {
      const payload = {
        ruleId: Number(selectedRuleId),
        score: Number(ruleScore),
      };
      const response = editingRuleScore
        ? await updateRuleScore(editingRuleScore.id, {
            ...payload,
            status: editingRuleScore.status === "Failed" ? false : true,
          })
        : await createRuleScore(payload);

      setShowAddRuleScoreModal(false);
      setEditingRuleScore(null);
      const nextMessage =
        response.data?.responseMessage ||
        (editingRuleScore
          ? "Rule score updated successfully."
          : "Rule score created successfully.");
      setSuccessMessage(nextMessage);
      setSuccessModalMessage(nextMessage);
      await loadRuleScores({
        searchValue: searchQuery,
        showLoader: false,
      });
    } catch (error) {
      const nextErrorMessage = getAuthErrorMessage(
        error,
        editingRuleScore
          ? "Unable to update rule score. Please try again."
          : "Unable to create rule score. Please try again.",
      );
      setErrorMessage(nextErrorMessage);
      setFailureModalMessage(nextErrorMessage);
    } finally {
      setIsSavingRuleScore(false);
    }
  };

  const handleEditRuleScore = async (item) => {
    setOpenActionId(null);
    setSuccessMessage("");
    setErrorMessage("");
    setEditingRuleScore(item);
    setSelectedRuleId(item.fraudRuleId === "-" ? "" : String(item.fraudRuleId));
    setRuleScore(item.ruleScore === "-" ? "" : String(item.ruleScore));
    setShowAddRuleScoreModal(true);
    if (fraudRules.length === 0) await loadFraudRules();
  };

  const handleDeleteRuleScore = (item) => {
    setOpenActionId(null);
    setSuccessMessage("");
    setErrorMessage("");
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    if (isDeletingRuleScore) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeletingRuleScore(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await deleteRuleScore(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMessage(
        response.data?.responseMessage || "Rule score deleted successfully.",
      );
      await loadRuleScores({
        searchValue: searchQuery,
        showLoader: false,
      });
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to delete rule score. Please try again."),
      );
    } finally {
      setIsDeletingRuleScore(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            Rule score Overview
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
              onClick={handleOpenAddRuleScore}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#EB5757] bg-white px-4 text-[12px] font-semibold text-[#EB5757]"
            >
              Add Rule Score
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

            <table className="w-full min-w-[1300px] border-collapse">

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
                      Loading rule scores...
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
                      No rule scores found.
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
                      {getFraudRuleDisplay(item, fraudRuleById)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.ruleScore}
                    </td>

                    <td className="px-4 py-4">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) =>
                          updateRuleScoreStatus(item.id, nextStatus)
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
                        onClick={() => handleEditRuleScore(item)}
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
              Showing {visibleData.length} of {effectiveTotalRecords} transactions
            </p>

            <div className="flex items-center gap-2">

              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage <= 1 || isLoading}
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
                disabled={currentPage >= effectiveTotalPages || isLoading}
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

      {showAddRuleScoreModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 px-4"
          onClick={handleCloseAddRuleScore}
        >
          <div
            className="relative w-[960px] max-w-[96vw] rounded-xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseAddRuleScore}
              className="absolute right-6 top-6 text-[#202224]"
            >
              <X size={20} />
            </button>

            <div className="rounded-[10px] border border-[#E5E7EB] p-5">
              <div className="mb-[14px] text-[14px] font-bold text-[#202224]">
                {editingRuleScore
                  ? "Edit Fraud Rule Score"
                  : "Create Fraud Rule Score"}
              </div>

              <div className="mb-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
                    Fraud Rule
                  </label>
                  <select
                    value={selectedRuleId}
                    disabled={isLoadingFraudRules}
                    onChange={(event) => setSelectedRuleId(event.target.value)}
                    className="h-[72px] w-full rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3.5 text-[13px] text-[#111827] outline-none md:w-4/5"
                  >
                    <option value="">
                      {isLoadingFraudRules ? "Loading fraud rules..." : "Select Fraud Rule"}
                    </option>
                    {!isLoadingFraudRules && activeFraudRules.length === 0 && (
                      <option disabled value="">
                        No active fraud rules found
                      </option>
                    )}
                    {activeFraudRules.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
                    Fraud Rule Score
                  </label>
                  <input
                    type="number"
                    value={ruleScore}
                    disabled={!isScoreSectionActive}
                    onChange={(event) => setRuleScore(event.target.value)}
                    placeholder="Enter Rule Score"
                    className="h-[72px] w-full rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3.5 text-[13px] text-[#111827] outline-none disabled:opacity-60 md:w-4/5"
                  />
                </div>
              </div>

              {!isScoreSectionActive && (
                <div className="mb-4 text-[12px] font-medium text-[#DC2626]">
                  Please select a Fraud Rule first to enter a score.
                </div>
              )}

              <button
                type="button"
                disabled={!canSaveRuleScore || isSavingRuleScore}
                onClick={handleSaveRuleScore}
                className="h-[42px] rounded-lg bg-[#FF0D0D] px-7 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#B9BCC2]"
              >
                {isSavingRuleScore ? "Saving..." : "Save"}
              </button>
            </div>
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
              Delete Rule Score
            </h3>
            <p className="mx-auto mb-8 max-w-[360px] text-[14px] leading-6 text-[#7A7A7A]">
              Are you sure you want to delete this Rule Score data? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeletingRuleScore}
                className="h-[42px] w-[120px] rounded-lg border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#202224] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingRuleScore}
                className="h-[42px] w-[120px] rounded-lg bg-[#EB5757] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingRuleScore ? "Deleting..." : "Delete"}
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

function normalizeRuleScoreResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeRuleScoreRow);
  const totalRecords =
    findFirstNumber(payload, ["totalElements", "totalRecords", "totalCount", "total", "count"]) ??
    rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / 10), 1);

  return { rows, totalRecords, totalPages: Math.max(totalPages, 1) };
}

function normalizeRuleScoreRow(row, index) {
  const fraudRule = row.fraudRule ?? row.rule ?? {};

  return {
    id: row.id ?? row.ruleScoreId ?? index + 1,
    fraudRuleId: row.fraudRuleId ?? row.ruleId ?? fraudRule.id ?? "-",
    ruleName:
      row.ruleName ??
      row.fraudRuleName ??
      fraudRule.ruleName ??
      fraudRule.name ??
      "-",
    ruleScore: row.ruleScore ?? row.score ?? "-",
    ...splitDateTime(row.createdAt ?? row.createdDate),
    createdBy: row.createdBy ?? "-",
    ...splitDateTime(row.updatedAt, "updated"),
    status: formatStatus(row.status),
  };
}

function normalizeFraudRuleOptions(responseData) {
  return findFirstArray(
    responseData?.responseData ??
      responseData?.data?.responseData ??
      responseData?.data ??
      responseData,
  )
    .map(normalizeFraudRuleOption)
    .filter((rule) => rule.id);
}

function normalizeFraudRuleOption(rule, index) {
  if (typeof rule === "string" || typeof rule === "number") {
    return {
      id: rule,
      label: String(rule),
    };
  }

  const id = rule?.id ?? rule?.ruleId ?? rule?.fraudRuleId ?? index + 1;
  const name = rule?.ruleName ?? rule?.name ?? rule?.ruleCode ?? "";

  return {
    id,
    name,
    label: name ? `${id} - ${name}` : String(id),
    status: rule?.status,
  };
}

function isActiveStatus(status) {
  if (typeof status === "boolean") return status;
  if (status === null || status === undefined || status === "") return true;

  return ["active", "success", "true", "enabled"].includes(
    String(status).trim().toLowerCase(),
  );
}

function getFraudRuleDisplay(ruleScoreItem, fraudRuleById) {
  if (ruleScoreItem.ruleName && ruleScoreItem.ruleName !== "-") {
    return ruleScoreItem.ruleName;
  }

  const matchedRule = fraudRuleById.get(String(ruleScoreItem.fraudRuleId));
  if (matchedRule?.name) return matchedRule.name;

  return ruleScoreItem.fraudRuleId;
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

  for (const key of ["content", "records", "items", "rows", "list", "ruleScores", "scores", "data"]) {
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
  return Boolean(row?.id || row?.ruleScore || row?.score || row?.ruleId || row?.fraudRuleId);
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
