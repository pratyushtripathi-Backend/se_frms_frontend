import { useState, useRef, useMemo, useEffect } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  X,
} from "lucide-react";
import { accessMasterData } from "./AccessMasterData";

const TABLE_COLUMNS = [
  "ID",
  "Access",
  "Created by",
  "Created at",
  "Update at",
  "Status",
];

const ROWS_PER_PAGE = 10;

export default function AccessMasterPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add Access modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessName, setAccessName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Status toggle state, seeded straight from the data's Active/Inactive field
  const [statusMap, setStatusMap] = useState(() =>
    Object.fromEntries(
      accessMasterData.map((item) => [item.id, item.status === "Active"])
    )
  );

  const toggleStatus = (id) => {
    setStatusMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const filteredData = useMemo(() => {
    return accessMasterData.filter((item) => {
      const [day, month, year] = item.createdDate.split("-");
      const itemDate = new Date(`${year}-${month}-${day}`);

      if (fromDate && itemDate < new Date(fromDate)) return false;

      if (toDate && itemDate > new Date(toDate)) return false;

      if (
        searchValue &&
        !item.access.toLowerCase().includes(searchValue.toLowerCase()) &&
        !item.createdBy.toLowerCase().includes(searchValue.toLowerCase())
      )
        return false;

      return true;
    });
  }, [fromDate, toDate, searchValue]);

  // Pagination is entirely data-driven. With <= ROWS_PER_PAGE items,
  // totalPages is 1 and the pagination bar never renders at all.
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
  const hasPagination = filteredData.length > ROWS_PER_PAGE;

  // Reset back to page 1 whenever filters change the dataset
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, searchValue]);

  // Clamp currentPage if filtering shrinks the result set below it
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    if (!hasPagination) return filteredData;
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData.slice(start, start + ROWS_PER_PAGE);
  }, [filteredData, currentPage, hasPagination]);

  // Windowed page numbers (with ellipses) so it stays compact even if the
  // dataset grows to hundreds of pages later.
  const pageNumbers = useMemo(() => {
    if (!hasPagination) return [];

    const pages = [];
    const windowSize = 1;

    for (let p = 1; p <= totalPages; p++) {
      const isEdge = p === 1 || p === totalPages;
      const isWithinWindow = Math.abs(p - currentPage) <= windowSize;

      if (isEdge || isWithinWindow) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  }, [totalPages, currentPage, hasPagination]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAccessName("");
  };

  const handleSave = () => {
    // TODO: wire up to your actual create-access API call using accessName
    console.log("Creating access:", accessName);
    setIsModalOpen(false);
    setAccessName("");
    setShowSuccessModal(true);
  };

  const handleBackToPage = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

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

            {/* Search Value */}
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search Value"
                className="h-10 w-[170px] rounded-lg border border-[#E5E7EB] pl-3 pr-9 text-[12px] text-[#202224] outline-none placeholder:text-[#A6A6A6]"
              />

              <Search
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>

            {/* Add Access */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
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

            <table className="w-full min-w-[900px] border-collapse">

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
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-4 py-10 text-center text-[12px] text-[#9CA3AF]"
                    >
                      No matching access entries found.
                    </td>
                  </tr>
                )}

                {paginatedData.map((item) => {
                  const isActive = statusMap[item.id];

                  return (
                  <tr
                    key={item.id}
                    className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {item.id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.access}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.createdBy}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.createdDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.createdTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.updatedDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.updatedTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(item.id)}
                        className={`relative flex h-7 w-[92px] items-center rounded-full px-1 text-[12px] font-semibold text-white transition-colors ${
                          isActive
                            ? "justify-start bg-[#27AE60]"
                            : "justify-end bg-[#BDBDBD]"
                        }`}
                      >
                        <span>{isActive ? "Active" : "Inactive"}</span>

                        <span
                          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${
                            isActive ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}

          <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">

            <p className="text-[12px] text-[#7A7A7A]">
              {filteredData.length === 0
                ? "Showing 0 of 0 transactions"
                : hasPagination
                ? `Showing ${(currentPage - 1) * ROWS_PER_PAGE + 1}-${Math.min(
                    currentPage * ROWS_PER_PAGE,
                    filteredData.length
                  )} of ${filteredData.length} transactions`
                : `Showing ${filteredData.length} of ${filteredData.length} transactions`}
            </p>

            {hasPagination && (
              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &lt;
                </button>

                {pageNumbers.map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-8 w-8 items-center justify-center text-[12px] text-[#9CA3AF]"
                    >
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                        page === currentPage
                          ? "bg-[#F3F4F6] text-[#111827]"
                          : "text-[#6B7280] hover:bg-[#F8F8F8]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &gt;
                </button>

              </div>
            )}

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
                Add Access
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
              className="h-[46px] rounded-lg bg-[#6B6B6B] px-8 text-[14px] font-semibold text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55">
          <div className="w-[640px] max-w-[92vw] rounded-2xl bg-white px-12 py-14 text-center shadow-2xl">

            <div className="mb-6 flex w-full items-center justify-center">
              <svg
                width="88"
                height="88"
                viewBox="0 0 88 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="44"
                  cy="44"
                  r="40"
                  stroke="#111111"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="252"
                  strokeDashoffset="252"
                  style={{
                    animation: "drawCircle 0.6s ease-out forwards",
                  }}
                />
                <path
                  d="M27 45 L39 57 L61 33"
                  stroke="#EB5757"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="46"
                  strokeDashoffset="46"
                  style={{
                    animation:
                      "drawCheck 0.4s ease-out 0.55s forwards",
                  }}
                />
              </svg>

              <style>{`
                @keyframes drawCircle {
                  to { stroke-dashoffset: 0; }
                }
                @keyframes drawCheck {
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
            </div>

            <h3 className="mb-4 text-[20px] font-semibold text-[#202224]">
              Access Created Successfully
            </h3>

            <p className="mx-auto mb-8 max-w-[420px] text-[14px] leading-6 text-[#7A7A7A]">
              Access permissions have been created successfully.
            </p>

            <button
              type="button"
              onClick={handleBackToPage}
              className="h-[46px] w-[160px] rounded-lg border-none bg-[#4B4B4B] text-[14px] font-semibold text-white"
            >
              Back to Page
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

    </div>
  );
}