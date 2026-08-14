import { useEffect, useState, useRef, useMemo } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createEmailNotificationTemplate,
  getEmailNotificationTemplates,
  updateEmailNotificationTemplate,
  updateEmailNotificationTemplateStatus,
} from "../services/adminEmployeeService";
import DashboardEditButton from "./DashboardEditButton";
import DashboardStatusToggle from "./DashboardStatusToggle";

import { openDashboardDatePicker } from "./dashboardDatePicker";
const TABLE_COLUMNS = [
  "Sr No",
  "Body Text",
  "Subject",
  "Template Code",
  "Channel",
  "Status",
  "Created By",
  "Created Date",
  "Updated At",
  "Action",
];

const YEAR_OPTIONS = ["2026", "2025", "2024", "2023"];
const TEMPLATE_CODE_OPTIONS = ["LOGIN_OTP", "Forgot Password", "Welcome Email", "OTP Verification", "Account Locked"];
const CHANNEL_OPTIONS = ["EMAIL", "SMS"];

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

function DeleteConfirmModal({ isSaving, onCancel, onConfirm, template }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-[90%] max-w-[520px] rounded-[18px] bg-white px-8 py-8 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-5">
          <div>
            <h3 className="text-[20px] font-semibold text-[#202224]">
              Confirm Delete
            </h3>
            <p className="mt-2 text-[14px] leading-6 text-[#7A7A7A]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#202224]">
                {template?.templateCode}
              </span>
              ? This will only mark the template as inactive.
            </p>
          </div>

          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white"
            onClick={onCancel}
            type="button"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="h-[42px] rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[14px] font-semibold text-[#4B5563]"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-[42px] rounded-[10px] bg-[#DC2626] px-5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving}
            onClick={onConfirm}
            type="button"
          >
            {isSaving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
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
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const isLocalFilterActive = Boolean(year || fromDate || toDate);

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

  const filteredData = useMemo(() => {
    return emailTemplates.filter((item) => {
      const itemDate = parseEmailTemplateDate(item.createdDate);
      const yr = getEmailTemplateYear(item.createdDate);

      if (year && yr !== year) return false;

      if (fromDate && itemDate < parseDateOnly(fromDate)) return false;

      if (toDate && itemDate > parseDateOnly(toDate, true)) return false;

      return true;
    });
  }, [emailTemplates, year, fromDate, toDate]);

  const visibleData = filteredData.slice(0, 10);

  const handleResetFilters = () => {
    setYear("");
    setFromDate("");
    setToDate("");
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
    setOpenActionMenu(null);
    setEditingTemplate(item);
    setErrorMessage("");
    setSuccessMessage("");
    setShowFormModal(true);
  };

  const handleDeleteTemplate = (item) => {
    setOpenActionMenu(null);
    setSuccessMessage("");
    setErrorMessage("");
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    if (isSavingTemplate) return;

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSavingTemplate(true);

    try {
      const payload = buildEmailTemplatePayload(deleteTarget, {
        status: false,
      });
      const response = await updateEmailNotificationTemplate(
        deleteTarget.templateCode,
        payload,
      );

      setDeleteTarget(null);
      setSuccessMessage(
        response.data?.responseMessage ||
          "Email template status updated successfully.",
      );
      await loadEmailTemplates();
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to update email template status. Please try again.",
        ),
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-6 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[17px] font-semibold text-[#202224]">
            Email Format Deatils
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

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!isLocalFilterActive}
              className="h-10 rounded-lg border border-[#FF0D0D] bg-white px-4 text-[12px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1] disabled:cursor-not-allowed disabled:border-[#D6D6D6] disabled:text-[#A3A3A3] disabled:hover:bg-white"
            >
              Reset
            </button>

            {/* Create format */}
            <button
              type="button"
              onClick={handleOpenCreateFormat}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#FF0D0D] bg-white px-4 text-[14px] font-semibold text-[#FF0D0D] transition-colors hover:bg-[#FFF1F1]"
            >
              <span>Create format</span>
              <Plus size={16} strokeWidth={2.5} />
            </button>

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

        {/* Table (no wrapping card/border) */}
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
              {isLoading && (
                <tr className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563]">
                  <td colSpan={TABLE_COLUMNS.length} className="px-4 py-6 text-center">
                    Loading email templates...
                  </td>
                </tr>
              )}

              {!isLoading && visibleData.length === 0 && (
                <tr className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563]">
                  <td colSpan={TABLE_COLUMNS.length} className="px-4 py-6 text-center">
                    No email templates found.
                  </td>
                </tr>
              )}

              {!isLoading && visibleData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                >
                  <td className="px-4 py-4 font-medium align-top">
                    {index + 1}
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

                  <td className="px-4 py-4 align-top">
                    <DashboardStatusToggle
                      onToggle={(nextStatus) =>
                        updateEmailNotificationTemplateStatus(
                          item.templateCode,
                          nextStatus,
                        )
                      }
                      status={item.status}
                    />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-top">
                    {item.createdBy}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col text-[12px] leading-5">
                      <span className="font-medium text-[#2F80ED]">
                        {item.createdDate}
                      </span>

                      <span className="text-[#27AE60]">
                        {item.createdTime}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col text-[12px] leading-5">
                      <span className="font-medium text-[#2F80ED]">
                        {item.updatedDate}
                      </span>

                      <span className="text-[#27AE60]">
                        {item.updatedTime}
                      </span>
                    </div>
                  </td>

                  <td className="relative px-4 py-4 align-top">
                    <DashboardEditButton
                      onClick={() => handleEditTemplate(item)}
                    >
                      Edit
                    </DashboardEditButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar */}

        <div className="flex items-center justify-between bg-white px-6 py-4">

          <p className="text-[13px] text-[#7A7A7A]">
            Showing {visibleData.length} of {filteredData.length} transactions
          </p>

          <div className="flex items-center gap-2">

            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50">
              &lt;
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-medium transition ${
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

      {deleteTarget && (
        <DeleteConfirmModal
          isSaving={isSavingTemplate}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          template={deleteTarget}
        />
      )}

    </div>
  );
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

function parseEmailTemplateDate(value) {
  if (!value || value === "-") return new Date(0);
  const stringValue = String(value);

  if (/^\d{2}-\d{2}-\d{4}$/.test(stringValue)) {
    const [day, month, year] = stringValue.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(stringValue);
}

function parseDateOnly(dateValue, endOfDay = false) {
  const date = new Date(`${dateValue}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getEmailTemplateYear(value) {
  if (!value || value === "-") return "";
  const stringValue = String(value);

  if (/^\d{2}-\d{2}-\d{4}$/.test(stringValue)) return stringValue.split("-")[2];
  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) return stringValue.slice(0, 4);

  return "";
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
