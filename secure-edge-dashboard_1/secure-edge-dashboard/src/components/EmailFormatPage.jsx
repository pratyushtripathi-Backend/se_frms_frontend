import { useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import { emailFormatData } from "./EmailFormatData";

const TABLE_COLUMNS = [
  "ID",
  "Body Text",
  "Subject",
  "Template Code",
  "Channel",
  "Created By",
  "Created Date",
  "Updated At",
  "Status",
];

const YEAR_OPTIONS = ["2026", "2025", "2024", "2023"];
const TEMPLATE_CODE_OPTIONS = ["Forgot Password", "Welcome Email", "OTP Verification", "Account Locked"];
const CHANNEL_OPTIONS = ["Email", "SMS"];

function CreateEmailFormatModal({ onClose, onSubmit }) {
  const [templateCode, setTemplateCode] = useState("");
  const [channel, setChannel] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-[90%] max-w-[606px] rounded-[20px] bg-white p-10 shadow-2xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#202224]">
              Create Email Format
            </h3>
            <p className="mt-1 text-[13px] text-[#8A8A8A]">
              Fill all filed to Format
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white transition-colors hover:bg-[#2E2E33]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-6">

          {/* Template Code */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202224]">
              Template Code
            </label>

            <div className="relative">
              <select
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
                className="h-[50px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
              >
                <option value="" disabled>
                  Select Template Code
                </option>
                {TEMPLATE_CODE_OPTIONS.map((opt) => (
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

          {/* Channel */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202224]">
              Channel
            </label>

            <div className="relative">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="h-[50px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
              >
                <option value="" disabled>
                  Select Channel
                </option>
                {CHANNEL_OPTIONS.map((opt) => (
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

          {/* Subject */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202224]">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="h-[50px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202224]">
              Body Text
            </label>

            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter Message"
              rows={4}
              className="w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={() => onSubmit({ templateCode, channel, subject, bodyText })}
          className="mt-9 h-[48px] w-[140px] rounded-[10px] bg-[#4B5563] text-[14px] font-semibold text-white transition-colors hover:bg-[#374151]"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-[90%] max-w-[644px] rounded-[20px] bg-white px-10 py-16 text-center shadow-2xl">

        {/* Animated checkmark */}
        <div className="mx-auto mb-7 flex h-[100px] w-[100px] items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#111827"
              strokeWidth="5"
              pathLength="100"
              strokeLinecap="round"
              style={{
                strokeDasharray: 100,
                animation: "emailformat-draw 0.6s ease forwards",
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
                animation:
                  "emailformat-draw 0.45s ease forwards 0.5s, emailformat-fade 1.6s ease-in-out infinite 1.4s",
              }}
            />
          </svg>
        </div>

        <h3 className="text-[20px] font-semibold text-[#202224]">
          Created Successfully
        </h3>

        <p className="mt-2 text-[13px] text-[#7A7A7A]">
          The Email Format created successfully
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 h-[48px] rounded-[10px] bg-[#111827] px-8 text-[14px] font-semibold text-white transition-colors hover:bg-[#2E2E33]"
        >
          Back to Page
        </button>
      </div>

      <style>{`
        @keyframes emailformat-draw {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes emailformat-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function EmailFormatPage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const filteredData = useMemo(() => {
    return emailFormatData.filter((item) => {
      const [day, month, yr] = item.createdDate.split("-");
      const itemDate = new Date(`${yr}-${month}-${day}`);

      if (year && yr !== year) return false;

      if (fromDate && itemDate < new Date(fromDate)) return false;

      if (toDate && itemDate > new Date(toDate)) return false;

      return true;
    });
  }, [year, fromDate, toDate]);

  const handleSubmit = () => {
    setShowFormModal(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            Email Format Deatils
          </h2>

          <div className="flex items-center gap-3">

            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 w-[110px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] text-[#808080] outline-none"
              >
                <option value="">Year</option>
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
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

            {/* Create format */}
            <button
              type="button"
              onClick={() => setShowFormModal(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#FF0D0D] bg-white px-4 text-[13px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1]"
            >
              <span>Create format</span>
              <Plus size={16} strokeWidth={2.5} />
            </button>

          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1200px] border-collapse">

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
                    className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium align-top">
                      {item.id}
                    </td>

                    <td className="max-w-[220px] px-4 py-4 align-top leading-5">
                      {item.bodyText}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      {item.subject}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      {item.templateCode}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      {item.channel}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      {item.createdBy}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.createdDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.createdTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col leading-5">
                        <span className="font-medium text-[#2F80ED]">
                          {item.updatedDate}
                        </span>

                        <span className="text-[#27AE60]">
                          {item.updatedTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`font-semibold ${
                          item.status === "False"
                            ? "text-[#EB5757]"
                            : "text-[#2F80ED]"
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
      </div>
      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

      {/* Modals */}
      {showFormModal && (
        <CreateEmailFormatModal
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}

    </div>
  );
}