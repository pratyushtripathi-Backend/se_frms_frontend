import { useEffect, useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  X,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createEmailNotificationTemplate,
  getEmailNotificationTemplates,
  updateEmailNotificationTemplate,
  updateEmailNotificationTemplateStatus,
} from "../services/adminEmployeeService";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";

const YEAR_OPTIONS = ["2026", "2025", "2024", "2023"];
const TEMPLATE_CODE_OPTIONS = ["LOGIN_OTP", "Forgot Password", "Welcome Email", "OTP Verification", "Account Locked"];
const CHANNEL_OPTIONS = ["EMAIL", "SMS"];

// Static placeholder content for the Notification Review/Block cards, per the
// updated Figma design. The API for these will be wired up separately later.
const NOTIFICATION_CARDS = [
  {
    key: "block",
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

function CreateEmailFormatModal({ initialValues, isSaving, onClose, onSubmit }) {
  const [templateCode, setTemplateCode] = useState(initialValues?.templateCode ?? "");
  const [channel, setChannel] = useState(initialValues?.channel ?? "");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [bodyText, setBodyText] = useState(initialValues?.bodyText ?? "");
  const [status, setStatus] = useState(
    initialValues?.status === "False" || initialValues?.status === "Inactive"
      ? "false"
      : "true",
  );
  const templateCodeOptions = Array.from(
    new Set([
      ...(templateCode ? [templateCode] : []),
      ...TEMPLATE_CODE_OPTIONS,
    ]),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-[90%] max-w-[960px] rounded-[20px] bg-white p-12 shadow-2xl">

        {/* Header */}
        <div className="mb-9 flex items-start justify-between">
          <div>
            <h3 className="text-[22px] font-semibold text-[#202224]">
              {initialValues ? "Edit Email Format" : "Create Email Format"}
            </h3>
            <p className="mt-1.5 text-[14px] text-[#8A8A8A]">
              Fill all filed to Format
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-white transition-colors hover:bg-[#2E2E33]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-5">

          {/* Template Code */}
          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#202224]">
              Template Code
            </label>

            <div className="relative">
              <select
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
                className="h-[48px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
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
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
              />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#202224]">
              Channel
            </label>

            <div className="relative">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="h-[48px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
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
            <label className="mb-1.5 block text-[14px] font-semibold text-[#202224]">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="h-[48px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#202224] outline-none placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#202224]">
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

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#202224]">
              Status
            </label>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-[48px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] text-[#202224] outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
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
          className="mt-8 h-[48px] w-[140px] rounded-[10px] bg-[#4B5563] text-[14px] font-semibold text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : initialValues ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ message, onClose }) {
  const displayMessage = String(
    message || "Email template saved successfully.",
  ).toUpperCase();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-[90%] max-w-[900px] rounded-[20px] bg-white px-10 py-20 text-center shadow-2xl">

        {/* Animated checkmark */}
        <div className="mx-auto mb-8 flex h-[140px] w-[140px] items-center justify-center">
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

        <h3 className="mx-auto max-w-[520px] text-[24px] font-bold uppercase leading-8 text-[#202224]">
          {displayMessage}
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="mt-9 h-[48px] rounded-[10px] bg-[#111827] px-8 text-[15px] font-semibold text-white transition-colors hover:bg-[#2E2E33]"
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
  isLoading = false,
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-[#202224]">{title}</h3>

        <div className="flex items-center gap-2">
          {showEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-[#2F80ED] px-3 text-[12px] font-semibold text-[#2F80ED] transition-colors hover:bg-[#EFF6FF]"
            >
              Edit
              <Pencil size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={onCreate}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#FF0D0D] px-3 text-[12px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1]"
          >
            Create format
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-[13px] text-[#9CA3AF]">Loading...</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            {fieldsRow.map((field) => (
              <div key={field.label} className="min-w-0">
                <p className="mb-1 text-[12px] text-[#9CA3AF]">{field.label}</p>
                <p className="truncate text-[13px] font-medium text-[#202224]">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          {extraRow && (
            <div className="mb-4">
              <p className="mb-1 text-[12px] text-[#9CA3AF]">{extraRow.label}</p>
              <p className="text-[13px] font-medium text-[#202224]">
                {extraRow.value}
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-1 text-[12px] text-[#9CA3AF]">Body Text</p>
            <p className="text-[13px] leading-5 text-[#4B5563]">{bodyText}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 border-t border-[#F1F1F1] pt-4">
            <div>
              <p className="mb-1 text-[12px] text-[#9CA3AF]">Status</p>
              <DashboardStatusToggle onToggle={onToggleStatus} status={status} />
            </div>

            <div>
              <p className="mb-1 text-[12px] text-[#9CA3AF]">Created By</p>
              <p className="text-[13px] text-[#4B5563]">{createdBy}</p>
            </div>

            <div>
              <p className="mb-1 text-[12px] text-[#9CA3AF]">Created date</p>
              <div className="flex flex-col text-[13px] leading-5">
                <span className="font-medium text-[#2F80ED]">{createdDate}</span>
                <span className="text-[#27AE60]">{createdTime}</span>
              </div>
            </div>

            <div>
              <p className="mb-1 text-[12px] text-[#9CA3AF]">Updated At</p>
              <div className="flex flex-col text-[13px] leading-5">
                <span className="font-medium text-[#2F80ED]">{updatedDate}</span>
                <span className="text-[#27AE60]">{updatedTime}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function EmailFormatPage() {
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  async function loadEmailTemplates() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getEmailNotificationTemplates();
      const templates = normalizeEmailTemplateResponse(response.data);

      setEmailTemplates(templates);
    } catch (error) {
      setEmailTemplates([]);
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to load email templates. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadInitialTemplates() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getEmailNotificationTemplates();
        const templates = normalizeEmailTemplateResponse(response.data);

        if (isActive) setEmailTemplates(templates);
      } catch (error) {
        if (isActive) {
          setEmailTemplates([]);
          setErrorMessage(
            getAuthErrorMessage(
              error,
              "Unable to load email templates. Please try again.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadInitialTemplates();

    return () => {
      isActive = false;
    };
  }, []);

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
        matchesTemplateType(item.templateCode, ["forgotpassword", "forgot"]),
      ) ?? null,
    [emailTemplates],
  );

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

  const handleOpenCreateFormat = () => {
    setEditingTemplate(null);
    setErrorMessage("");
    setSuccessMessage("");
    setShowFormModal(true);
  };

  const handleEditTemplate = (item) => {
    if (!item) return;

    setEditingTemplate(item);
    setErrorMessage("");
    setSuccessMessage("");
    setShowFormModal(true);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[17px] font-semibold text-[#202224]">
            Email Format
          </h2>

          <div className="flex items-center gap-3">

            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 w-[110px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-[13px] text-[#808080] outline-none"
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
                className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[13px] text-[#808080]"
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
                className="flex h-10 w-[125px] items-center justify-between rounded-lg border border-[#E5E7EB] px-3 text-[13px] text-[#808080]"
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Login Credential — live API */}
          <EmailFormatCard
            title="Login & Forgot Password Email Format"
            fieldsRow={[
              { label: "Subject", value: loginCredentialTemplate?.subject ?? "-" },
              { label: "Template Code", value: loginCredentialTemplate?.templateCode ?? "-" },
              { label: "Channel", value: loginCredentialTemplate?.channel ?? "-" },
            ]}
            bodyText={loginCredentialTemplate?.bodyText ?? "-"}
            status={loginCredentialTemplate?.status}
            onToggleStatus={
              loginCredentialTemplate
                ? (nextStatus) =>
                    updateEmailNotificationTemplateStatus(
                      loginCredentialTemplate.templateCode,
                      nextStatus,
                    )
                : undefined
            }
            createdBy={loginCredentialTemplate?.createdBy ?? "-"}
            createdDate={loginCredentialTemplate?.createdDate ?? "-"}
            createdTime={loginCredentialTemplate?.createdTime ?? "-"}
            updatedDate={loginCredentialTemplate?.updatedDate ?? "-"}
            updatedTime={loginCredentialTemplate?.updatedTime ?? "-"}
            showEdit={Boolean(loginCredentialTemplate)}
            onEdit={() => handleEditTemplate(loginCredentialTemplate)}
            onCreate={handleOpenCreateFormat}
            isLoading={isLoading}
          />

          {/* Forgot Password — live API */}
          <EmailFormatCard
            title="Login & Forgot Password Email Format"
            fieldsRow={[
              { label: "Subject", value: forgotPasswordTemplate?.subject ?? "-" },
              { label: "Template Code", value: forgotPasswordTemplate?.templateCode ?? "-" },
              { label: "Channel", value: forgotPasswordTemplate?.channel ?? "-" },
            ]}
            bodyText={forgotPasswordTemplate?.bodyText ?? "-"}
            status={forgotPasswordTemplate?.status}
            onToggleStatus={
              forgotPasswordTemplate
                ? (nextStatus) =>
                    updateEmailNotificationTemplateStatus(
                      forgotPasswordTemplate.templateCode,
                      nextStatus,
                    )
                : undefined
            }
            createdBy={forgotPasswordTemplate?.createdBy ?? "-"}
            createdDate={forgotPasswordTemplate?.createdDate ?? "-"}
            createdTime={forgotPasswordTemplate?.createdTime ?? "-"}
            updatedDate={forgotPasswordTemplate?.updatedDate ?? "-"}
            updatedTime={forgotPasswordTemplate?.updatedTime ?? "-"}
            showEdit={Boolean(forgotPasswordTemplate)}
            onEdit={() => handleEditTemplate(forgotPasswordTemplate)}
            onCreate={handleOpenCreateFormat}
            isLoading={isLoading}
          />

          {/* Notification Review / Block — static placeholder, API to follow later */}
          {NOTIFICATION_CARDS.map((card) => (
            <EmailFormatCard
              key={card.key}
              title={card.title}
              fieldsRow={[
                { label: "Fraud Decision", value: card.fraudDecision },
                { label: "Template Code", value: card.templateCode },
                { label: "Notification Type", value: card.notificationType },
              ]}
              extraRow={{ label: "Subject", value: card.subject }}
              bodyText={card.bodyText}
              status={card.status}
              createdBy={card.createdBy}
              createdDate={card.createdDate}
              createdTime={card.createdTime}
              updatedDate={card.updatedDate}
              updatedTime={card.updatedTime}
              showEdit
            />
          ))}

        </div>

      </div>

      {/* Modals */}
      {showFormModal && (
        <CreateEmailFormatModal
          initialValues={editingTemplate}
          isSaving={isSavingTemplate}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
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
    createdDateRaw: item.createdDate ?? null,
    updatedAtRaw: item.updatedAt ?? item.updatedDate ?? null,
    bodyText:
      item.bodyText ??
      item.body ??
      item.templateBody ??
      item.message ??
      "-",
    subject: item.subject ?? item.templateSubject ?? "-",
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
      item?.bodyText,
  );
}
