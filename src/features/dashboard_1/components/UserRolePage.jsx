import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { CalendarDays, RotateCcw } from "lucide-react";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  getAdminRoles,
  getAdminUserRoles,
  updateAdminUserRoleStatus,
} from "../services/adminEmployeeService";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const rowsPerPage = 10;

export default function UserRolePage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userRoles, setUserRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openActionId, setOpenActionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserRole, setEditingUserRole] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const isLocalFilterActive = Boolean(searchQuery.trim() || year || fromDate || toDate);
  const [formData, setFormData] = useState({
    roleName: "",
    userId: "",
    userName: "",
  });

  const loadRoleOptions = useCallback(async () => {
    setIsLoadingRoles(true);

    try {
      const response = await getAdminRoles({ page: 0, size: 100 });
      setRoleOptions(normalizeRoleOptions(response.data));
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load roles. Please try again."),
      );
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  const loadUserRoles = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAdminUserRoles({
        page: isLocalFilterActive ? 0 : currentPage - 1,
        size: rowsPerPage,
      });
      const normalizedResponse = normalizeUserRoleResponse(response.data);
      const normalizedRows = [...normalizedResponse.rows];

      if (isLocalFilterActive && normalizedResponse.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: normalizedResponse.totalPages - 1 }, (_, index) =>
            getAdminUserRoles({
              page: index + 1,
              size: rowsPerPage,
            }),
          ),
        );

        remainingResponses.forEach((pageResponse) => {
          normalizedRows.push(...normalizeUserRoleResponse(pageResponse.data).rows);
        });
      }

      setUserRoles(normalizedRows);
      setTotalRecords(normalizedResponse.totalRecords);
    } catch (error) {
      setUserRoles([]);
      setTotalRecords(0);
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to load user roles. Please try again.",
        ),
      );
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [currentPage, isLocalFilterActive]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialUserRoles() {
      if (!isActive) return;
      await Promise.all([loadUserRoles(), loadRoleOptions()]);
    }

    loadInitialUserRoles();

    return () => {
      isActive = false;
    };
  }, [currentPage, loadRoleOptions, loadUserRoles]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return userRoles.filter((item) => {
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesCreatedDate = isDateWithinRange(
        item.createdDate,
        fromDate,
        toDate,
        year,
      );

      return matchesSearch && matchesCreatedDate;
    });
  }, [fromDate, searchQuery, toDate, userRoles, year]);

  const effectiveTotalRecords = isLocalFilterActive ? filteredData.length : totalRecords;
  const totalPages = Math.max(1, Math.ceil(effectiveTotalRecords / rowsPerPage));
  const currentData = isLocalFilterActive
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;
  const visiblePageNumbers = useMemo(() => {
    const pageCount = Math.max(totalPages, 1);
    const startPage = Math.max(Math.min(currentPage - 2, pageCount - 4), 1);
    const endPage = Math.min(startPage + 4, pageCount);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [currentPage, totalPages]);
  const showingFrom = effectiveTotalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, effectiveTotalRecords);

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

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserRole(null);
  };

  const handleOpenAddModal = () => {
    setEditingUserRole(null);
    setFormData({
      roleName: "",
      userId: "",
      userName: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingUserRole) {
      setIsModalOpen(false);
      setSuccessMessage("User Role Assign Successfully");
      setFormData({
        roleName: "",
        userId: "",
        userName: "",
      });
      setShowSuccessModal(true);
      return;
    }

    setUpdatingRoleId(editingUserRole.id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const selectedRole = roleOptions.find(
        (role) => role.name === formData.roleName || String(role.id) === formData.roleName,
      );
      const response = await updateAdminUserRoleStatus(editingUserRole.id, {
        roleId: selectedRole?.id,
        roleName: selectedRole?.name ?? formData.roleName,
        status: isSuccessStatus(editingUserRole.status),
      });

      setIsModalOpen(false);
      setEditingUserRole(null);
      setSuccessMessage(
        response.data?.responseMessage || "User role updated successfully.",
      );
      setShowSuccessModal(true);
      await loadUserRoles({ showLoader: false });
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to update user role. Please try again."),
      );
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleEditStatus = (item) => {
    setOpenActionId(null);
    setEditingUserRole(item);
    setFormData({
      roleName: item.role,
      userId: item.userId === "-" ? "" : String(item.userId),
      userName: item.userName === "-" ? "" : item.userName,
    });
    setIsModalOpen(true);
  };

  const handleSoftDelete = async (item) => {
    setOpenActionId(null);
    setUpdatingRoleId(item.id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await updateAdminUserRoleStatus(item.id, {
        status: false,
      });

      setSuccessMessage(
        response.data?.responseMessage || "User role deleted successfully.",
      );
      await loadUserRoles({ showLoader: false });
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to delete user role. Please try again."),
      );
    } finally {
      setUpdatingRoleId(null);
    }
  };

  return (
    <div className="min-h-full bg-[#F6F8FC] px-6 py-6 font-['Inter',sans-serif]">
      <div className="overflow-hidden rounded-xl border border-[#E7E7E7] bg-white pb-4 shadow-sm">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-[15px] font-semibold text-[#333333]">
            All User Role Details
          </h2>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select
                className="h-[38px] w-[110px] appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-8 text-[13px] text-[#202224] outline-none"
                onChange={(event) => handleYearChange(event.target.value)}
                value={year}
              >
                <option value="">Year</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]" size={15} />
            </div>

            <input
              className="hidden"
              onChange={(event) => handleFromDateChange(event.target.value)}
              ref={fromInputRef}
              type="date"
              value={fromDate}
            />

            <button
              className="flex h-[38px] w-[110px] items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#808080] outline-none"
              onClick={(event) => openDashboardDatePicker(fromInputRef.current, event.currentTarget)}
              type="button"
            >
              <span>{fromDate || "From"}</span>
              <CalendarDays size={15} />
            </button>

            <input
              className="hidden"
              onChange={(event) => handleToDateChange(event.target.value)}
              ref={toInputRef}
              type="date"
              value={toDate}
            />

            <button
              className="flex h-[38px] w-[110px] items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#808080] outline-none"
              onClick={(event) => openDashboardDatePicker(toInputRef.current, event.currentTarget)}
              type="button"
            >
              <span>{toDate || "To"}</span>
              <CalendarDays size={15} />
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex h-[38px] items-center gap-2 rounded-lg bg-[#333333] px-8 text-[12px] font-semibold text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              className="flex h-[38px] items-center gap-2 whitespace-nowrap rounded-lg border border-[#FF4D4F] bg-white px-4 text-[13px] font-semibold text-[#FF4D4F]"
              onClick={handleOpenAddModal}
              type="button"
            >
              Add User Role
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="mx-2.5 overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
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

          <table className="w-full border-collapse">
            <thead className="h-12 border-b border-[#ECECEC] bg-[#FAFAFA]">
              <tr>
                {[
                  "Sr No",
                  "User Name",
                  "Role",
                  "Status",
                  "Created by",
                  "Created at",
                  "Update at",
                  "Action",
                ].map((column) => (
                  <th
                    className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-semibold text-[#444444]"
                    key={column}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td
                    className="px-4 py-5 text-center text-[12px] text-[#6B7280]"
                    colSpan={8}
                  >
                    Loading user roles...
                  </td>
                </tr>
              )}

              {!isLoading && currentData.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-5 text-center text-[12px] text-[#6B7280]"
                    colSpan={8}
                  >
                    No user roles found.
                  </td>
                </tr>
              )}

              {!isLoading && currentData.map((item, index) => (
                <tr className="h-12 border-b border-[#F2F2F2]" key={item.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#555555]">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#555555]">
                    {item.userName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#555555]">
                    {item.role}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px]">
                    <DashboardStatusToggle
                      onToggle={(nextStatus) =>
                        updateAdminUserRoleStatus(item.id, { status: nextStatus })
                      }
                      status={item.status}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#555555]">
                    {item.createdBy}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#555555]">
                    <DateTime date={item.createdDate} time={item.createdTime} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#555555]">
                    <DateTime date={item.updatedDate} time={item.updatedTime} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px]">
                    <div className="relative">
                      <DashboardEditButton
                        disabled={updatingRoleId === item.id}
                        onClick={() => handleEditStatus(item)}
                      >
                        {updatingRoleId === item.id ? "Updating..." : "Edit"}
                      </DashboardEditButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <p className="text-[12px] text-[#666666]">
            Showing <strong>{showingFrom}</strong> - <strong>{showingTo}</strong>{" "}
            of <strong>{effectiveTotalRecords}</strong> transactions
          </p>

          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              type="button"
            >
              <FiChevronLeft />
            </button>

            {visiblePageNumbers.map((page) => (
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium ${
                  page === currentPage
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : "text-[#6B7280] hover:bg-[#F8F8F8]"
                }`}
                key={page}
                onClick={() => setCurrentPage(page)}
                type="button"
              >
                {page}
              </button>
            ))}

            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={closeModal}
        >
          <div
            className="relative w-[660px] max-w-[92vw] rounded-[14px] bg-white px-10 py-9 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h3 className="mb-1.5 text-[19px] font-bold text-[#1A1A1A]">
                  {editingUserRole ? "Edit User Role" : "Add User Role"}
                </h3>
                <p className="text-[13px] text-[#8C8C8C]">
                  Fill all filed to user role
                </p>
              </div>
              <button
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#111111] text-white"
                onClick={closeModal}
                type="button"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="mb-7 flex flex-col gap-5">
              <FormInput
                disabled={Boolean(editingUserRole)}
                label="User"
                onChange={handleFormChange("userId")}
                placeholder="User"
                value={formData.userId}
              />
              <FormInput
                disabled={Boolean(editingUserRole)}
                label="User Name"
                onChange={handleFormChange("userName")}
                placeholder="User Name"
                value={formData.userName}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#333333]">
                  Role Name
                </label>
                <select
                  className="h-12 w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#333333] outline-none"
                  onChange={handleFormChange("roleName")}
                  value={formData.roleName}
                >
                  <option value="">Select Role Name</option>
                  {isLoadingRoles && (
                    <option disabled value="">
                      Loading roles...
                    </option>
                  )}
                  {!isLoadingRoles && roleOptions.length === 0 && (
                    <option disabled value="">
                      No roles found
                    </option>
                  )}
                  {roleOptions.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="h-12 rounded-lg bg-[#6B6B6B] px-8 text-[14px] font-semibold text-white"
              onClick={handleSubmit}
              type="button"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/55">
          <div className="w-[640px] max-w-[92vw] rounded-2xl bg-white px-12 py-14 text-center shadow-2xl">
            <div className="mb-2 flex justify-center">
              <svg
                fill="none"
                height="88"
                viewBox="0 0 88 88"
                width="88"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="44"
                  cy="44"
                  fill="none"
                  r="40"
                  stroke="#111111"
                  strokeDasharray="252"
                  strokeDashoffset="252"
                  strokeWidth="3"
                  style={{ animation: "drawCircleRole 0.6s ease-out forwards" }}
                />
                <path
                  d="M27 45 L39 57 L61 33"
                  fill="none"
                  stroke="#EB5757"
                  strokeDasharray="46"
                  strokeDashoffset="46"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                  style={{
                    animation: "drawCheckRole 0.4s ease-out 0.55s forwards",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircleRole {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawCheckRole {
                to { stroke-dashoffset: 0; }
              }
            `}</style>

            <h3 className="mb-8 mt-6 text-[20px] font-bold uppercase text-[#202224]">
              {(successMessage || "User Role Assign Successfully").toUpperCase()}
            </h3>
            <button
              className="h-[46px] w-[160px] rounded-lg bg-[#4B4B4B] text-[14px] font-semibold text-white"
              onClick={() => setShowSuccessModal(false)}
              type="button"
            >
              Back to Page
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function DateTime({ date, time }) {
  return (
    <div className="flex flex-col text-[12px] leading-5">
      <span className="font-medium text-[#2F80ED]">{date}</span>
      <span className="text-[#27AE60]">{time}</span>
    </div>
  );
}

function FormInput({ disabled = false, label, onChange, placeholder, value }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-[#333333]">{label}</label>
      <input
        className="h-12 w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#333333] outline-none placeholder:text-[#8B8B8B] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#6B7280] autofill:shadow-[inset_0_0_0_1000px_#ffffff]"
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

function isSuccessStatus(status) {
  return status === true || String(status).toLowerCase() === "success";
}

function normalizeUserRoleResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeUserRoleRow);
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
    Math.max(Math.ceil(totalRecords / rowsPerPage), 1);

  return { rows, totalRecords, totalPages: Math.max(totalPages, 1) };
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
          name: role,
        };
      }

      const id = role.id ?? role.roleId ?? index + 1;

      return {
        id,
        name: role.roleName ?? role.name ?? role.role ?? String(id),
      };
    })
    .filter((role) => role.id && role.name);
}

function normalizeUserRoleRow(row, index) {
  const user = row.user ?? row.employee ?? {};
  const role = row.role ?? row.userRole ?? {};
  const createdAt = row.createdAt ?? row.createdDate;
  const updatedAt = row.updatedAt ?? row.updatedDate;

  return {
    id: row.id ?? row.userRoleId ?? index + 1,
    userId: row.userId ?? user.id ?? "-",
    userName:
      row.userName ??
      row.employeeName ??
      row.name ??
      formatFullName(user.firstName, user.lastName) ??
      user.name ??
      "-",
    role:
      row.roleName ??
      row.role ??
      role.roleName ??
      role.name ??
      "-",
    createdBy: row.createdBy ?? row.createdByName ?? "-",
    ...splitDateTime(createdAt),
    ...splitDateTime(updatedAt, "updated"),
    status: formatStatus(row.status),
  };
}

function formatFullName(firstName, lastName) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || undefined;
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

function isDateWithinRange(value, fromDate, toDate, year) {
  if (!fromDate && !toDate && !year) return true;

  const normalizedDate = normalizeDateValue(value);
  if (!normalizedDate) return false;

  if (year && normalizedDate.slice(0, 4) !== year) return false;
  if (fromDate && normalizedDate < fromDate) return false;
  if (toDate && normalizedDate > toDate) return false;

  return true;
}

function normalizeDateValue(value) {
  if (!value || value === "-") return "";

  const stringValue = String(value).trim();
  const isoMatch = stringValue.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  const parsedDate = new Date(stringValue);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
}

function formatStatus(status) {
  if (typeof status === "boolean") return status ? "Success" : "Block";
  if (status === null || status === undefined || status === "") return "-";
  return String(status);
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  for (const key of [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "userRoles",
    "data",
  ]) {
    const childArray = findFirstArray(value[key], visited);
    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);
    if (childArray.length > 0) return childArray;
  }

  return hasUserRoleIdentity(value) ? [value] : [];
}

function hasUserRoleIdentity(row) {
  return Boolean(
    row?.id ||
      row?.userId ||
      row?.userName ||
      row?.roleName ||
      row?.role,
  );
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
