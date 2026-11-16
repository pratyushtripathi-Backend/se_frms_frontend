import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Plus,
  X,
  ChevronDown,
  Pencil,
  Maximize2,
} from "lucide-react";
import { getAuthErrorMessage } from "../../../auth/services/authError";
import {
  createEmailNotificationTemplate,
  getEmailNotificationTemplates,
  updateEmailNotificationTemplate,
  updateEmailNotificationTemplateStatus,
} from "../../services/adminEmployeeService";
import {
  createNotificationTemplate,
  getNotificationTemplates,
  updateNotificationTemplate,
} from "../../services/notificationService";
import DashboardStatusToggle from "../../components/DashboardStatusToggle";

import { openDashboardDatePicker } from "../../utils/dashboardDatePicker";
import { CONFIG_REFRESH_MS, useAutoRefresh } from "../../utils/useAutoRefresh";

const YEAR_OPTIONS = ["2026", "2025", "2024", "2023"];
// The only template codes the backend actually looks up when sending mail
// (MailServiceImpl: LOGIN_CREDENTIALS, LOGIN_OTP, PASSWORD_RESET). Any other
// code would be saved but never used.
const TEMPLATE_CODE_OPTIONS = ["LOGIN_CREDENTIALS", "LOGIN_OTP", "PASSWORD_RESET"];

// Pre-fill for the Forgot Password card's "Create format". POST
// /auth/forgot-password builds its reset email from the active
// PASSWORD_RESET template, substituting {{firstName}}, {{resetLink}} and
// {{minutes}} (the link is valid for 15 minutes).
const PASSWORD_RESET_TEMPLATE_DEFAULTS = {
  templateCode: "PASSWORD_RESET",
  channel: "EMAIL",
  subject: "FRMS Password Reset",
  bodyText:
    "Dear {{firstName}},\n\n" +
    "We received a request to reset your FRMS password.\n" +
    "Use the link below to set a new password. It is valid for {{minutes}} minutes.\n\n" +
    "{{resetLink}}\n\n" +
    "If you did not request this, you can ignore this email.\n\n" +
    "Regards,\nSecure Edge Fintech Pvt. Ltd.",
};
const CHANNEL_OPTIONS = ["EMAIL", "SMS"];
const FRAUD_DECISION_OPTIONS = ["Block", "Review"];
const NOTIFICATION_TEMPLATE_CODE_OPTIONS = ["Block_Alert", "Review_Alert"];

