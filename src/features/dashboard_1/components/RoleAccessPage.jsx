import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  X,
  ChevronDown,
  Check,
  RotateCcw,
} from "lucide-react";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createRoleAccess,
  getAccessList,
  getAdminRoles,
  getRoleAccessByRole,
  updateRoleAccess,
  updateRoleAccessStatus,
} from "../services/adminEmployeeService";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const ROLE_ACCESS_COLUMN_ORDER = [
  "id",
  "access",
  "createdBy",
  "createdDate",
  "status",
  "action",
];

function AddAccessModal({
  accessOptions,
  isLoadingAccesses,
  isLoadingRoles,
  isSaving,
  mode = "add",
  onClose,
  onSave,
  roleOptions,
  selectedRoleAccess,
}) {
  const [role, setRole] = useState(selectedRoleAccess?.roleId ?? "");
  const [accessIds, setAccessIds] = useState(selectedRoleAccess?.accessIds ?? []);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const selectedAccessLabels = accessOptions
    .filter((opt) => accessIds.includes(String(opt.value)))
    .map((opt) => opt.label);

  const toggleAccess = (accessId) => {
    setAccessIds((currentAccessIds) => {
      const normalizedAccessId = String(accessId);

      if (currentAccessIds.includes(normalizedAccessId)) {
        return currentAccessIds.filter((item) => item !== normalizedAccessId);
      }

      return [...currentAccessIds, normalizedAccessId];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 px-4 backdrop-blur-[1px]">
      <div className="relative w-[90%] max-w-[850px] rounded-[24px] bg-white p-10 shadow-2xl sm:p-14">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-8 top-8 text-[#202224] transition-colors hover:text-[#FF0D0D]"
        >
          <X size={22} />
        </button>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">

          {/* Role */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202224]">
              Role
            </label>

            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={mode === "edit"}
                className="h-[52px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:bg-[#F8F9FB]"
              >
                <option value="" disabled>
                  {isLoadingRoles ? "Loading roles..." : "Select Role"}
                </option>
                {roleOptions.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>
          </div>

          {/* Access */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202224]">
              Access
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccessOpen((isOpen) => !isOpen)}
                className="flex h-[52px] w-full items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-left text-[14px] text-[#202224] outline-none"
              >
                <span className={selectedAccessLabels.length ? "" : "text-[#8A8A8A]"}>
                  {isLoadingAccesses
                    ? "Loading access..."
                    : selectedAccessLabels.length
                      ? selectedAccessLabels.join(", ")
                      : "Select Access"}
                </span>
              </button>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
              />

              {isAccessOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-[260px] w-full overflow-y-auto rounded-[10px] border border-[#E5E7EB] bg-white py-2 shadow-lg">
                  {accessOptions.length === 0 ? (
                    <div className="px-4 py-3 text-[13px] text-[#8A8A8A]">
                      {isLoadingAccesses ? "Loading access..." : "No access found"}
                    </div>
                  ) : (
                    accessOptions.map((opt) => {
                      const isSelected = accessIds.includes(String(opt.value));

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleAccess(opt.value)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] text-[#202224] hover:bg-[#F8F9FB]"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              isSelected
                                ? "border-[#FF0D0D] bg-[#FF0D0D] text-white"
                                : "border-[#D1D5DB] bg-white text-transparent"
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={() => onSave({ roleId: role, accessIds })}
          disabled={isSaving}
          className="mt-10 h-[46px] rounded-[10px] bg-[#4B5563] px-8 text-[14px] font-semibold text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : mode === "edit" ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ message, onClose }) {
  const displayMessage = String(
    message || "Role access saved successfully.",
  ).toUpperCase();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-[90%] max-w-[560px] rounded-[24px] bg-white px-10 py-14 text-center shadow-2xl">

        {/* Animated checkmark */}
        <div className="mx-auto mb-6 flex h-[110px] w-[110px] items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#111827"
              strokeWidth="6"
              pathLength="100"
              strokeLinecap="round"
              style={{
                strokeDasharray: 100,
                animation: "roleaccess-draw 0.7s ease forwards",
              }}
            />
            <path
              d="M30 52 L45 66 L72 34"
              fill="none"
              stroke="#EB5757"
              strokeWidth="6"
              pathLength="100"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                animation: "roleaccess-draw 0.5s ease forwards 0.6s",
              }}
            />
          </svg>
        </div>

        <h3 className="mx-auto max-w-[360px] text-[18px] font-bold uppercase leading-7 text-[#202224]">
          {displayMessage}
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 h-[46px] rounded-[10px] bg-[#4B5563] px-8 text-[14px] font-semibold text-white transition-colors hover:bg-[#374151]"
        >
          Back to Page
        </button>
      </div>

      <style>{`
        @keyframes roleaccess-draw {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <img
        src="/icon.png"
        alt="Search documents"
        className="mb-8 h-[170px] w-[170px] origin-top object-contain"
        style={{ animation: "doc-dangle 2.6s ease-in-out infinite" }}
      />

      <h3 className="text-[18px] font-semibold text-[#202224]">
        Search to View Access Details
      </h3>

      <p className="mt-3 max-w-[480px] text-[13px] italic leading-6 text-[#9A9A9A]">
        "Use the search bar above to find a user or role. Assigned permissions
        and access details will appear here after a successful search."
      </p>

      <style>{`
        @keyframes doc-dangle {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}

export default function RoleAccessPage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [roleAccessRows, setRoleAccessRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [selectedRoleAccess, setSelectedRoleAccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccesses, setIsLoadingAccesses] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSavingRoleAccess, setIsSavingRoleAccess] = useState(false);
  const [accessOptions, setAccessOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rowsPerPage = 10;
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

  const loadRoleAccessList = useCallback(async () => {
    const trimmedSearchValue = debouncedSearchValue.trim();

    if (!trimmedSearchValue) {
      setRoleAccessRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const roleId = resolveRoleId(trimmedSearchValue, roleOptions);

      if (!roleId) {
        setRoleAccessRows([]);
        setTotalRecords(0);
        setTotalPages(1);
        setErrorMessage("Please search with a valid role id or role name.");
        return;
      }

      const response = await getRoleAccessByRole(roleId);
      const normalizedResponse = normalizeRoleAccessResponse(
        response.data,
        rowsPerPage,
        roleId,
      );

      setRoleAccessRows(normalizedResponse.rows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
    } catch (error) {
      setRoleAccessRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to load role access details. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchValue, roleOptions]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setCurrentPage(1);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    if (!hasSearched) return undefined;

    const timeoutId = window.setTimeout(() => {
      loadRoleAccessList();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hasSearched, loadRoleAccessList]);

  useEffect(() => {
    let isActive = true;

    async function loadRoles() {
      setIsLoadingRoles(true);

      try {
        const response = await getAdminRoles({
          page: 0,
          size: 100,
        });
        const normalizedOptions = normalizeRoleOptions(response.data);

        if (isActive) setRoleOptions(normalizedOptions);
      } catch (error) {
        if (isActive) {
          setRoleOptions([]);
          setErrorMessage(
            getAuthErrorMessage(
              error,
              "Unable to load roles. Please try again.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoadingRoles(false);
      }
    }

    loadRoles();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAccesses() {
      setIsLoadingAccesses(true);

      try {
        const response = await getAccessList({
          page: 1,
          size: 10,
        });
        const normalizedOptions = normalizeAccessOptions(response.data);

        if (isActive) setAccessOptions(normalizedOptions);
      } catch (error) {
        if (isActive) {
          setAccessOptions([]);
          setErrorMessage(
            getAuthErrorMessage(
              error,
              "Unable to load access list. Please try again.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoadingAccesses(false);
      }
    }

    loadAccesses();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!hasSearched) return [];

    return roleAccessRows.filter((item) => {
      const itemDate = parseRoleAccessDate(item.createdDate);
      const itemYear = itemDate ? String(itemDate.getFullYear()) : "";

      if (year && itemYear !== year) return false;

      if (fromDate && itemDate < parseDateOnly(fromDate)) return false;

      if (toDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    });
  }, [roleAccessRows, fromDate, toDate, hasSearched, year]);
  const effectiveTotalRecords = isLocalFilterActive ? filteredData.length : totalRecords;
  const effectiveTotalPages = isLocalFilterActive
    ? Math.max(Math.ceil(effectiveTotalRecords / rowsPerPage), 1)
    : totalPages;
  const visibleData = isLocalFilterActive
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;

  const matchedRole = filteredData[0]?.role || searchValue;

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

  const handleSearch = () => {
    const trimmedSearchInput = searchInput.trim();

    if (!trimmedSearchInput) {
      setSearchValue("");
      setDebouncedSearchValue("");
      setRoleAccessRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setCurrentPage(1);
      setHasSearched(false);
      setErrorMessage("");
      return;
    }

    setSearchValue(trimmedSearchInput);
    setDebouncedSearchValue(trimmedSearchInput);
    setCurrentPage(1);
    setHasSearched(true);
  };

  const refreshRoleAccessRows = async (roleId) => {
    const refreshedResponse = await getRoleAccessByRole(roleId);
    const normalizedResponse = normalizeRoleAccessResponse(
      refreshedResponse.data,
      rowsPerPage,
      roleId,
    );

    setRoleAccessRows(normalizedResponse.rows);
    setTotalRecords(normalizedResponse.totalRecords);
    setTotalPages(normalizedResponse.totalPages);
    setSearchInput(String(roleId));
    setSearchValue(String(roleId));
    setDebouncedSearchValue(String(roleId));
    setCurrentPage(1);
    setHasSearched(true);
  };

  const handleSave = async ({ roleId, accessIds }) => {
    const normalizedRoleId = Number(roleId);
    const normalizedAccessIds = accessIds
      .map((accessId) => Number(accessId))
      .filter((accessId) => Number.isFinite(accessId));

    if (!Number.isFinite(normalizedRoleId)) {
      setErrorMessage("Please select a role.");
      return;
    }

    if (normalizedAccessIds.length === 0) {
      setErrorMessage("Please select at least one access.");
      return;
    }

    setIsSavingRoleAccess(true);
    setErrorMessage("");

    try {
      let response;

      if (selectedRoleAccess) {
        response = await updateRoleAccess(normalizedRoleId, {
          accessIds: normalizedAccessIds,
        });
      } else {
        response = await createRoleAccess({
          roleId: normalizedRoleId,
          accessIds: normalizedAccessIds,
        });
      }

      await refreshRoleAccessRows(normalizedRoleId);
      setSelectedRoleAccess(null);
      setShowFormModal(false);
      setSuccessMessage(
        response?.data?.responseMessage || "Role access saved successfully.",
      );
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to save role access. Please try again.",
        ),
      );
    } finally {
      setIsSavingRoleAccess(false);
    }
  };

  const handleEditRoleAccess = (item) => {
    const roleId = getRoleAccessRoleId(item);
    const accessId = getRoleAccessAccessId(item);

    if (!roleId) {
      setErrorMessage("Unable to edit this row because role id is missing.");
      setOpenActionId(null);
      return;
    }

    setSelectedRoleAccess({
      roleId: String(roleId),
      accessIds: accessId ? [String(accessId)] : [],
    });
    setShowFormModal(true);
    setOpenActionId(null);
  };

  const handleDeleteRoleAccess = async (item) => {
    const roleId = getRoleAccessRoleId(item);
    const accessId = getRoleAccessAccessId(item);
    const roleAccessId = getRoleAccessId(item);

    if (!roleId || !accessId || !roleAccessId) {
      setErrorMessage("Unable to delete this row because role access id, role id, or access id is missing.");
      setOpenActionId(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await updateRoleAccessStatus(roleAccessId, false);
      await refreshRoleAccessRows(roleId);
      setOpenActionId(null);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to delete role access. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRoleAccessStatus = async (item, nextStatus) => {
    const roleAccessId = getRoleAccessId(item);
    const roleId =
      getRoleAccessRoleId(item) ||
      resolveRoleId(debouncedSearchValue || searchValue || searchInput, roleOptions);

    if (!roleAccessId) {
      setErrorMessage("Unable to update status because role access id is missing.");
      return;
    }

    if (!roleId) {
      setErrorMessage("Unable to update status because role id is missing.");
      return;
    }

    setErrorMessage("");

    await updateRoleAccessStatus(roleAccessId, nextStatus);

    setRoleAccessRows((currentRows) =>
      currentRows.map((row) =>
        String(getRoleAccessId(row)) === String(roleAccessId)
          ? { ...row, status: nextStatus }
          : row,
      ),
    );

  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A6A6A6]"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search"
              className="h-[46px] w-full rounded-lg border border-[#E5E7EB] bg-white pl-11 pr-4 text-[14px] text-[#202224] outline-none placeholder:text-[#A6A6A6]"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="h-[46px] rounded-lg bg-[#EB4A4A] px-8 text-[14px] font-semibold text-white transition-colors hover:bg-[#D93A3A]"
          >
            Search
          </button>

            {/* Add Role Access */}
            <button
              type="button"
              onClick={() => {
                setSelectedRoleAccess(null);
                setShowFormModal(true);
              }}
              className="flex h-[46px] items-center gap-2 whitespace-nowrap rounded-lg border border-[#FF0D0D] bg-white px-4 text-[13px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1]"
            >
              <span>Add Role Access</span>
              <Plus size={16} strokeWidth={2.5} />
            </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-[#FEF3F2] px-4 py-3 text-[13px] font-semibold text-[#D92D20]">
            {errorMessage}
          </div>
        )}

        {!hasSearched ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-6 flex min-h-[92px] items-center rounded-lg border-l-4 border-[#FF0D0D] bg-white px-6 py-7 shadow-sm">
              <div className="w-[300px]">
                <p className="text-[14px] font-semibold text-[#202224]">Role</p>
                <p className="mt-1 text-[15px] text-[#4B5563]">
                  {matchedRole || "-"}
                </p>
              </div>

              <div>
                <p className="text-[14px] font-semibold text-[#202224]">
                  Total Access
                </p>
                <p className="mt-1 text-[15px] text-[#4B5563]">
                  {filteredData.length}
                </p>
              </div>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-[16px] font-semibold text-[#202224]">
                  All Access Details
                </h2>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      className="h-10 w-[105px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] text-[#202224] outline-none"
                      onChange={(event) => handleYearChange(event.target.value)}
                      value={year}
                    >
                      <option value="">Year</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>

                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
                      size={15}
                    />
                  </div>

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
                </div>
              </div>

          <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[1000px] border-collapse">

                  <thead className="bg-[#F8F9FB]">
                    <tr>
                      {[
                        "Sr No",
                        "Access",
                        "Status",
                        "Created By",
                        "Created At",
                        "Updated At",
                        "Action",
                      ].map((column) => (
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
                    <td colSpan={7} className="px-4 py-6 text-center">
                      Loading role access details...
                    </td>
                  </tr>
                )}

                {!isLoading && filteredData.length === 0 && (
                  <tr className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563]">
                    <td colSpan={7} className="px-4 py-6 text-center">
                      No role access details found.
                    </td>
                  </tr>
                )}

                {!isLoading && visibleData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="relative border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatRoleAccessValue(item.access)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) =>
                          handleToggleRoleAccessStatus(item, nextStatus)
                        }
                        status={item.status}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatRoleAccessValue(item.createdBy)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex flex-col text-[12px] leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {formatRoleAccessValue(item.createdDate)}
                        </span>
                        <span className="text-[#27AE60]">
                          {formatRoleAccessValue(item.createdTime)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex flex-col text-[12px] leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {formatRoleAccessValue(item.updatedDate)}
                        </span>
                        <span className="text-[#27AE60]">
                          {formatRoleAccessValue(item.updatedTime)}
                        </span>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap px-4 py-4">
                      <DashboardEditButton
                        onClick={() => handleEditRoleAccess(item)}
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
          </>
        )}
      </div>
      {/* Modals */}
      {showFormModal && (
        <AddAccessModal
          accessOptions={accessOptions}
          isLoadingAccesses={isLoadingAccesses}
          isLoadingRoles={isLoadingRoles}
          isSaving={isSavingRoleAccess}
          mode={selectedRoleAccess ? "edit" : "add"}
          onClose={() => setShowFormModal(false)}
          onSave={handleSave}
          roleOptions={roleOptions}
          selectedRoleAccess={selectedRoleAccess}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage("");
          }}
        />
      )}

    </div>
  );
}

function normalizeRoleAccessResponse(responseData, pageSize, fallbackRoleId = "") {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = extractRoleAccessRows(payload, fallbackRoleId);
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

function extractRoleAccessRows(payload, fallbackRoleId = "") {
  if (!payload) return [];

  const roleSpecificRows = extractRoleSpecificRows(payload, fallbackRoleId);

  if (roleSpecificRows.length > 0) return roleSpecificRows;
  if (isRolePayloadWithoutAccess(payload)) return [];

  return findFirstArray(payload)
    .map((item, index) => normalizeRoleAccessRow(item, index, fallbackRoleId))
    .filter(Boolean);
}

function extractRoleSpecificRows(payload, fallbackRoleId = "") {
  if (Array.isArray(payload)) {
    return payload
      .map((item, index) => normalizeRoleAccessRow(item, index, fallbackRoleId))
      .filter(Boolean);
  }

  if (!payload || typeof payload !== "object") return [];

  const accessCollection =
    payload.accessList ??
    payload.accesses ??
    payload.access ??
    payload.accessNames ??
    payload.accessName ??
    payload.accessDetails ??
    payload.permissions ??
    payload.permissionList ??
    payload.permissionNames ??
    payload.roleAccessList ??
    payload.roleAccesses;

  if (Array.isArray(accessCollection)) {
    return accessCollection
      .map((accessItem, index) =>
        normalizeRoleAccessRow(
          {
            ...payload,
            ...(typeof accessItem === "object" && accessItem !== null
              ? accessItem
              : { access: accessItem }),
            id:
              accessItem?.id ??
              accessItem?.roleAccessId ??
              accessItem?.accessId ??
              payload.id ??
              index + 1,
            accessId:
              accessItem?.accessId ??
              accessItem?.access_id ??
              accessItem?.accessMasterId ??
              accessItem?.accessNameId ??
              accessItem?.permission_id ??
              accessItem?.id ??
              accessItem?.access?.id ??
              accessItem?.access?.accessId ??
              accessItem?.permissionId,
            roleId:
              accessItem?.roleId ??
              accessItem?.role_id ??
              accessItem?.role?.id ??
              accessItem?.role?.roleId ??
              payload.roleId ??
              payload.role_id ??
              payload.role?.id ??
              payload.role?.roleId ??
              fallbackRoleId,
            createdAt:
              accessItem?.createdAt ??
              accessItem?.createdDate ??
              accessItem?.createdOn ??
              payload.createdAt ??
              payload.createdDate ??
              payload.createdOn,
            updatedAt:
              accessItem?.updatedAt ??
              accessItem?.updatedDate ??
              accessItem?.updatedOn ??
              accessItem?.modifiedAt ??
              accessItem?.lastUpdatedAt ??
              payload.updatedAt ??
              payload.updatedDate ??
              payload.updatedOn ??
              payload.modifiedAt ??
              payload.lastUpdatedAt,
            access:
              accessItem?.accessName ??
              accessItem?.access ??
              accessItem?.name ??
              accessItem?.permissionName ??
              accessItem,
          },
          index,
        ),
      )
      .filter(Boolean);
  }

  if (
    accessCollection &&
    typeof accessCollection === "object" &&
    accessCollection !== payload
  ) {
    return [
      normalizeRoleAccessRow(
        {
          ...payload,
          ...accessCollection,
          id:
            accessCollection.id ??
            accessCollection.roleAccessId ??
            accessCollection.accessId ??
            payload.id ??
            1,
          accessId:
            accessCollection.accessId ??
            accessCollection.access_id ??
            accessCollection.accessMasterId ??
            accessCollection.accessNameId ??
            accessCollection.permission_id ??
            accessCollection.id ??
            accessCollection.access?.id ??
            accessCollection.access?.accessId ??
            accessCollection.permissionId,
          roleId:
            accessCollection.roleId ??
            accessCollection.role_id ??
            accessCollection.role?.id ??
            accessCollection.role?.roleId ??
            payload.roleId ??
            payload.role_id ??
            payload.role?.id ??
            payload.role?.roleId ??
            fallbackRoleId,
          createdAt:
            accessCollection.createdAt ??
            accessCollection.createdDate ??
            accessCollection.createdOn ??
            payload.createdAt ??
            payload.createdDate ??
            payload.createdOn,
          updatedAt:
            accessCollection.updatedAt ??
            accessCollection.updatedDate ??
            accessCollection.updatedOn ??
            accessCollection.modifiedAt ??
            accessCollection.lastUpdatedAt ??
            payload.updatedAt ??
            payload.updatedDate ??
            payload.updatedOn ??
            payload.modifiedAt ??
            payload.lastUpdatedAt,
          access:
            accessCollection.accessName ??
            accessCollection.access ??
            accessCollection.name ??
            accessCollection.permissionName ??
            accessCollection,
        },
        0,
      ),
    ].filter(Boolean);
  }

  return [];
}

function normalizeRoleOptions(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  return findFirstArray(payload)
    .map((role, index) => {
      if (typeof role === "string") {
        return {
          id: role,
          label: role,
          value: role,
        };
      }

      if (!role || typeof role !== "object") return null;

      const label =
        role.roleName ??
        role.name ??
        role.role ??
        role.title ??
        role.slug ??
        "-";

      return {
        id: role.id ?? role.roleId ?? `${label}-${index}`,
        label,
        value: role.id ?? role.roleId ?? label,
      };
    })
    .filter(Boolean);
}

function normalizeAccessOptions(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  return findFirstArray(payload)
    .map((access, index) => {
      if (typeof access === "string") {
        return {
          id: access,
          label: access,
          value: access,
        };
      }

      if (!access || typeof access !== "object") return null;

      const label =
        access.accessName ??
        access.access ??
        access.name ??
        access.permissionName ??
        "-";

      return {
        id: access.id ?? access.accessId ?? `${label}-${index}`,
        label,
        value: access.id ?? access.accessId ?? label,
      };
    })
    .filter(Boolean);
}

function normalizeRoleAccessRow(item, index, fallbackRoleId = "") {
  if (!item || typeof item !== "object") return null;

  const createdAt = getRoleAccessDateTimeValue(item, "created");
  const updatedAt = getRoleAccessDateTimeValue(item, "updated");
  const roleId =
    item.roleId ??
    item.role_id ??
    item.role?.id ??
    item.role?.roleId ??
    fallbackRoleId ??
    "";
  const accessId =
    item.accessId ??
    item.access_id ??
    item.accessMasterId ??
    item.accessNameId ??
    item.permission_id ??
    item.access?.id ??
    item.access?.accessId ??
    item.access?.accessMasterId ??
    item.access?.accessNameId ??
    item.permissionId ??
    "";
  const role =
    item.roleName ??
    item.role ??
    item.roleAccessName ??
    item.role?.roleName ??
    item.role?.name ??
    "-";
  const access =
    item.accessName ??
    item.access ??
    item.permissionName ??
    item.access?.accessName ??
    item.access?.name ??
    "-";

  return {
    ...item,
    id: item.id ?? item.roleAccessId ?? index + 1,
    roleId,
    accessId,
    role,
    access,
    createdBy: item.createdBy ?? item.createdByName ?? "-",
    createdDate: formatDatePart(createdAt),
    createdTime: formatTimePart(createdAt),
    updatedDate: formatDatePart(updatedAt),
    updatedTime: formatTimePart(updatedAt),
    status: formatStatus(item.status),
  };
}

function getRoleAccessDateTimeValue(item, prefix) {
  const candidateKeys =
    prefix === "updated"
      ? [
          "updatedAt",
          "updatedDate",
          "updatedOn",
          "modifiedAt",
          "modifiedDate",
          "lastUpdatedAt",
          "lastModifiedAt",
        ]
      : ["createdAt", "createdDate", "createdOn"];

  const directValue = getFirstRoleAccessValue(item, candidateKeys);

  if (directValue) return directValue;

  return getFirstRoleAccessValue(
    item.access,
    candidateKeys,
  );
}

function getFirstRoleAccessValue(source, keys) {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    if (
      source[key] !== null &&
      source[key] !== undefined &&
      source[key] !== ""
    ) {
      return source[key];
    }
  }

  const normalizedKeys = new Set(
    keys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")),
  );
  const matchedEntry = Object.entries(source).find(([key, value]) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

    return (
      normalizedKeys.has(normalizedKey) &&
      value !== null &&
      value !== undefined &&
      value !== ""
    );
  });

  return matchedEntry?.[1];
}

function isRolePayloadWithoutAccess(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const hasRoleIdentity = Boolean(
    payload.roleId ||
      payload.role_id ||
      payload.roleName ||
      payload.role ||
      payload.roleAccessName,
  );
  const accessKeys = [
    "accessList",
    "accesses",
    "access",
    "accessNames",
    "accessName",
    "accessDetails",
    "permissions",
    "permissionList",
    "permissionNames",
    "roleAccessList",
    "roleAccesses",
  ];
  const hasAccessKey = accessKeys.some((key) => payload[key] !== undefined);

  return hasRoleIdentity && !hasAccessKey;
}

function getRoleAccessRoleId(item) {
  return (
    item?.roleId ??
    item?.role_id ??
    item?.roleMasterId ??
    item?.role?.id ??
    item?.role?.roleId ??
    item?.role?.role_id ??
    ""
  );
}

function getRoleAccessId(item) {
  return item?.id ?? item?.roleAccessId ?? item?.role_access_id ?? "";
}

function getRoleAccessAccessId(item) {
  return (
    item?.accessId ??
    item?.access_id ??
    item?.accessMasterId ??
    item?.accessNameId ??
    item?.permission_id ??
    item?.access?.id ??
    item?.access?.accessId ??
    item?.access?.accessMasterId ??
    item?.access?.accessNameId ??
    item?.permissionId ??
    ""
  );
}

function resolveAccessIdFromOptions(item, accessOptions) {
  const accessLabel = String(
    item?.accessName ??
      item?.access ??
      item?.permissionName ??
      item?.access?.accessName ??
      item?.access?.name ??
      "",
  )
    .trim()
    .toLowerCase();

  if (!accessLabel) return "";

  const matchedAccess = accessOptions.find((option) => {
    const optionValues = [option.id, option.value, option.label].map((value) =>
      String(value ?? "").trim().toLowerCase(),
    );

    return optionValues.includes(accessLabel);
  });

  return matchedAccess?.value ?? matchedAccess?.id ?? "";
}

function resolveRoleId(value, roleOptions) {
  const trimmedValue = String(value ?? "").trim();

  if (!trimmedValue) return "";

  const matchedRole = roleOptions.find((role) => {
    const roleValues = [role.id, role.value, role.label].map((item) =>
      String(item ?? "").trim(),
    );

    return roleValues.some(
      (roleValue) => roleValue.toLowerCase() === trimmedValue.toLowerCase(),
    );
  });

  if (matchedRole?.id !== undefined && matchedRole?.id !== null) {
    return matchedRole.id;
  }

  return /^\d+$/.test(trimmedValue) ? trimmedValue : "";
}

function formatRoleAccessValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Active" : "Inactive";

  if (Array.isArray(value)) {
    return value.length ? value.map(formatRoleAccessValue).join(", ") : "-";
  }

  if (typeof value === "object") {
    const values = Object.values(value)
      .map(formatRoleAccessValue)
      .filter((item) => item !== "-");

    return values.length ? values.join(", ") : "-";
  }

  return String(value);
}

function formatStatus(status) {
  if (status === null || status === undefined || status === "") return "-";
  if (typeof status === "boolean") return status ? "Active" : "Inactive";

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

function parseRoleAccessDate(value) {
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
    "roleAccessList",
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

  return hasRoleAccessIdentity(value) ? [value] : [];
}

function hasRoleAccessIdentity(item) {
  return Boolean(
    item?.id ||
      item?.roleAccessId ||
      item?.roleName ||
      item?.role ||
      item?.accessName ||
      item?.access,
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
