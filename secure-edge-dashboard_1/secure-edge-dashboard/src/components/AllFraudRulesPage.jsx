import { useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  X,
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
  "Rule Expression",
  "Created By",
  "Updated At",
  "Status",
];

const CATEGORY_OPTIONS = [
  { id: "CAT001", label: "Transaction Fraud" },
  { id: "CAT002", label: "Account Takeover" },
  { id: "CAT003", label: "Identity Fraud" },
  { id: "CAT004", label: "Payment Fraud" },
  { id: "CAT005", label: "Device Fraud" },
];

const emptyRuleForm = {
  categoryId: "",
  ruleName: "",
  ruleCode: "",
  ruleDescription: "",
  ruleExpression: "",
};

export default function AllFraudRulesPage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  // Create Fraud Rule modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ruleForm, setRuleForm] = useState(emptyRuleForm);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isCategorySelected = ruleForm.categoryId !== "";

  const openCreateModal = () => {
    setRuleForm(emptyRuleForm);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleRuleFieldChange = (field) => (event) => {
    setRuleForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSaveRule = () => {
    // TODO: wire up to real create-rule submission once the API is available
    setShowCreateModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessBack = () => {
    setShowSuccessModal(false);
  };

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

            {/* Create Rule */}
            <button
              type="button"
              onClick={openCreateModal}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-[#FF4D4F] bg-white px-4 text-[13px] font-semibold text-[#FF4D4F]"
            >
              Create Rule
              <Plus size={14} />
            </button>

          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1750px] border-collapse">

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
                {filteredData.map((item) => {
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

                      <td className="max-w-[280px] px-4 py-4">
                        {item.ruleDescription}
                      </td>

                      <td className="max-w-[280px] px-4 py-4">
                        {item.ruleExpression}
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
              Showing {filteredData.length} of {allFraudRulesData.length} transactions
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
      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

      {/* Create Fraud Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45">
          <div className="w-[940px] max-w-[92vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-[17px] font-bold text-[#202224]">
                Create Fraud Rule
              </h3>

              <button
                type="button"
                onClick={closeCreateModal}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#202224] text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">

              {/* Choose Category */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Choose Category
                </label>

                <div className="relative">
                  <select
                    value={ruleForm.categoryId}
                    onChange={handleRuleFieldChange("categoryId")}
                    className="h-11 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 pr-9 text-[13px] text-[#202224] outline-none"
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
                  />
                </div>
              </div>

              {/* Rule Name */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Name
                </label>

                <input
                  type="text"
                  disabled={!isCategorySelected}
                  value={ruleForm.ruleName}
                  onChange={handleRuleFieldChange("ruleName")}
                  placeholder="Rule Name"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

              {/* Rule Code */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Code
                </label>

                <input
                  type="text"
                  disabled={!isCategorySelected}
                  value={ruleForm.ruleCode}
                  onChange={handleRuleFieldChange("ruleCode")}
                  placeholder="Rule Code"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

              {/* Rule Description */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Description
                </label>

                <textarea
                  disabled={!isCategorySelected}
                  value={ruleForm.ruleDescription}
                  onChange={handleRuleFieldChange("ruleDescription")}
                  placeholder="Write a description"
                  rows={1}
                  className="h-11 w-full resize-none overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

              {/* Rule Expression */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#202224]">
                  Rule Expression
                </label>

                <input
                  type="text"
                  disabled={!isCategorySelected}
                  value={ruleForm.ruleExpression}
                  onChange={handleRuleFieldChange("ruleExpression")}
                  placeholder="Rule Expression"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:text-[#B0B0B0]"
                />
              </div>

            </div>

            {!isCategorySelected && (
              <p className="mt-5 text-[13px] font-semibold text-[#FF4D4F]">
                Please select a category first to fill in the other fields.
              </p>
            )}

            <button
              type="button"
              onClick={handleSaveRule}
              className="mt-6 h-[46px] w-[140px] rounded-lg border-none bg-[#3A3A3A] text-[14px] font-semibold text-white"
            >
              Save
            </button>

          </div>
        </div>
      )}

      {/* Create Fraud Rule Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55">
          <div className="w-[760px] max-w-[94vw] rounded-lg bg-white px-12 py-14 text-center shadow-2xl">

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
                    animation: "drawCircleFraud 0.6s ease-out forwards",
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
                      "drawCheckFraud 0.4s ease-out 0.55s forwards",
                  }}
                />
              </svg>

              <style>{`
                @keyframes drawCircleFraud {
                  to { stroke-dashoffset: 0; }
                }
                @keyframes drawCheckFraud {
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
            </div>

            <h3 className="mb-4 text-[20px] font-semibold text-[#202224]">
              Fraud Rule Create
            </h3>

            <p className="mx-auto mb-8 max-w-[420px] text-[14px] leading-6 text-[#7A7A7A]">
              Fraud Rule Create  has been updated successfully.
            </p>

            <button
              type="button"
              onClick={handleSuccessBack}
              className="h-[46px] w-[160px] rounded-lg border-none bg-[#4B4B4B] text-[14px] font-semibold text-white"
            >
              Back to Page
            </button>
          </div>
        </div>
      )}

    </div>
  );
}