// Create form for the "Notification Review & Block Email format" cards.
// Same look as the Login/Forgot Password create form, plus a Fraud
// Decision field. Rendered through a portal into document.body so a
// transformed/overflow-hidden ancestor in the page layout can't push it
// off-screen (the cards sit low on the page, below the fold).
function CreateNotificationFormatModal({ defaults, isEdit = false, isSaving, onClose, onSubmit }) {
  const [fraudDecision, setFraudDecision] = useState(defaults?.fraudDecision ?? "");
  const [templateCode, setTemplateCode] = useState(defaults?.templateCode ?? "");
  const [channel, setChannel] = useState(
    String(defaults?.channel ?? "EMAIL").toUpperCase() === "SMS" ? "SMS" : "EMAIL",
  );
  const [subject, setSubject] = useState(defaults?.subject ?? "");
  const [bodyText, setBodyText] = useState(defaults?.bodyText ?? "");
  const [status, setStatus] = useState(
    defaults?.status === "False" || defaults?.status === "Inactive" ? "false" : "true",
  );

  const templateCodeOptions = Array.from(
    new Set([...(templateCode ? [templateCode] : []), ...NOTIFICATION_TEMPLATE_CODE_OPTIONS]),
  );

  const selectClass =
    "h-[40px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white px-3 pr-9 text-[13px] text-[#202224] outline-none disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]";
  const labelClass = "mb-1 block text-[13px] font-semibold text-[#202224]";
  const chevron = (
    <ChevronDown
      size={15}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
    />
  );

  return createPortal(
    <div
      className="frms-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
    >
      <div
        className="relative flex max-h-[85vh] w-[92%] max-w-[600px] flex-col overflow-hidden rounded-[16px] bg-white p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex shrink-0 items-start justify-between">
          <div>
            <h3 className="text-[18px] font-semibold text-[#202224]">
              {isEdit ? "Edit Notification Format" : "Create Notification Format"}
            </h3>
            <p className="mt-1 text-[13px] text-[#8A8A8A]">
              {isEdit ? "Update the subject and body text" : "Fill all field to Format"}
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
        <div className="-mr-2 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {/* Fraud Decision */}
            <div>
              <label className={labelClass}>Fraud Decision</label>
              <div className="relative">
                <select
                  value={fraudDecision}
                  onChange={(e) => setFraudDecision(e.target.value)}
                  disabled={isEdit}
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select Fraud Decision
                  </option>
                  {FRAUD_DECISION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {chevron}
              </div>
            </div>

            {/* Template Code */}
            <div>
              <label className={labelClass}>Template Code</label>
              <div className="relative">
                <select
                  value={templateCode}
                  onChange={(e) => setTemplateCode(e.target.value)}
                  disabled={isEdit}
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select Template Code
                  </option>
                  {templateCodeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {chevron}
              </div>
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className={labelClass}>Notification Type</label>
            <div className="relative">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                disabled={isEdit}
                className={selectClass}
              >
                {CHANNEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {chevron}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className={labelClass}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className={labelClass}>Body Text</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter Message"
              rows={8}
              className="min-h-[160px] w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] leading-5 text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isEdit}
                className={selectClass}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {chevron}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            onSubmit({
              fraudDecision,
              templateCode,
              channel,
              subject,
              bodyText,
              status: status === "true",
            })
          }
          className="mt-6 h-[40px] w-[120px] shrink-0 rounded-[8px] bg-[#4B5563] text-[13px] font-semibold text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : isEdit ? "Update" : "Submit"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

// Static placeholder content for the Notification Review/Block cards, per the
// updated Figma design. matchKeywords is how a real template returned by
// GET /notification-templates gets matched back to the right card (by its
// templateCode), the same way the Login/Forgot Password cards below match
// on their own templateCode.
const NOTIFICATION_CARDS = [
  {
    key: "block",
    matchKeywords: ["block"],
    title: "Notification Review & Block Email format",
    fraudDecision: "Block",
    templateCode: "Block_Alert",
    notificationType: "Email",
    subject: "Block Alert High-Risk Transaction Detected",
    bodyText:
      "Lorem Ipsum has been the industry's standard dummy text ever since 1500, Lorem Ipsum has been the industry's standard dummy text ever since 1500.",
    status: "Active",
    createdBy: "Admin",
    createdDate: "12-05-2025",
    createdTime: "11:30 AM",
    updatedDate: "12-05-2025",
    updatedTime: "11:30 AM",
  },
  {
    key: "review",
    matchKeywords: ["review"],
    title: "Notification Review & Block Email format",
    fraudDecision: "Review",
    templateCode: "Review_Alert",
    notificationType: "Email",
    subject: "Review Alert High-Risk Transaction Detected",
    bodyText:
      "Lorem Ipsum has been the industry's standard dummy text ever since 1500, Lorem Ipsum has been the industry's standard dummy text ever since 1500.",
    status: "Active",
    createdBy: "Admin",
    createdDate: "12-05-2025",
    createdTime: "11:30 AM",
    updatedDate: "12-05-2025",
    updatedTime: "11:30 AM",
  },
];

// Template lists already loaded on this page, kept across visits (the page
// unmounts when you leave it), so the cards show instantly when you come back
// and then refresh quietly. The requests take no inputs, so one entry each.
// Cleared before the reloads that follow a create/edit, and on a status
// toggle (which doesn't reload), so a revisit never shows an old value.
const emailTemplatesCache = { current: null };
const notificationTemplatesCache = { current: null };

function CreateEmailFormatModal({ initialValues, createDefaults, isSaving, onClose, onSubmit }) {
  const seedValues = initialValues ?? createDefaults ?? null;
  const [templateCode, setTemplateCode] = useState(seedValues?.templateCode ?? "");
  const [channel, setChannel] = useState(seedValues?.channel ?? "");
  const [subject, setSubject] = useState(seedValues?.subject ?? "");
  const [bodyText, setBodyText] = useState(seedValues?.bodyText ?? "");
  const [status, setStatus] = useState(
    seedValues?.status === "False" || seedValues?.status === "Inactive"
      ? "false"
      : "true",
  );
  const templateCodeOptions = Array.from(
    new Set([
      ...(templateCode ? [templateCode] : []),
      ...TEMPLATE_CODE_OPTIONS,
    ]),
  );

  return createPortal(
    <div className="frms-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="relative flex max-h-[85vh] w-[92%] max-w-[600px] flex-col overflow-hidden rounded-[16px] bg-white p-7 shadow-2xl">

        {/* Header */}
        <div className="mb-5 flex shrink-0 items-start justify-between">
          <div>
            <h3 className="text-[18px] font-semibold text-[#202224]">
              {initialValues ? "Edit Email Format" : "Create Email Format"}
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
        <div className="-mr-2 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pr-2">

          {/* Template Code */}
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#202224]">
              Template Code
            </label>

            <div className="relative">
              <select
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white px-3 pr-9 text-[13px] text-[#202224] outline-none"
              >
                <option value="" disabled>
                  Select Template Code
                </option>
                {templateCodeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#202224]">
              Channel
            </label>

            <div className="relative">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white px-3 pr-9 text-[13px] text-[#202224] outline-none"
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
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#202224]">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#202224]">
              Body Text
            </label>

            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter Message"
              rows={8}
              className="min-h-[160px] w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] leading-5 text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#202224]">
              Status
            </label>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white px-3 pr-9 text-[13px] text-[#202224] outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            onSubmit({
              bodyText,
              channel,
              status: status === "true",
              subject,
              templateCode,
            })
          }
          className="mt-6 h-[40px] w-[120px] shrink-0 rounded-[8px] bg-[#4B5563] text-[13px] font-semibold text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : initialValues ? "Update" : "Submit"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function SuccessModal({ message, onClose }) {
  const displayMessage = String(
    message || "Email template saved successfully.",
  ).toUpperCase();

  return createPortal(
    <div className="frms-modal-overlay fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-[92%] max-w-[480px] rounded-[16px] bg-white px-8 py-10 text-center shadow-2xl">

        {/* Animated checkmark */}
        <div className="mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center">
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

        <h3 className="mx-auto max-w-[380px] text-[17px] font-bold uppercase leading-6 text-[#202224]">
          {displayMessage}
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-[40px] rounded-[8px] bg-[#111827] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#2E2E33]"
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
    </div>,
    document.body,
  );
}

function TemplateDetailModal({ template, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const displayFields = template.extraRow
    ? [...template.fieldsRow, template.extraRow]
    : template.fieldsRow;
  return createPortal(
    <div
      className="frms-modal-overlay fixed inset-y-0 left-[225px] right-0 z-[10000] flex items-center justify-center bg-black/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="email-template-detail-title"
        aria-modal="true"
        className="max-h-[92vh] w-[92vw] max-w-[1700px] overflow-y-auto rounded-[12px] bg-[#FBFBFB] shadow-[0_12px_24px_rgba(0,0,0,0.28)]"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="sticky top-0 z-10 flex min-h-[104px] flex-wrap items-center justify-between gap-4 border-b border-[#E1E1E1] bg-[#FBFBFB] px-8 py-5">
          <h2 id="email-template-detail-title" className="text-[14px] font-semibold tracking-[0.01em] text-[#111111]">
              {template.title}
          </h2>

          <div className="flex shrink-0 items-center gap-4">
            {template.showEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  template.onEdit?.();
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[#0A50B9] bg-white px-3.5 text-[12px] font-medium text-[#0A50B9] transition-colors hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A50B9]"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                template.onCreate?.();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[#F62B1A] bg-white px-3.5 text-[12px] font-medium text-[#F62B1A] transition-colors hover:bg-[#FFF1F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F62B1A]"
            >
              <Plus size={13} strokeWidth={2.5} />
              Create format
            </button>
            <button
              type="button"
              aria-label="Close email template details"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-[5px] border border-[#AFAFAF] bg-white text-black transition-colors hover:bg-[#F3F4F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A50B9]"
            >
              <Maximize2 size={19} strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="px-8 py-9">
          <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-7">
            {displayFields.map((field) => (
              <div key={field.label} className="min-w-0">
                <p className="mb-1 text-[13px] font-semibold text-[#111111]">{field.label}</p>
                <p className="break-words text-[13px] font-medium text-[#5D5D5D]">{field.value}</p>
              </div>
            ))}
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[#303030]">Status</p>
              <DashboardStatusToggle status={template.status} />
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-[#303030]">Created By</p>
              <p className="break-words text-[13px] text-[#5D5D5D]">{template.createdBy}</p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-[#303030]">Created date</p>
              <p className="text-[13px] font-medium text-[#2582DA]">{template.createdDate}</p>
              <p className="text-[13px] text-[#11943D]">{template.createdTime}</p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-[#303030]">Updated At</p>
              <p className="text-[13px] font-medium text-[#2582DA]">{template.updatedDate}</p>
              <p className="text-[13px] text-[#11943D]">{template.updatedTime}</p>
            </div>
          </div>

          <div className="mt-7 border-t border-[#E1E1E1] pt-8">
            <p className="mb-1 text-[18px] font-semibold text-[#111111]">Body Text</p>
            <p className="whitespace-pre-wrap break-words text-[16px] leading-[1.65] text-[#5D5D5D]">
              {template.bodyText}
            </p>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function EmailFormatCard({
  title,
  fieldsRow,
  extraRow,
  bodyText,
  status,
  onToggleStatus,
  createdBy,
  createdDate,
  createdTime,
  updatedDate,
  updatedTime,
  showEdit = true,
  onEdit,
  onCreate,
  onExpand,
  isLoading = false,
}) {
  const displayFields = extraRow ? [...fieldsRow, extraRow] : fieldsRow;
  const detailGridColumns = extraRow
    ? "lg:grid-cols-[minmax(100px,0.85fr)_minmax(110px,0.95fr)_minmax(95px,0.8fr)_minmax(150px,1.2fr)_minmax(220px,2fr)_minmax(82px,0.72fr)_minmax(82px,0.72fr)_minmax(96px,0.8fr)_minmax(96px,0.8fr)]"
    : fieldsRow.length === 2
      ? "lg:grid-cols-[minmax(150px,1.25fr)_minmax(130px,1.1fr)_minmax(250px,2.25fr)_minmax(84px,0.75fr)_minmax(90px,0.78fr)_minmax(102px,0.9fr)_minmax(102px,0.9fr)]"
      : "lg:grid-cols-[minmax(150px,1.25fr)_minmax(130px,1.1fr)_minmax(80px,0.65fr)_minmax(250px,2.25fr)_minmax(84px,0.75fr)_minmax(90px,0.78fr)_minmax(102px,0.9fr)_minmax(102px,0.9fr)]";

  return (
    <article className="overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-[#FBFBFB]">
      <header className="flex min-h-[70px] flex-wrap items-center justify-between gap-3 border-b border-[#E4E4E4] px-5 py-4 lg:px-6">
        <h3 className="text-[14px] font-semibold tracking-[0.02em] text-[#111827]">{title}</h3>

        <div className="flex items-center gap-2">
          {showEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[#0A50B9] bg-white px-3.5 text-[13px] font-medium text-[#0A50B9] transition-colors hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A50B9]"
            >
              <Pencil size={13} />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[#F62B1A] bg-white px-3.5 text-[13px] font-medium text-[#F62B1A] transition-colors hover:bg-[#FFF1F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F62B1A]"
          >
            <Plus size={13} strokeWidth={2.5} />
            Create format
          </button>

          <button
            type="button"
            aria-label="Open email template details"
            onClick={() => onExpand?.({
              title,
              fieldsRow,
              extraRow,
              bodyText,
              status,
              createdBy,
              createdDate,
              createdTime,
              updatedDate,
              updatedTime,
              showEdit,
              onEdit,
              onCreate,
            })}
            className="grid h-10 w-10 place-items-center rounded-[5px] border border-[#AFAFAF] bg-white text-black transition-colors hover:bg-[#F3F4F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A50B9]"
          >
            <Maximize2 size={19} strokeWidth={2} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid min-h-[190px] place-items-center px-5 py-8">
          <span className="text-[13px] text-[#9CA3AF]">Loading template...</span>
        </div>
      ) : (
        <div className={`grid gap-x-5 gap-y-6 px-6 py-9 sm:grid-cols-2 ${detailGridColumns}`}>
          {displayFields.map((field) => (
            <div key={field.label} className="min-w-0">
              <p className="mb-1 text-[14px] font-semibold tracking-[0.01em] text-[#111111]">{field.label}</p>
              <p className="truncate text-[14px] font-medium text-[#5D5D5D]" title={field.value}>
                {field.value}
              </p>
            </div>
          ))}

          <div className="min-w-0">
            <p className="mb-1 text-[14px] font-semibold tracking-[0.01em] text-[#111111]">Body Text</p>
            <p className="line-clamp-4 text-[14px] leading-5 text-[#5D5D5D]" title={bodyText}>
              {bodyText}
            </p>
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-[14px] font-semibold tracking-[0.01em] text-[#303030]">Status</p>
            <DashboardStatusToggle onToggle={onToggleStatus} status={status} />
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-[14px] font-semibold tracking-[0.01em] text-[#303030]">Created By</p>
            <p className="text-[14px] leading-5 text-[#5D5D5D] [overflow-wrap:anywhere]" title={createdBy}>
              {createdBy}
            </p>
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-[14px] font-semibold tracking-[0.01em] text-[#303030]">Created date</p>
            <div className="flex flex-col text-[14px] leading-5">
              <span className="font-medium text-[#2582DA]">{createdDate}</span>
              <span className="text-[#11943D]">{createdTime}</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-[14px] font-semibold tracking-[0.01em] text-[#303030]">Updated At</p>
            <div className="flex flex-col text-[14px] leading-5">
              <span className="font-medium text-[#2582DA]">{updatedDate}</span>
              <span className="text-[#11943D]">{updatedTime}</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function EmailFormatPage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [emailTemplates, setEmailTemplates] = useState(
    () => emailTemplatesCache.current ?? [],
  );
  // Start true when nothing is cached, so the first paint shows "Loading…"
  // rather than flashing empty/placeholder values.
  const [isLoading, setIsLoading] = useState(() => !emailTemplatesCache.current);
  const [notificationTemplates, setNotificationTemplates] = useState(
    () => notificationTemplatesCache.current ?? [],
  );
  const [isLoadingNotificationTemplates, setIsLoadingNotificationTemplates] = useState(
    () => !notificationTemplatesCache.current,
  );
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  // Defaults for the Notification Review/Block create form (null = closed).
  const [notificationFormDefaults, setNotificationFormDefaults] = useState(null);
  // Pre-fill for the Login/Forgot Password create form (null = empty form).
  const [emailCreateDefaults, setEmailCreateDefaults] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  // Drop responses from an older load (e.g. the initial load finishing after
  // the reload that follows a create/edit), so stale data can't overwrite
  // newer data.
  const loadRequestIdRef = useRef(0);
  const notificationLoadRequestIdRef = useRef(0);

  async function loadEmailTemplates() {
    const requestId = ++loadRequestIdRef.current;
    const cached = emailTemplatesCache.current;

    if (cached) {
      setEmailTemplates(cached);
      setIsLoading(false);
    } else {
      // Any cards already on screen stay visible until the new data arrives.
      setIsLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await getEmailNotificationTemplates();
      const templates = normalizeEmailTemplateResponse(response.data);

      if (requestId !== loadRequestIdRef.current) return;

      emailTemplatesCache.current = templates;
      setEmailTemplates(templates);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return;
      // Keep showing the cached templates if a background refresh fails.
      if (cached) return;

      setEmailTemplates([]);
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to load email templates. Please try again.",
        ),
      );
    } finally {
      if (requestId === loadRequestIdRef.current) setIsLoading(false);
    }
  }

  async function loadNotificationTemplates() {
    const requestId = ++notificationLoadRequestIdRef.current;
    const cached = notificationTemplatesCache.current;

    if (cached) {
      setNotificationTemplates(cached);
      setIsLoadingNotificationTemplates(false);
    } else {
      setIsLoadingNotificationTemplates(true);
    }

    try {
      const response = await getNotificationTemplates();
      const templates = normalizeEmailTemplateResponse(response.data);

      if (requestId !== notificationLoadRequestIdRef.current) return;

      notificationTemplatesCache.current = templates;
      setNotificationTemplates(templates);
    } catch (error) {
      if (requestId !== notificationLoadRequestIdRef.current) return;
      // Keep showing the cached templates if a background refresh fails.
      if (cached) return;

      // Non-fatal: the Notification Review/Block cards just keep showing
      // their placeholder values when this list can't be loaded.
      setNotificationTemplates([]);
    } finally {
      if (requestId === notificationLoadRequestIdRef.current) {
        setIsLoadingNotificationTemplates(false);
      }
    }
  }

  useEffect(() => {
    loadNotificationTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadEmailTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh: picks up templates changed by another admin.
  useAutoRefresh(
    () => Promise.all([loadEmailTemplates(), loadNotificationTemplates()]),
    { intervalMs: CONFIG_REFRESH_MS },
  );

  const loginCredentialTemplate = useMemo(
    () =>
      emailTemplates.find((item) =>
        matchesTemplateType(item.templateCode, ["logincredential", "loginotp", "login"]),
      ) ?? null,
    [emailTemplates],
  );

  const forgotPasswordTemplate = useMemo(
    () =>
      emailTemplates.find((item) =>
        // Backend code is PASSWORD_RESET (used by POST /auth/forgot-password).
        matchesTemplateType(item.templateCode, ["passwordreset", "resetpassword", "forgotpassword", "forgot"]),
      ) ?? null,
    [emailTemplates],
  );

  // The backend identifies these templates by fraudDecision (BLOCK/REVIEW);
  // templateCode is only a fallback in case the response carries one.
  const findNotificationTemplate = (decision) =>
    notificationTemplates.find(
      (item) => String(item.fraudDecision ?? "").toUpperCase() === decision,
    ) ??
    notificationTemplates.find((item) =>
      matchesTemplateType(item.templateCode, [decision.toLowerCase()]),
    ) ??
    null;

  const blockNotificationTemplate = useMemo(
    () => findNotificationTemplate("BLOCK"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notificationTemplates],
  );

  const reviewNotificationTemplate = useMemo(
    () => findNotificationTemplate("REVIEW"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notificationTemplates],
  );

  const NOTIFICATION_CARD_TEMPLATES = {
    block: blockNotificationTemplate,
    review: reviewNotificationTemplate,
  };

  const handleSubmit = async (formValues) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!formValues.templateCode || !formValues.channel || !formValues.subject) {
      setErrorMessage("Template code, channel, and subject are required.");
      return;
    }

    setIsSavingTemplate(true);

    try {
      if (!editingTemplate) {
        const payload = {
          body: formValues.bodyText,
          channel: formValues.channel,
          status: formValues.status,
          subject: formValues.subject,
          templateCode: formValues.templateCode,
        };
        const response = await createEmailNotificationTemplate(payload);

        setEditingTemplate(null);
        setShowFormModal(false);
        setSuccessMessage(
          response.data?.responseMessage ||
            "Email template created successfully.",
        );
        setShowSuccessModal(true);
        emailTemplatesCache.current = null;
        await loadEmailTemplates();
        return;
      }

      const payload = buildEmailTemplatePayload(editingTemplate, {
        body: formValues.bodyText,
        channel: formValues.channel,
        status: formValues.status,
        subject: formValues.subject,
        templateCode: formValues.templateCode,
      });
      const response = await updateEmailNotificationTemplate(
        editingTemplate.templateCode,
        payload,
      );

      setEditingTemplate(null);
      setShowFormModal(false);
      setSuccessMessage(
        response.data?.responseMessage || "Email template updated successfully.",
      );
      setShowSuccessModal(true);
      emailTemplatesCache.current = null;
      await loadEmailTemplates();
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to update email template. Please try again.",
        ),
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // POST /api/v1/notification-templates — Notification Review & Block
  // Email format "Create format" form.
  const handleNotificationSubmit = async (formValues) => {
    setErrorMessage("");
    setSuccessMessage("");

    const editingTemplateId = notificationFormDefaults?.editingTemplateId ?? null;

    // Backend: subjectTemplate and bodyTemplate are @NotBlank on both create
    // and update; fraudDecision is @NotBlank on create.
    if (!formValues.subject?.trim() || !formValues.bodyText?.trim()) {
      setErrorMessage("Subject and body text are required.");
      return;
    }

    if (!editingTemplateId && !formValues.fraudDecision) {
      setErrorMessage("Fraud decision is required.");
      return;
    }

    setIsSavingTemplate(true);

    try {
      // Edit: PATCH /notification-templates/{templateId} only updates the
      // subject and body, with the field names the backend expects.
      const response = editingTemplateId
        ? await updateNotificationTemplate(editingTemplateId, {
            subjectTemplate: formValues.subject,
            bodyTemplate: formValues.bodyText,
          })
        : // CreateNotificationTemplateRequest(fraudDecision, subjectTemplate,
          // bodyTemplate, status). fraudDecision must be BLOCK or REVIEW;
          // the backend fixes the channel to EMAIL itself.
          await createNotificationTemplate({
            fraudDecision: String(formValues.fraudDecision).toUpperCase(),
            subjectTemplate: formValues.subject,
            bodyTemplate: formValues.bodyText,
            status: formValues.status,
          });

      setNotificationFormDefaults(null);
      setSuccessMessage(
        response.data?.responseMessage ||
          (editingTemplateId
            ? "Notification template updated successfully."
            : "Notification template created successfully."),
      );
      setShowSuccessModal(true);
      notificationTemplatesCache.current = null;
      await loadNotificationTemplates();
    } catch (error) {
      setNotificationFormDefaults(null);
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to save notification template. Please try again.",
        ),
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleOpenCreateFormat = (defaults = null) => {
    setEditingTemplate(null);
    setEmailCreateDefaults(defaults);
    setErrorMessage("");
    setSuccessMessage("");
    setShowFormModal(true);
  };

  const handleOpenNotificationCreate = (card) => {
    setErrorMessage("");
    setSuccessMessage("");
    setNotificationFormDefaults({
      fraudDecision: card.fraudDecision,
      templateCode: card.templateCode,
      channel: "EMAIL",
      subject: card.subject,
      bodyText: "",
    });
  };

  // Edit opens the same form pre-filled with the saved template. If this
  // card has no saved template yet, there's nothing to update, so it opens
  // pre-filled from the card and saves as a new one instead.
  const handleOpenNotificationEdit = (card) => {
    const template = NOTIFICATION_CARD_TEMPLATES[card.key];

    setErrorMessage("");
    setSuccessMessage("");
    setNotificationFormDefaults({
      fraudDecision: card.fraudDecision,
      templateCode: template?.templateCode ?? card.templateCode,
      channel: template?.channel ?? "EMAIL",
      subject: template?.subject ?? card.subject,
      bodyText: template && template.bodyText !== "-" ? template.bodyText : "",
      status: template?.status,
      editingTemplateId: template?.templateId ?? null,
    });
  };

  const handleEditTemplate = (item) => {
    if (!item) return;

    setEditingTemplate(item);
    setErrorMessage("");
    setSuccessMessage("");
    setShowFormModal(true);
  };

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pt-3 lg:px-7">

      <section className="min-h-[calc(100vh-140px)] bg-white">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center justify-end gap-3">

            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-[37px] w-[105px] appearance-none rounded-[8px] border border-[#D9D9D966] bg-white pl-3 pr-8 text-[13px] font-medium text-[#363636] outline-none transition-colors focus:border-[#0A50B9]"
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
                onClick={(event) => openDashboardDatePicker(fromInputRef.current, event.currentTarget)}
                className="flex h-[37px] w-[171px] items-center justify-between rounded-[8px] border border-[#D9D9D966] bg-white px-3 text-[14px] text-[#8B8B8B] transition-colors hover:border-[#B8CDE9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A50B9]"
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
                onClick={(event) => openDashboardDatePicker(toInputRef.current, event.currentTarget)}
                className="flex h-[37px] w-[171px] items-center justify-between rounded-[8px] border border-[#D9D9D966] bg-white px-3 text-[14px] text-[#8B8B8B] transition-colors hover:border-[#B8CDE9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A50B9]"
              >
                <span>{toDate || "To"}</span>
                <CalendarDays size={15} />
              </button>
            </>

          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-[#FEF3F2] px-4 py-3 text-[13px] font-semibold text-[#D92D20]">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-[#ECFDF3] px-4 py-3 text-[13px] font-semibold text-[#027A48]">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* Login Credential — live API */}
          <EmailFormatCard
            title="Login & Forgot Password Email Format"
            fieldsRow={[
              // `subject` is normalized from the email-template API response
              // (including subjectTemplate/templateSubject fallbacks).
              { label: "Subject", value: loginCredentialTemplate?.subject ?? "-" },
              { label: "Template Code", value: loginCredentialTemplate?.templateCode ?? "-" },
            ]}
            bodyText={loginCredentialTemplate?.bodyText ?? "-"}
            status={loginCredentialTemplate?.status}
            onToggleStatus={
              loginCredentialTemplate
                ? (nextStatus) => {
                    // No reload follows a toggle, so drop the cached list
                    // rather than show the old status on the next visit.
                    emailTemplatesCache.current = null;
                    return updateEmailNotificationTemplateStatus(
                      loginCredentialTemplate.templateCode,
                      nextStatus,
                    );
                  }
                : undefined
            }
            createdBy={loginCredentialTemplate?.createdBy ?? "-"}
            createdDate={loginCredentialTemplate?.createdDate ?? "-"}
            createdTime={loginCredentialTemplate?.createdTime ?? "-"}
            updatedDate={loginCredentialTemplate?.updatedDate ?? "-"}
            updatedTime={loginCredentialTemplate?.updatedTime ?? "-"}
            showEdit={Boolean(loginCredentialTemplate)}
            onEdit={() => handleEditTemplate(loginCredentialTemplate)}
            onCreate={() => handleOpenCreateFormat()}
            onExpand={setExpandedTemplate}
            isLoading={isLoading && emailTemplates.length === 0}
          />

          {/* Forgot Password — live API */}
          <EmailFormatCard
            title="Login & Forgot Password Email Format"
            fieldsRow={[
              // `subject` is normalized from the email-template API response
              // (including subjectTemplate/templateSubject fallbacks).
              { label: "Subject", value: forgotPasswordTemplate?.subject ?? "-" },
              { label: "Template Code", value: forgotPasswordTemplate?.templateCode ?? "-" },
            ]}
            bodyText={forgotPasswordTemplate?.bodyText ?? "-"}
            status={forgotPasswordTemplate?.status}
            onToggleStatus={
              forgotPasswordTemplate
                ? (nextStatus) => {
                    // No reload follows a toggle, so drop the cached list
                    // rather than show the old status on the next visit.
                    emailTemplatesCache.current = null;
                    return updateEmailNotificationTemplateStatus(
                      forgotPasswordTemplate.templateCode,
                      nextStatus,
                    );
                  }
                : undefined
            }
            createdBy={forgotPasswordTemplate?.createdBy ?? "-"}
            createdDate={forgotPasswordTemplate?.createdDate ?? "-"}
            createdTime={forgotPasswordTemplate?.createdTime ?? "-"}
            updatedDate={forgotPasswordTemplate?.updatedDate ?? "-"}
            updatedTime={forgotPasswordTemplate?.updatedTime ?? "-"}
            showEdit={Boolean(forgotPasswordTemplate)}
            onEdit={() => handleEditTemplate(forgotPasswordTemplate)}
            onCreate={() => handleOpenCreateFormat(PASSWORD_RESET_TEMPLATE_DEFAULTS)}
            onExpand={setExpandedTemplate}
            isLoading={isLoading && emailTemplates.length === 0}
          />

          {/* Notification Review / Block — now backed by
              GET/POST /notification-templates */}
          {NOTIFICATION_CARDS.map((card) => {
            const matchedTemplate = NOTIFICATION_CARD_TEMPLATES[card.key];

            return (
              <EmailFormatCard
                key={card.key}
                title={card.title}
                fieldsRow={[
                  { label: "Fraud Decision", value: card.fraudDecision },
                  {
                    label: "Template Code",
                    value:
                      matchedTemplate?.templateCode && matchedTemplate.templateCode !== "-"
                        ? matchedTemplate.templateCode
                        : card.templateCode,
                  },
                  { label: "Subject", value: matchedTemplate?.subject ?? card.subject },
                ]}
                bodyText={matchedTemplate?.bodyText ?? card.bodyText}
                status={matchedTemplate?.status ?? card.status}
                createdBy={matchedTemplate?.createdBy ?? card.createdBy}
                createdDate={matchedTemplate?.createdDate ?? card.createdDate}
                createdTime={matchedTemplate?.createdTime ?? card.createdTime}
                updatedDate={matchedTemplate?.updatedDate ?? card.updatedDate}
                updatedTime={matchedTemplate?.updatedTime ?? card.updatedTime}
                showEdit
                onEdit={() => handleOpenNotificationEdit(card)}
                onCreate={() => handleOpenNotificationCreate(card)}
                onExpand={setExpandedTemplate}
                isLoading={
                  isLoadingNotificationTemplates && notificationTemplates.length === 0
                }
              />
            );
          })}

        </div>

      </section>

      {/* Modals */}
      {showFormModal && (
        <CreateEmailFormatModal
          initialValues={editingTemplate}
          createDefaults={emailCreateDefaults}
          isSaving={isSavingTemplate}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {notificationFormDefaults && (
        <CreateNotificationFormatModal
          defaults={notificationFormDefaults}
          isEdit={Boolean(notificationFormDefaults.editingTemplateId)}
          isSaving={isSavingTemplate}
          onClose={() => setNotificationFormDefaults(null)}
          onSubmit={handleNotificationSubmit}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {expandedTemplate && (
        <TemplateDetailModal
          template={expandedTemplate}
          onClose={() => setExpandedTemplate(null)}
        />
      )}

    </div>
  );
}

function matchesTemplateType(templateCode, keywords) {
  const normalized = String(templateCode || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  return keywords.some((keyword) => normalized.includes(keyword));
}

function normalizeEmailTemplateResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  return findFirstArray(payload)
    .map(normalizeEmailTemplateRow)
    .filter(Boolean);
}

function normalizeEmailTemplateRow(item, index) {
  if (!item || typeof item !== "object") return null;

  const createdAt = item.createdAt ?? item.createdDate ?? item.createdOn;
  const updatedAt = item.updatedAt ?? item.updatedDate ?? item.updatedOn;

  return {
    id: item.id ?? item.templateId ?? item.emailTemplateId ?? index + 1,
    // The backend's real id (no index fallback) — used as {templateId} in
    // PATCH /notification-templates/{templateId}.
    templateId: item.templateId ?? item.id ?? item.notificationTemplateId ?? null,
    fraudDecision: item.fraudDecision ?? null,
    createdDateRaw: item.createdDate ?? null,
    updatedAtRaw: item.updatedAt ?? item.updatedDate ?? null,
    bodyText:
      item.bodyText ??
      item.bodyTemplate ??
      item.body ??
      item.templateBody ??
      item.message ??
      "-",
    subject: item.subject ?? item.subjectTemplate ?? item.templateSubject ?? "-",
    templateCode:
      item.templateCode ??
      item.code ??
      item.notificationType ??
      item.templateName ??
      "-",
    channel: item.channel ?? item.channelType ?? "Email",
    createdBy: item.createdBy ?? item.createdByName ?? "-",
    createdDate: formatDatePart(createdAt),
    createdTime: formatTimePart(createdAt),
    updatedDate: formatDatePart(updatedAt),
    updatedTime: formatTimePart(updatedAt),
    status: formatEmailTemplateStatus(item.status),
  };
}

function buildEmailTemplatePayload(template, overrides = {}) {
  return {
    id: template.id,
    templateCode: template.templateCode,
    channel: template.channel,
    subject: template.subject,
    body: template.bodyText,
    status: template.status !== "False" && template.status !== "Inactive",
    createdBy: template.createdBy === "-" ? null : template.createdBy,
    createdDate: template.createdDateRaw,
    updatedAt: template.updatedAtRaw,
    ...overrides,
  };
}

function formatEmailTemplateStatus(status) {
  if (status === null || status === undefined || status === "") return "-";
  if (typeof status === "boolean") return status ? "True" : "False";

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
    "templates",
    "emailTemplates",
    "notificationTemplates",
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

  return hasEmailTemplateIdentity(value) ? [value] : [];
}

function hasEmailTemplateIdentity(item) {
  return Boolean(
    item?.id ||
      item?.templateId ||
      item?.emailTemplateId ||
      item?.templateCode ||
      item?.subject ||
      item?.subjectTemplate ||
      item?.bodyText,
  );
}
