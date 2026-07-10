import { useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  ChevronDown,
  Trash2,
} from "lucide-react";
import ExportFile from "./ExportFile";
import { allRuleScoreData } from "./AllRuleScoreData";

const TABLE_COLUMNS = [
  "ID",
  "Fraud Rule ID",
  "Rule Score",
  "Created At",
  "Created By",
  "Updated At",
  "Status",
  "Action",
];

export default function AllRuleScorePage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openActionId, setOpenActionId] = useState(null);

  // Delete flow state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const filteredData = useMemo(() => {
    return allRuleScoreData.filter((item) => {
      const [day, month, yearValue] = item.createdDate.split("-");
      const itemDate = new Date(`${yearValue}-${month}-${day}`);

      if (year && year !== "Year" && yearValue !== year) return false;

      if (fromDate && itemDate < new Date(fromDate)) return false;

      if (toDate && itemDate > new Date(toDate)) return false;

      return true;
    });
  }, [year, fromDate, toDate]);

  const handleDeleteClick = (id) => {
    setOpenActionId(null);
    setDeleteTargetId(id);
  };

  const handleCancelDelete = () => {
    setDeleteTargetId(null);
  };

  const handleConfirmDelete = () => {
    // TODO: wire up to your actual delete API call using deleteTargetId
    console.log("Deleting rule score id:", deleteTargetId);
    setDeleteTargetId(null);
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
            Rule score Overview
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
        <div className="overflow-visible rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1300px] border-collapse">

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
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="relative border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">
                      {item.id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.fraudRuleId}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.ruleScore}
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
                      <span
                        className={`font-semibold ${
                          item.status === "Pending"
                            ? "text-[#F2994A]"
                            : item.status === "Failed"
                            ? "text-[#EB5757]"
                            : "text-[#27AE60]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="relative px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenActionId(
                            openActionId === item.id ? null : item.id
                          )
                        }
                        className="flex h-8 w-[92px] items-center justify-between rounded-md border-none bg-[#F3F4F6] px-3 text-[12px] font-medium text-[#4B5563]"
                      >
                        Select
                        <ChevronDown size={13} className="text-[#808080]" />
                      </button>

                      {openActionId === item.id && (
                        <div className="absolute right-4 top-full z-10 flex w-[92px] flex-col items-center gap-2 border-t border-[#ECECEC] bg-white pt-2 pb-1">
                          <button
                            type="button"
                            className="text-[12px] font-medium text-[#2F80ED] hover:underline"
                            onClick={() => setOpenActionId(null)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-[12px] font-medium text-[#EB5757] hover:underline"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
          onClick={handleCancelDelete}
        >
          <div
            className="w-[640px] max-w-[92vw] rounded-2xl bg-white px-12 py-14 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex justify-center">
              <Trash2 size={56} className="text-black" strokeWidth={1.75} />
            </div>

            <h3 className="mb-4 text-[20px] font-semibold text-[#202224]">
              Delete Rule Score
            </h3>

            <p className="mx-auto mb-8 max-w-[420px] text-[14px] leading-6 text-[#7A7A7A]">
              Are you sure you want to delete this Rule Score data. This action
              is permanent and cannot be undone.
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55">
          <div className="w-[640px] max-w-[92vw] rounded-2xl bg-white px-12 py-14 text-center shadow-2xl">

            <div className="mb-6 flex justify-center">
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
              Rule Score Deleted Successfully
            </h3>

            <p className="mx-auto mb-8 max-w-[420px] text-[14px] leading-6 text-[#7A7A7A]">
              The Selected Rule Score has been deleted successfully.
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