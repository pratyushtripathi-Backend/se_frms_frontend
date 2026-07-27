import { useState, useRef, useMemo, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import ExportFile from "./ExportFile";
import { allFraudRulesData } from "./AllFraudRulesData";

const TABLE_COLUMNS = [
  "ID",
  "Category ID",
  "Created At",
  "Rule Code",
  "Rule Name",
  "Rule Description",
  "Created By",
  "Updated At",
  "Status",
];

const ROWS_PER_PAGE = 10;

export default function AllFraudRulesPage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Track toggle state per row, seeded from the source data's status field
  // ("Pending" = on/right, "Failed" = off/left)
  const [statusMap, setStatusMap] = useState(() =>
    Object.fromEntries(
      allFraudRulesData.map((item) => [item.id, item.status === "Pending"])
    )
  );

  const toggleStatus = (id) => {
    setStatusMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const filteredData = useMemo(() => {
    return allFraudRulesData.filter((item) => {
      const [day, month, yearValue] = item.createdDate.split("-");
      const itemDate = new Date(`${yearValue}-${month}-${day}`);

      if (year && year !== "Year" && yearValue !== year) return false;

      if (fromDate && itemDate < new Date(fromDate)) return false;

      if (toDate && itemDate > new Date(toDate)) return false;

      return true;
    });
  }, [year, fromDate, toDate]);

  // Pagination is entirely data-driven. With <= ROWS_PER_PAGE items,
  // totalPages is 1 and the pagination bar never renders at all.
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
  const hasPagination = filteredData.length > ROWS_PER_PAGE;

  // Reset back to page 1 whenever filters change the dataset
  useEffect(() => {
    setCurrentPage(1);
  }, [year, fromDate, toDate]);

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

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

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
                onChange={(e) => setYear(e.target.value)}
                className="h-10 w-[95px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] outline-none"
              >
                <option>Year</option>
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
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

            {/* Export */}
            <ExportFile rows={filteredData} />

          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1500px] border-collapse">

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
                      No matching fraud rules for the selected filters.
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
                        {item.categoryId}
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

                      <td className="whitespace-nowrap px-4 py-4">
                        {item.ruleCode}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {item.ruleName}
                      </td>

                      <td className="max-w-[320px] px-4 py-4">
                        {item.ruleDescription}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {item.createdBy}
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
      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

    </div>
  );
}