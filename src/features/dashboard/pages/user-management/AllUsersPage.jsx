import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { CalendarDays, RotateCcw } from "lucide-react";

import { getAuthErrorMessage } from "../../../auth/services/authError";
import {
  getUsers,
  updateUser,
  updateUserStatus,
} from "../../services/adminEmployeeService";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import DashboardEditButton from "../../components/DashboardEditButton";
import DashboardStatusToggle from "../../components/DashboardStatusToggle";

import { openDashboardDatePicker } from "../../utils/dashboardDatePicker";

const rowsPerPage = 10;

// Rows already loaded on this page, kept across visits (the page unmounts
// when you leave it) and keyed by page / search / filter mode, so the table
// shows instantly when you come back and then refreshes quietly.
const pageCache = new Map();
const pageCacheKey = (requestedPage, search, isLocalFilterActive) =>
  JSON.stringify([requestedPage, search ?? "", isLocalFilterActive]);

export default function AllUsersPage({ searchQuery = "" }) {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Role filter
  const [role, setRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const initialCache = pageCache.get(pageCacheKey(0, searchQuery, false));
  const [users, setUsers] = useState(() => initialCache?.rows ?? []);
  const [totalRecords, setTotalRecords] = useState(() => initialCache?.totalRecords ?? 0);
  const [totalPages, setTotalPages] = useState(() => initialCache?.totalPages ?? 1);
  // Starts true when nothing is cached, so the first paint shows
  // "Loading..." rather than flashing "No ... found".
  const [isLoading, setIsLoading] = useState(() => !initialCache);
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

  /*
   * When any local filter is selected, we load all pages
   * and apply filtering on the frontend.
   */
  const isLocalFilterActive = Boolean(
    year || fromDate || toDate || role,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      const cacheKey = pageCacheKey(
        isLocalFilterActive ? 0 : currentPage - 1,
        searchQuery,
        isLocalFilterActive,
      );
      const cached = pageCache.get(cacheKey);

      if (cached) {
        setUsers(cached.rows);
        setTotalRecords(cached.totalRecords);
        setTotalPages(cached.totalPages);
        setIsLoading(false);
      } else {
        // The current rows stay on screen (dimmed) until the new ones arrive.
        setIsLoading(true);
      }
      setErrorMessage("");

      try {
        const requestedPage = isLocalFilterActive
          ? 0
          : currentPage - 1;

        const response = await getUsers({
          page: requestedPage,
          search: searchQuery,
          size: rowsPerPage,
        });

        const normalizedResponse = normalizeUsersResponse(response.data);
        const normalizedRows = [...normalizedResponse.rows];

        /*
         * If any local filter is active, load all pages so that
         * filtering is performed against the complete user list.
         */
        if (
          isLocalFilterActive &&
          normalizedResponse.totalPages > 1
        ) {
          const remainingResponses = await Promise.all(
            Array.from(
              {
                length: normalizedResponse.totalPages - 1,
              },
              (_, index) =>
                getUsers({
                  page: index + 1,
                  search: searchQuery,
                  size: rowsPerPage,
                }),
            ),
          );

          remainingResponses.forEach((pageResponse) => {
            normalizedRows.push(
              ...normalizeUsersResponse(pageResponse.data).rows,
            );
          });
        }

        if (!isActive) return;

        pageCache.set(cacheKey, {
          rows: normalizedRows,
          totalRecords: normalizedResponse.totalRecords,
          totalPages: normalizedResponse.totalPages,
        });

        setUsers(normalizedRows);
        setTotalRecords(normalizedResponse.totalRecords);
        setTotalPages(normalizedResponse.totalPages);
      } catch (error) {
        if (!isActive) return;
        // Keep showing the cached rows if a background refresh fails.
        if (cached) return;

        setUsers([]);
        setTotalRecords(0);
        setTotalPages(1);

        setErrorMessage(
          getAuthErrorMessage(
            error,
            "Unable to load users. Please try again.",
          ),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [
    currentPage,
    isLocalFilterActive,
    searchQuery,
  ]);

  /*
   * Apply Role + Date filters.
   */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole =
        !role ||
        String(user.role ?? "")
          .trim()
          .toUpperCase() === role.toUpperCase();

      const matchesDate = isDateWithinRange(
        user.createdDate,
        fromDate,
        toDate,
        year,
      );

      return matchesRole && matchesDate;
    });
  }, [
    fromDate,
    toDate,
    users,
    year,
    role,
  ]);

  const effectiveTotalRecords = isLocalFilterActive
    ? filteredUsers.length
    : totalRecords;

  const effectiveTotalPages = Math.max(
    Math.ceil(effectiveTotalRecords / rowsPerPage),
    1,
  );

  const visibleUsers = isLocalFilterActive
    ? filteredUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
      )
    : filteredUsers;

  const visiblePages = useMemo(() => {
    const pageCount = Math.max(effectiveTotalPages, 1);

    const start = Math.max(
      Math.min(currentPage - 2, pageCount - 4),
      1,
    );

    const end = Math.min(start + 4, pageCount);

    return Array.from(
      {
        length: end - start + 1,
      },
      (_, index) => start + index,
    );
  }, [
    currentPage,
    effectiveTotalPages,
  ]);

  const showingFrom =
    effectiveTotalRecords === 0
      ? 0
      : (currentPage - 1) * rowsPerPage + 1;

  const showingTo = Math.min(
    currentPage * rowsPerPage,
    effectiveTotalRecords,
  );

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

  /*
   * Role filter handler.
   */
  const handleRoleChange = (value) => {
    setRole(value);
    setCurrentPage(1);
  };

  /*
   * Reset all filters.
   */
  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
    setRole("");
    setCurrentPage(1);
  };

  const handleOpenEdit = (user) => {
    setOpenMenu(null);
    setEditingUser(user);
    setEditError("");

    setEditForm({
      firstName:
        user.firstName === "-"
          ? ""
          : user.firstName,
      lastName:
        user.lastName === "-"
          ? ""
          : user.lastName,
      email:
        user.email === "-"
          ? ""
          : user.email,
      phoneNumber:
        user.phoneNumber === "-"
          ? ""
          : user.phoneNumber,
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

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.phoneNumber
    ) {
      setEditError(
        "First name, last name, email, and phone number are required.",
      );
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    try {
      const userId =
        editingUser.userId ??
        editingUser.id;

      const response = await updateUser(
        userId,
        payload,
      );

      // The edited row is patched in place below, so drop the cached pages
      // instead of letting a later visit show the old values.
      pageCache.clear();

      const updatedUser = normalizeUserRow(
        response.data?.responseData ??
          response.data?.data ?? {
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
        response.data?.responseMessage || "",
      );

      handleCloseEdit({ force: true });
    } catch (error) {
      setEditError(
        getAuthErrorMessage(
          error,
          "Unable to update user. Please try again.",
        ),
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F4F5F9] px-6 py-5 font-['Inter',sans-serif]">
      <div className="overflow-visible rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">

        {/* =========================================================
    HEADER + FILTERS
========================================================= */}
<div className="mb-4 flex flex-wrap items-center justify-between gap-4">

  <h2 className="text-[20px] font-bold text-[#202224]">
    All Users Details Here
  </h2>

  <div className="flex flex-wrap items-center gap-3">

    {/* =====================================================
        ROLE FILTER
    ===================================================== */}
    <div className="relative">
      <select
        className="h-10 w-[125px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] text-[#202224] outline-none focus:border-[#2F80ED]"
        onChange={(event) =>
          handleRoleChange(event.target.value)
        }
        value={role}
      >
        <option value="">
          All Roles
        </option>

        <option value="ADMIN">
          ADMIN
        </option>

        <option value="EMPLOYEE">
          EMPLOYEE
        </option>
      </select>

      <FiChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
        size={15}
      />
    </div>

    {/* =====================================================
        YEAR FILTER
    ===================================================== */}
    <div className="relative">
      <select
        className="h-10 w-[105px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] text-[#202224] outline-none focus:border-[#2F80ED]"
        onChange={(event) =>
          handleYearChange(event.target.value)
        }
        value={year}
      >
        <option value="">
          Year
        </option>

        <option value="2026">
          2026
        </option>

        <option value="2025">
          2025
        </option>

        <option value="2024">
          2024
        </option>
      </select>

      <FiChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
        size={15}
      />
    </div>

    {/* =====================================================
        FROM DATE
    ===================================================== */}
    <input
      className="hidden"
      onChange={(event) =>
        handleFromDateChange(
          event.target.value,
        )
      }
      ref={fromInputRef}
      type="date"
      value={fromDate}
    />

    <button
      className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
      onClick={(event) =>
        openDashboardDatePicker(
          fromInputRef.current,
          event.currentTarget,
        )
      }
      type="button"
    >
      <span>
        {fromDate || "From"}
      </span>

      <CalendarDays size={15} />
    </button>

    {/* =====================================================
        TO DATE
    ===================================================== */}
    <input
      className="hidden"
      onChange={(event) =>
        handleToDateChange(
          event.target.value,
        )
      }
      ref={toInputRef}
      type="date"
      value={toDate}
    />

    <button
      className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[12px] text-[#808080]"
      onClick={(event) =>
        openDashboardDatePicker(
          toInputRef.current,
          event.currentTarget,
        )
      }
      type="button"
    >
      <span>
        {toDate || "To"}
      </span>

      <CalendarDays size={15} />
    </button>

    {/* =====================================================
        RESET
    ===================================================== */}
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
        {/* =========================================================
            ERROR MESSAGE
        ========================================================= */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#E0453C]">
            {errorMessage}
          </div>
        )}

        {/* =========================================================
            USERS TABLE
        ========================================================= */}
        <div className="relative overflow-x-auto overflow-y-visible rounded-[10px] border border-[#E5E7EB] bg-white">
          {isLoading && visibleUsers.length > 0 && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-16">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#333333]" />
            </div>
          )}

          <table className="w-full min-w-[1280px] border-collapse">

            <thead className="h-[42px] border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <tr>
                {[
                  "Sr No",
                  "User Name",
                  "Email",
                  "Phone Number",
                  "Role",
                  "Status",
                  "Created By",
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

            <tbody
              className={`transition-opacity duration-200 ${
                isLoading && visibleUsers.length > 0 ? "opacity-50" : "opacity-100"
              }`}
            >

              {/* ===================================================
                  LOADING
              =================================================== */}
              {isLoading && visibleUsers.length === 0 && (
                <tr className="h-12 border-b border-[#F1F1F1]">
                  <td
                    className="px-[18px] py-5 text-center text-[13px] text-[#555555]"
                    colSpan={10}
                  >
                    Loading users...
                  </td>
                </tr>
              )}

              {/* ===================================================
                  NO USERS
              =================================================== */}
              {!isLoading &&
                visibleUsers.length === 0 && (
                  <tr className="h-12 border-b border-[#F1F1F1]">
                    <td
                      className="px-[18px] py-5 text-center text-[13px] text-[#555555]"
                      colSpan={10}
                    >
                      No users found.
                    </td>
                  </tr>
                )}

              {/* ===================================================
                  USER ROWS
              =================================================== */}
              {visibleUsers.map(
                  (user, index) => (
                    <tr
                      key={user.id}
                      className="relative h-12 border-b border-[#F1F1F1]"
                    >

                      {/* Sr No */}
                      <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                        {(currentPage - 1) *
                          rowsPerPage +
                          index +
                          1}
                      </td>

                      {/* User Name */}
                      <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                        {user.name}
                      </td>

                      {/* Email */}
                      <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                        {user.phoneNumber}
                      </td>

                      {/* Role */}
                      <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] font-medium text-[#555555]">
                        {user.role}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-[18px] py-2.5">
                        <DashboardStatusToggle
                          onToggle={(nextStatus) =>
                            updateUserStatus(
                              user.userId ??
                                user.id,
                              nextStatus,
                            ).then((response) => {
                              // Cached pages still hold the old status.
                              pageCache.clear();
                              return response;
                            })
                          }
                          status={user.status}
                        />
                      </td>

                      {/* Created By */}
                      <td className="whitespace-nowrap px-[18px] py-2.5 text-[13px] text-[#555555]">
                        {user.createdBy}
                      </td>

                      {/* Created Date */}
                      <td className="whitespace-nowrap px-[18px] py-2.5">
                        <DateTime
                          date={
                            user.createdDate
                          }
                          time={
                            user.createdTime
                          }
                        />
                      </td>

                      {/* Updated At */}
                      <td className="whitespace-nowrap px-[18px] py-2.5">
                        <DateTime
                          date={
                            user.updatedDate
                          }
                          time={
                            user.updatedTime
                          }
                        />
                      </td>

                      {/* Action */}
                      <td className="relative whitespace-nowrap px-[18px] py-2.5">
                        <DashboardEditButton
                          onClick={() =>
                            handleOpenEdit(
                              user,
                            )
                          }
                        >
                          Edit
                        </DashboardEditButton>
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </div>

        {/* =========================================================
            PAGINATION
        ========================================================= */}
        <div className="mt-4 flex items-center justify-between">

          <p className="text-[13px] text-[#7B7B7B]">
            Showing{" "}
            <strong>{showingFrom}</strong>{" "}
            -{" "}
            <strong>{showingTo}</strong>{" "}
            of{" "}
            <strong>
              {effectiveTotalRecords}
            </strong>{" "}
            Users
          </p>

          <div className="flex items-center gap-2.5">

            {/* Previous */}
            <button
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      page - 1,
                      1,
                    ),
                )
              }
              type="button"
            >
              <FiChevronLeft />
            </button>

            {/* Page numbers */}
            {visiblePages.map((page) => (
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium ${
                  page === currentPage
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : "text-[#6B7280] hover:bg-[#F8F8F8]"
                }`}
                key={page}
                onClick={() =>
                  setCurrentPage(page)
                }
                type="button"
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                currentPage >=
                effectiveTotalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      page + 1,
                      effectiveTotalPages,
                    ),
                )
              }
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ===========================================================
          EDIT USER MODAL
      =========================================================== */}
      {editingUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={handleCloseEdit}
        >
          <div
            className="w-full max-w-[520px] rounded-xl bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,.22)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between">

              <div>
                <h3 className="text-[20px] font-bold text-[#202224]">
                  Edit User
                </h3>

                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Update user profile
                  information.
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

            {/* Edit Error */}
            {editError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#E0453C]">
                {editError}
              </div>
            )}

            {/* Form */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* First Name */}
              <label className="text-[13px] font-semibold text-[#374151]">
                First Name

                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange(
                      "firstName",
                      event.target.value,
                    )
                  }
                  value={
                    editForm.firstName
                  }
                />
              </label>

              {/* Last Name */}
              <label className="text-[13px] font-semibold text-[#374151]">
                Last Name

                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange(
                      "lastName",
                      event.target.value,
                    )
                  }
                  value={
                    editForm.lastName
                  }
                />
              </label>

              {/* Email */}
              <label className="text-[13px] font-semibold text-[#374151] sm:col-span-2">
                Email

                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange(
                      "email",
                      event.target.value,
                    )
                  }
                  type="email"
                  value={editForm.email}
                />
              </label>

              {/* Phone Number */}
              <label className="text-[13px] font-semibold text-[#374151] sm:col-span-2">
                Phone Number

                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#202224] outline-none [color-scheme:light] autofill:shadow-[inset_0_0_0_1000px_#ffffff] focus:border-[#2F80ED]"
                  onChange={(event) =>
                    handleEditFormChange(
                      "phoneNumber",
                      event.target.value,
                    )
                  }
                  value={
                    editForm.phoneNumber
                  }
                />
              </label>
            </div>

            {/* Modal Buttons */}
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
                {isSavingEdit
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================================
          SUCCESS MODAL
      =========================================================== */}
      {successModalMessage && (
        <DashboardSuccessModal
          message={successModalMessage}
          onClose={() =>
            setSuccessModalMessage("")
          }
          title="Updated Successfully"
        />
      )}
    </div>
  );
}

/* ===============================================================
   DATE/TIME COMPONENT
================================================================ */

function DateTime({ date, time }) {
  return (
    <div className="flex flex-col text-[13px] leading-5">
      <span className="font-medium text-[#2F80ED]">
        {date}
      </span>

      <span className="text-[#27AE60]">
        {time}
      </span>
    </div>
  );
}

/* ===============================================================
   NORMALIZE USERS RESPONSE
================================================================ */

function normalizeUsersResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  const rows =
    findFirstArray(payload).map(
      normalizeUserRow,
    );

  const totalRecords =
    findFirstNumber(payload, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rows.length;

  const totalPages =
    findFirstNumber(payload, [
      "totalPages",
      "pages",
    ]) ??
    Math.max(
      Math.ceil(
        totalRecords / rowsPerPage,
      ),
      1,
    );

  return {
    rows,
    totalRecords,
    totalPages: Math.max(
      totalPages,
      1,
    ),
  };
}

/* ===============================================================
   NORMALIZE USER ROW
================================================================ */

function normalizeUserRow(
  row,
  index = 0,
) {
  const firstName =
    row.firstName ??
    row.first_name ??
    "";

  const lastName =
    row.lastName ??
    row.last_name ??
    "";

  const name =
    row.name ??
    row.userName ??
    row.employeeName ??
    [firstName, lastName]
      .filter(Boolean)
      .join(" ") ??
    "-";

  const createdAt =
    row.createdAt ??
    row.createdDate;

  const updatedAt =
    row.updatedAt ??
    row.updatedDate;

  return {
    id:
      row.id ??
      row.userId ??
      index + 1,

    userId:
      row.userId ??
      row.id ??
      index + 1,

    firstName:
      firstName || "-",

    lastName:
      lastName || "-",

    name:
      name || "-",

    email:
      row.email ?? "-",

    phoneNumber:
      row.phoneNumber ??
      row.mobile ??
      row.mobileNumber ??
      "-",

    /*
     * Role supports both possible backend fields:
     * role
     * roleName
     */
    role:
      row.role ??
      row.roleName ??
      "-",

    createdBy:
      row.createdBy ??
      row.createdByName ??
      "-",

    ...splitDateTime(
      createdAt,
    ),

    ...splitDateTime(
      updatedAt,
      "updated",
    ),

    status: row.status,

    raw: row,
  };
}

/* ===============================================================
   SPLIT DATE TIME
================================================================ */

function splitDateTime(
  value,
  prefix = "created",
) {
  const formattedValue =
    formatDateTime(value);

  const [
    date,
    time = "-",
  ] = formattedValue.split(" ");

  return prefix === "updated"
    ? {
        updatedDate: date,
        updatedTime: time,
      }
    : {
        createdDate: date,
        createdTime: time,
      };
}

/* ===============================================================
   DATE RANGE FILTER
================================================================ */

function isDateWithinRange(
  value,
  fromDate,
  toDate,
  year,
) {
  if (
    !fromDate &&
    !toDate &&
    !year
  ) {
    return true;
  }

  const normalizedDate =
    normalizeDateValue(value);

  if (!normalizedDate) {
    return false;
  }

  if (
    year &&
    normalizedDate.slice(0, 4) !== year
  ) {
    return false;
  }

  if (
    fromDate &&
    normalizedDate < fromDate
  ) {
    return false;
  }

  if (
    toDate &&
    normalizedDate > toDate
  ) {
    return false;
  }

  return true;
}

/* ===============================================================
   NORMALIZE DATE
================================================================ */

function normalizeDateValue(value) {
  if (!value || value === "-") {
    return "";
  }

  const stringValue =
    String(value).trim();

  const isoMatch =
    stringValue.match(
      /^\d{4}-\d{2}-\d{2}/,
    );

  if (isoMatch) {
    return isoMatch[0];
  }

  const parsedDate =
    new Date(stringValue);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "";
  }

  return parsedDate
    .toISOString()
    .slice(0, 10);
}

/* ===============================================================
   FORMAT DATE TIME
================================================================ */

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return String(value)
    .replace("T", " ")
    .split(".")[0];
}

/* ===============================================================
   FIND FIRST ARRAY
================================================================ */

function findFirstArray(
  value,
  visited = new Set(),
) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (
    typeof value !== "object" ||
    visited.has(value)
  ) {
    return [];
  }

  visited.add(value);

  for (const key of [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "users",
    "data",
  ]) {
    const childArray =
      findFirstArray(
        value[key],
        visited,
      );

    if (childArray.length > 0) {
      return childArray;
    }
  }

  for (const childValue of Object.values(
    value,
  )) {
    const childArray =
      findFirstArray(
        childValue,
        visited,
      );

    if (childArray.length > 0) {
      return childArray;
    }
  }

  return hasUserIdentity(value)
    ? [value]
    : [];
}

/* ===============================================================
   CHECK USER IDENTITY
================================================================ */

function hasUserIdentity(row) {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return false;
  }

  return [
    row.id,
    row.userId,
    row.email,
    row.firstName,
    row.userName,
  ].some(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "",
  );
}

/* ===============================================================
   FIND FIRST NUMBER
================================================================ */

function findFirstNumber(
  value,
  keys,
  visited = new Set(),
) {
  if (
    !value ||
    typeof value !== "object" ||
    visited.has(value)
  ) {
    return undefined;
  }

  visited.add(value);

  for (const key of keys) {
    const candidate =
      value[key];

    if (
      typeof candidate === "number"
    ) {
      return candidate;
    }

    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      !Number.isNaN(
        Number(candidate),
      )
    ) {
      return Number(candidate);
    }
  }

  for (const childValue of Object.values(
    value,
  )) {
    const candidate =
      findFirstNumber(
        childValue,
        keys,
        visited,
      );

    if (
      candidate !== undefined
    ) {
      return candidate;
    }
  }

  return undefined;
}