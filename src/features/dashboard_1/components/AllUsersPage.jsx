import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import { getUsers, updateUser, updateUserStatus } from "../services/adminEmployeeService";
import DashboardSuccessModal from "./DashboardSuccessModal";
import DashboardStatusToggle from "./DashboardStatusToggle";

const rowsPerPage = 10;

export default function AllUsersPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getUsers({
          page: currentPage - 1,
          search: searchQuery,
          size: rowsPerPage,
        });
        const normalizedResponse = normalizeUsersResponse(response.data);

        if (!isActive) return;

        setUsers(normalizedResponse.rows);
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalPages(normalizedResponse.totalPages);
      } catch (error) {
        if (!isActive) return;

        setUsers([]);
        setTotalRecords(0);
        setTotalPages(1);
        setErrorMessage(
          getAuthErrorMessage(error, "Unable to load users. Please try again."),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [currentPage, searchQuery]);

  const visiblePages = useMemo(() => {
    const pageCount = Math.max(totalPages, 1);
    const start = Math.max(Math.min(currentPage - 2, pageCount - 4), 1);
    const end = Math.min(start + 4, pageCount);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const showingFrom = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, totalRecords);
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      isDateWithinRange(user.createdDate, fromDate, toDate, year),
    );
  }, [fromDate, toDate, users, year]);

  const handleOpenEdit = (user) => {
    setOpenMenu(null);
    setEditingUser(user);
    setEditError("");
    setEditForm({
      firstName: user.firstName === "-" ? "" : user.firstName,
      lastName: user.lastName === "-" ? "" : user.lastName,
      email: user.email === "-" ? "" : user.email,
      phoneNumber: user.phoneNumber === "-" ? "" : user.phoneNumber,
    });
  };

  const handleCloseEdit = ({ force = false } = {}) => {
    if (isSavingEdit && !force) return;
    setEditingUser(null);
    setEditError("");
    setEditForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const payload = {
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      email: editForm.email.trim(),
      phoneNumber: editForm.phoneNumber.trim(),
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phoneNumber) {
      setEditError("First name, last name, email, and phone number are required.");
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    try {
      const userId = editingUser.userId ?? editingUser.id;
      const response = await updateUser(userId, payload);
      const updatedUser = normalizeUserRow(
        response.data?.responseData ?? response.data?.data ?? {
          ...editingUser.raw,
          ...payload,
          id: userId,
        },
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          (user.userId ?? user.id) === userId
            ? {
                ...user,
                ...updatedUser,
                userId,
                id: user.id,
              }
            : user,
        ),
      );
      setSuccessModalMessage(
        response.data?.responseMessage || "User updated successfully.",
      );
      handleCloseEdit({ force: true });
    } catch (error) {
      setEditError(getAuthErrorMessage(error, "Unable to update user. Please try again."));
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F4F5F9] px-6 py-5 font-['Inter',sans-serif]">
      <div className="overflow-visible rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#202224]">
            All Users Details Here
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="h-10 w-[105px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] text-[#202224] outline-none"
                onChange={(event) => setYear(event.target.value)}
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
              onChange={(event) => setFromDate(event.target.value)}
              ref={fromInputRef}
              type="date"
              value={fromDate}
            />
            <button
              className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
              onClick={() => fromInputRef.current?.showPicker ? fromInputRef.current.showPicker() : fromInputRef.current?.click()}
              type="button"
            >
              <span>{fromDate || "From"}</span>
              <CalendarDays size={15} />
            </button>

            <input
              className="hidden"
              onChange={(event) => setToDate(event.target.value)}
              ref={toInputRef}
              type="date"
              value={toDate}
            />
            <button
              className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
              onClick={() => toInputRef.current?.showPicker ? toInputRef.current.showPicker() : toInputRef.current?.click()}
              type="button"
            >
              <span>{toDate || "To"}</span>
              <CalendarDays size={15} />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#E0453C]">
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto overflow-y-visible rounded-[10px] border border-[#E5E7EB] bg-white">
          <table className="w-full min-w-[1280px] border-collapse">
            <thead className="h-[42px] border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <tr>
                {[
                  "Sr No",
                  "User Name",
                  "Email",
                  "Phone Number",
                  "Status",
                  "Created By",
                  "Role",
                  "Created Date",
                  "Updated At",
                  "Action",
                ].map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-[18px] py-2.5 text-left text-[13px] font-semibold text-[#555555]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr className="h-12 border-b border-[#F1F1F1]">
                  <td
                    className="px-[18px] py-5 text-center text-[13px] text-[#555555]"
                    colSpan={10}
                  >
                    Loading users...
                  </td>
                </tr>
              )}

              {!isLoading && filteredUsers.length === 0 && (
                <tr className="h-12 border-b border-[#F1F1F1]">
                  <td
                    className="px-[18px] py-5 text-center text-[13px] text-[#555555]"
                    colSpan={10}
                  >
                    No users found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="relative h-12 border-b border-[#F1F1F1]"
                  >
                    <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                      {user.phoneNumber}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5">
                      <DashboardStatusToggle
                        onToggle={(nextStatus) =>
                          updateUserStatus(user.userId ?? user.id, nextStatus)
                        }
                        status={user.status}
                      />
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                      {user.createdBy}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                      {user.role}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5">
                      <DateTime date={user.createdDate} time={user.createdTime} />
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-2.5">
                      <DateTime date={user.updatedDate} time={user.updatedTime} />
                    </td>
                    <td className="relative whitespace-nowrap px-[18px] py-2.5">
                      <button
                        className="flex items-center justify-center gap-1.5 rounded-md border border-[#E5E7EB] bg-[#EDEDED] px-3 py-1.5 text-[12px] font-medium text-[#4B4B4B]"
                        onClick={() => handleOpenEdit(user)}
                        type="button"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[13px] text-[#7B7B7B]">
            Showing <strong>{showingFrom}</strong> - <strong>{showingTo}</strong>{" "}
            of <strong>{totalRecords}</strong> Users
          </p>

          <div className="flex items-center gap-2.5">
            <button
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              type="button"
            >
              <FiChevronLeft />
            </button>

            {visiblePages.map((page) => (
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
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={handleCloseEdit}
        >
          <div
            className="w-full max-w-[520px] rounded-xl bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[20px] font-bold text-[#202224]">Edit User</h3>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Update user profile information.
                </p>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[18px] text-[#6B7280] hover:bg-[#F9FAFB]"
                onClick={handleCloseEdit}
                type="button"
              >
                x
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#E0453C]">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-[13px] font-semibold text-[#374151]">
                First Name
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange("firstName", event.target.value)
                  }
                  value={editForm.firstName}
                />
              </label>

              <label className="text-[13px] font-semibold text-[#374151]">
                Last Name
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange("lastName", event.target.value)
                  }
                  value={editForm.lastName}
                />
              </label>

              <label className="text-[13px] font-semibold text-[#374151] sm:col-span-2">
                Email
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange("email", event.target.value)
                  }
                  type="email"
                  value={editForm.email}
                />
              </label>

              <label className="text-[13px] font-semibold text-[#374151] sm:col-span-2">
                Phone Number
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange("phoneNumber", event.target.value)
                  }
                  value={editForm.phoneNumber}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="h-10 rounded-lg border border-[#E5E7EB] px-5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F9FAFB]"
                disabled={isSavingEdit}
                onClick={handleCloseEdit}
                type="button"
              >
                Cancel
              </button>
              <button
                className="h-10 rounded-lg bg-[#2F80ED] px-5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                type="button"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModalMessage && (
        <DashboardSuccessModal
          message={successModalMessage}
          onClose={() => setSuccessModalMessage("")}
          title="Edit Successful"
        />
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

function normalizeUsersResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rows = findFirstArray(payload).map(normalizeUserRow);
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

function normalizeUserRow(row, index = 0) {
  const firstName = row.firstName ?? row.first_name ?? "";
  const lastName = row.lastName ?? row.last_name ?? "";
  const name =
    row.name ??
    row.userName ??
    row.employeeName ??
    [firstName, lastName].filter(Boolean).join(" ") ??
    "-";
  const createdAt = row.createdAt ?? row.createdDate;
  const updatedAt = row.updatedAt ?? row.updatedDate;

  return {
    id: row.id ?? row.userId ?? index + 1,
    userId: row.userId ?? row.id ?? index + 1,
    firstName: firstName || "-",
    lastName: lastName || "-",
    name: name || "-",
    email: row.email ?? "-",
    phoneNumber: row.phoneNumber ?? row.mobile ?? row.mobileNumber ?? "-",
    role: row.role ?? row.roleName ?? "-",
    createdBy: row.createdBy ?? row.createdByName ?? "-",
    ...splitDateTime(createdAt),
    ...splitDateTime(updatedAt, "updated"),
    status: row.status,
    raw: row,
  };
}

function splitDateTime(value, prefix = "created") {
  const formattedValue = formatDateTime(value);
  const [date, time = "-"] = formattedValue.split(" ");

  return prefix === "updated"
    ? { updatedDate: date, updatedTime: time }
    : { createdDate: date, createdTime: time };
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

function formatDateTime(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").split(".")[0];
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  for (const key of ["content", "records", "items", "rows", "list", "users", "data"]) {
    const childArray = findFirstArray(value[key], visited);
    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);
    if (childArray.length > 0) return childArray;
  }

  return hasUserIdentity(value) ? [value] : [];
}

function hasUserIdentity(row) {
  if (!row || typeof row !== "object") return false;

  return [row.id, row.userId, row.email, row.firstName, row.userName].some(
    (value) => value !== null && value !== undefined && value !== "",
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
