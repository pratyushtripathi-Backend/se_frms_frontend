import { useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import { roleAccessData } from "./RoleAccessData";

const TABLE_COLUMNS = [
  "ID",
  "Access",
  "Created By",
  "Created at",
  "Update at",
  "Status",
];

const ROLE_OPTIONS = ["Admin", "Manager", "Employee", "Auditor"];
const ACCESS_OPTIONS = ["Mohit Singh", "Priya Sharma", "Rahul Verma", "Anjali Mehta"];

function AddAccessModal({ onClose, onSave }) {
  const [role, setRole] = useState("");
  const [access, setAccess] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
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
                className="h-[52px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
              >
                <option value="" disabled>
                  Select Role
                </option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
              <select
                value={access}
                onChange={(e) => setAccess(e.target.value)}
                className="h-[52px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
              >
                <option value="" disabled>
                  Select Access
                </option>
                {ACCESS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={() => onSave({ role, access })}
          className="mt-10 h-[46px] rounded-[10px] bg-[#4B5563] px-8 text-[14px] font-semibold text-white transition-colors hover:bg-[#374151]"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
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

        <h3 className="text-[18px] font-semibold text-[#202224]">
          Role&nbsp; Access add Successfully
        </h3>

        <p className="mt-2 text-[13px] text-[#7A7A7A]">
          Role Access permissions have been created successfully.
        </p>

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
        "Use the search bar above to find a user or role. Assigned
        permissions and access details will appear here after a
        successful search."
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const filteredData = useMemo(() => {
    if (!hasSearched) return [];

    return roleAccessData.filter((item) => {
      const [day, month, year] = item.createdDate.split("-");
      const itemDate = new Date(`${year}-${month}-${day}`);

      if (fromDate && itemDate < new Date(fromDate)) return false;

      if (toDate && itemDate > new Date(toDate)) return false;

      if (
        searchValue &&
        !item.role.toLowerCase().includes(searchValue.toLowerCase()) &&
        !item.access.toLowerCase().includes(searchValue.toLowerCase()) &&
        !item.createdBy.toLowerCase().includes(searchValue.toLowerCase())
      )
        return false;

      return true;
    });
  }, [fromDate, toDate, searchValue, hasSearched]);

  const matchedRole = filteredData[0]?.role || searchValue;

  const handleSearch = () => {
    setSearchValue(searchInput);
    setHasSearched(true);
  };

  const handleSave = () => {
    setShowFormModal(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center gap-3">

          {/* Search */}
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
              className="h-[46px] w-full rounded-lg border border-[#E5E7EB] pl-11 pr-4 text-[14px] text-[#202224] outline-none placeholder:text-[#A6A6A6]"
            />
          </div>

          {/* Search Button */}
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
            onClick={() => setShowFormModal(true)}
            className="flex h-[46px] items-center gap-2 whitespace-nowrap rounded-lg border border-[#FF0D0D] bg-white px-4 text-[13px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1]"
          >
            <span>Add Role Access</span>
            <Plus size={16} strokeWidth={2.5} />
          </button>

        </div>

        {!hasSearched ? (
          <EmptyState />
        ) : (
          <>
            {/* Role Summary */}
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
                <p className="mt-1 text-[15px] text-[#4B5563]">04</p>
              </div>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

              {/* Section Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-[16px] font-semibold text-[#202224]">
                  All Access Details
                </h2>

                <div className="flex items-center gap-3">

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

                </div>
              </div>

              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[1000px] border-collapse">

                  <thead className="bg-[#F8F9FB]">
                    <tr>
                      {TABLE_COLUMNS.map((column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap border-b border-t border-[#ECECEC] px-6 py-4 text-left text-[12px] font-semibold text-[#5A5A5A]"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                      >
                        <td className="px-6 py-4 font-medium">
                          {item.id}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {item.access}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {item.createdBy}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col leading-5">
                            <span className="font-medium text-[#2F80ED]">
                              {item.createdDate}
                            </span>

                            <span className="text-[#27AE60]">
                              {item.createdTime}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col leading-5">
                            <span className="font-medium text-[#2F80ED]">
                              {item.updatedDate}
                            </span>

                            <span className="text-[#27AE60]">
                              {item.updatedTime}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              item.status === "Block"
                                ? "text-[#EB5757]"
                                : "text-[#27AE60]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Bar */}

              <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">

                <p className="text-[12px] text-[#7A7A7A]">
                  Showing {filteredData.length} of 135 transactions
                </p>

                <div className="flex items-center gap-2">

                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50">
                    &lt;
                  </button>

                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                        page === 1
                          ? "bg-[#F3F4F6] text-[#111827]"
                          : "text-[#6B7280] hover:bg-[#F8F8F8]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50">
                    &gt;
                  </button>

                </div>

              </div>

            </div>
          </>
        )}
      </div>
      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

      {/* Modals */}
      {showFormModal && (
        <AddAccessModal
          onClose={() => setShowFormModal(false)}
          onSave={handleSave}
        />
      )}

      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}

    </div>
  );
}