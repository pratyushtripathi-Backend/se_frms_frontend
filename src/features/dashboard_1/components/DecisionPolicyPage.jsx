import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createDecisionPolicy,
  getLatestDecisionPolicy,
} from "../services/fraudDetailsService";
import DecisionPolicyData from "./DecisionPolicyData";

function AnimatedCheckmark() {
  return (
    <svg height="52" viewBox="0 0 70 70" width="52">
      <circle
        cx="35"
        cy="35"
        fill="none"
        r="30"
        stroke="#FF4D4F"
        strokeDasharray="189"
        strokeDashoffset="189"
        strokeLinecap="round"
        strokeWidth="3"
        style={{ animation: "dpCircleDraw 0.5s ease-out forwards" }}
      />
      <path
        d="M21 35.5L30.5 45L49 24"
        fill="none"
        stroke="#FF4D4F"
        strokeDasharray="40"
        strokeDashoffset="40"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        style={{
          animation: "dpCheckDraw 0.35s ease-out 0.45s forwards",
        }}
      />
    </svg>
  );
}

const emptyForm = {
  allowMinScore: "",
  allowMaxScore: "",
  reviewMinScore: "",
  reviewMaxScore: "",
  blockMinScore: "",
  blockMaxScore: "",
  description: "",
};

export default function DecisionPolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadLatestPolicy = useCallback(async () => {
    setIsLoadingPolicy(true);
    setPageErrorMessage("");

    try {
      const response = await getLatestDecisionPolicy();
      if (isAccessDeniedDecisionPolicyResponse(response?.data)) {
        setPolicy(null);
        setPageErrorMessage(
          response?.data?.responseMessage || "Access denied.",
        );
        return;
      }

      setPolicy(
        normalizeDecisionPolicy(
          response?.data?.responseData ?? response?.data,
          DecisionPolicyData,
        ),
      );
    } catch (error) {
      setPolicy(null);
      setPageErrorMessage(
        getDecisionPolicyLoadErrorMessage(error),
      );
    } finally {
      setIsLoadingPolicy(false);
    }
  }, []);

  useEffect(() => {
    loadLatestPolicy();
  }, [loadLatestPolicy]);

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setErrorMessage("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        allowMinScore: toNumberOrValue(form.allowMinScore),
        allowMaxScore: toNumberOrValue(form.allowMaxScore),
        reviewMinScore: toNumberOrValue(form.reviewMinScore),
        reviewMaxScore: toNumberOrValue(form.reviewMaxScore),
        blockMinScore: toNumberOrValue(form.blockMinScore),
        blockMaxScore: toNumberOrValue(form.blockMaxScore),
        description: form.description.trim(),
      };
      const response = await createDecisionPolicy(payload);
      const createdPolicy = normalizeDecisionPolicy(
        response?.data?.responseData ?? response?.data,
        {
          ...(policy ?? DecisionPolicyData),
          ...payload,
          status: "Active",
        },
      );

      setPolicy(createdPolicy);
      await loadLatestPolicy();
      setSuccessMessage(
        response?.data?.responseMessage ||
          "Decision policy created successfully.",
      );
      setShowCreateModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Unable to create decision policy. Please try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const toggleStatus = () => {
    setPolicy((prev) =>
      prev
        ? {
            ...prev,
            status: prev.status === "Active" ? "Inactive" : "Active",
          }
        : prev,
    );
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 24px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      boxSizing: "border-box",
    },

    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      padding: "20px 24px",
    },

    title: {
      fontSize: "15px",
      fontWeight: 700,
      color: "#202224",
    },

    createButton: {
      height: "40px",
      padding: "0 16px",
      borderRadius: "8px",
      border: "1px solid #FF4D4F",
      background: "#FFFFFF",
      color: "#FF4D4F",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },

    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      borderTop: "1px solid #E5E7EB",
      borderBottom: "1px solid #E5E7EB",
    },

    statCell: (isLast) => ({
      padding: "20px 24px",
      borderRight: isLast ? "none" : "1px solid #E5E7EB",
    }),

    statLabel: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "8px",
    },

    statValue: {
      fontSize: "13px",
      color: "#555555",
    },

    descriptionSection: {
      padding: "20px 24px",
      borderBottom: "1px solid #E5E7EB",
    },

    descriptionLabel: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "8px",
    },

    descriptionText: {
      fontSize: "13px",
      color: "#555555",
      lineHeight: 1.6,
      maxWidth: "760px",
    },

    metaRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: "64px",
      padding: "20px 24px",
      flexWrap: "wrap",
    },

    metaCol: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    metaLabel: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#202224",
    },

    statusPill: (isActive) => ({
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      height: "26px",
      width: "82px",
      borderRadius: "20px",
      padding: "0 10px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#FFFFFF",
      background: isActive ? "#27AE60" : "#D9D9D9",
      justifyContent: isActive ? "flex-start" : "flex-end",
      border: "none",
      cursor: "pointer",
      transition: "background 0.2s ease",
    }),

    statusDot: (isActive) => ({
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      height: "18px",
      width: "18px",
      borderRadius: "50%",
      background: "#FFFFFF",
      boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      right: isActive ? "4px" : undefined,
      left: isActive ? undefined : "4px",
      transition: "left 0.2s ease, right 0.2s ease",
    }),

    metaText: {
      fontSize: "13px",
      color: "#555555",
    },

    dateTimeDate: {
      fontWeight: 500,
      color: "#2563EB",
      fontSize: "13px",
    },

    dateTimeTime: {
      color: "#27AE60",
      fontSize: "13px",
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    },

    modalCard: {
      width: "620px",
      maxWidth: "92vw",
      maxHeight: "90vh",
      overflowY: "auto",
      background: "#FFFFFF",
      borderRadius: "14px",
      padding: "28px 32px 32px",
      boxSizing: "border-box",
      boxShadow: "0 20px 50px rgba(0,0,0,.18)",
    },

    modalHeaderRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "22px",
    },

    modalTitle: {
      fontSize: "17px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "4px",
    },

    modalSubtitle: {
      fontSize: "13px",
      color: "#8C8C8C",
    },

    modalClose: {
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      background: "#202224",
      color: "#FFFFFF",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "18px 20px",
      marginBottom: "18px",
    },

    fieldLabel: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#202224",
      marginBottom: "8px",
      display: "block",
    },

    fieldInput: {
      width: "100%",
      height: "42px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      color: "#202224",
      outline: "none",
      boxSizing: "border-box",
    },

    fieldTextarea: {
      width: "100%",
      minHeight: "90px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "12px 14px",
      fontSize: "13px",
      color: "#202224",
      outline: "none",
      boxSizing: "border-box",
      resize: "vertical",
      fontFamily: "Inter, sans-serif",
    },

    submitButton: {
      width: "100%",
      height: "46px",
      borderRadius: "8px",
      border: "none",
      background: "#3A3A3A",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      marginTop: "6px",
    },

    successCard: {
      width: "560px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "14px",
      padding: "48px 40px",
      boxSizing: "border-box",
      boxShadow: "0 20px 50px rgba(0,0,0,.18)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },

    successIconRing: {
      width: "84px",
      height: "84px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "22px",
    },

    successTitle: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "10px",
    },

    successText: {
      fontSize: "13px",
      color: "#7B7B7B",
      marginBottom: "28px",
    },

    backButton: {
      width: "100%",
      height: "46px",
      borderRadius: "8px",
      border: "none",
      background: "#3A3A3A",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
    },

    footerText: {
      fontSize: "13px",
      color: "#7B7B7B",
    },
  };

  const statFields = policy
    ? [
        { label: "Allow min Score", value: policy.allowMinScore },
        { label: "Allow max Score", value: policy.allowMaxScore },
        { label: "Review Min Score", value: policy.reviewMinScore },
        { label: "Review Max Score", value: policy.reviewMaxScore },
        { label: "Block Min Score", value: policy.blockMinScore },
        { label: "Block Max Score", value: policy.blockMaxScore },
      ]
    : [];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.title}>Decision Policy Overview</div>

          <button
            onClick={openCreateModal}
            style={styles.createButton}
            type="button"
          >
            Create Policy
            <Plus size={14} />
          </button>
        </div>

        {pageErrorMessage && (
          <div
            style={{
              margin: "0 24px 16px",
              borderRadius: "8px",
              background: "#FEF3F2",
              color: "#D92D20",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 12px",
            }}
          >
            {pageErrorMessage}
          </div>
        )}

        {isLoadingPolicy && (
          <div
            style={{
              margin: "0 24px 16px",
              borderRadius: "8px",
              background: "#F8F9FB",
              color: "#555555",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 12px",
            }}
          >
            Loading latest decision policy...
          </div>
        )}

        {!isLoadingPolicy && !pageErrorMessage && !policy && (
          <div
            style={{
              margin: "0 24px 24px",
              borderRadius: "8px",
              background: "#F8F9FB",
              color: "#555555",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 12px",
            }}
          >
            No decision policy data found.
          </div>
        )}

        {policy && (
          <>
            <div style={styles.statsRow}>
              {statFields.map((field, idx) => (
                <div
                  key={field.label}
                  style={styles.statCell(idx === statFields.length - 1)}
                >
                  <div style={styles.statLabel}>{field.label}</div>
                  <div style={styles.statValue}>{field.value}</div>
                </div>
              ))}
            </div>

            <div style={styles.descriptionSection}>
              <div style={styles.descriptionLabel}>Description</div>
              <div style={styles.descriptionText}>{policy.description}</div>
            </div>

            <div style={styles.metaRow}>
              <div style={styles.metaCol}>
                <div style={styles.metaLabel}>Status</div>
                <button
                  onClick={toggleStatus}
                  style={styles.statusPill(policy.status === "Active")}
                  type="button"
                >
                  <span>{policy.status}</span>
                  <span style={styles.statusDot(policy.status === "Active")} />
                </button>
              </div>

              <div style={styles.metaCol}>
                <div style={styles.metaLabel}>Created By</div>
                <div style={styles.metaText}>{policy.createdBy}</div>
              </div>

              <div style={styles.metaCol}>
                <div style={styles.metaLabel}>Created date</div>
                <div>
                  <div style={styles.dateTimeDate}>{policy.createdDate}</div>
                  <div style={styles.dateTimeTime}>{policy.createdTime}</div>
                </div>
              </div>

              <div style={styles.metaCol}>
                <div style={styles.metaLabel}>Updated At</div>
                <div>
                  <div style={styles.dateTimeDate}>{policy.updatedDate}</div>
                  <div style={styles.dateTimeTime}>{policy.updatedTime}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeaderRow}>
              <div>
                <div style={styles.modalTitle}>Decision Policy</div>
                <div style={styles.modalSubtitle}>
                  Fill all filed to create Policy
                </div>
              </div>

              <button
                onClick={closeCreateModal}
                style={styles.modalClose}
                type="button"
              >
                <X size={15} />
              </button>
            </div>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.fieldLabel}>Allow min Score</label>
                <input
                  onChange={handleFieldChange("allowMinScore")}
                  placeholder="Allow Min Score"
                  style={styles.fieldInput}
                  type="text"
                  value={form.allowMinScore}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Allow max Score</label>
                <input
                  onChange={handleFieldChange("allowMaxScore")}
                  placeholder="Allow Max Score"
                  style={styles.fieldInput}
                  type="text"
                  value={form.allowMaxScore}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Review Min Score</label>
                <input
                  onChange={handleFieldChange("reviewMinScore")}
                  placeholder="Review Min Score"
                  style={styles.fieldInput}
                  type="text"
                  value={form.reviewMinScore}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Review max Score</label>
                <input
                  onChange={handleFieldChange("reviewMaxScore")}
                  placeholder="Review Max Score"
                  style={styles.fieldInput}
                  type="text"
                  value={form.reviewMaxScore}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Block Min Score</label>
                <input
                  onChange={handleFieldChange("blockMinScore")}
                  placeholder="Block Min Score"
                  style={styles.fieldInput}
                  type="text"
                  value={form.blockMinScore}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Block max Score</label>
                <input
                  onChange={handleFieldChange("blockMaxScore")}
                  placeholder="Block Max Score"
                  style={styles.fieldInput}
                  type="text"
                  value={form.blockMaxScore}
                />
              </div>
            </div>

            <label style={styles.fieldLabel}>Description</label>
            <textarea
              onChange={handleFieldChange("description")}
              placeholder="describe the detail"
              style={styles.fieldTextarea}
              value={form.description}
            />

            {errorMessage && (
              <div
                style={{
                  marginTop: "12px",
                  borderRadius: "8px",
                  background: "#FEF3F2",
                  color: "#D92D20",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "10px 12px",
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              disabled={isSaving}
              onClick={handleSubmit}
              style={{
                ...styles.submitButton,
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.7 : 1,
              }}
              type="button"
            >
              {isSaving ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <style>{`
            @keyframes dpCircleDraw {
              from { stroke-dashoffset: 189; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes dpCheckDraw {
              from { stroke-dashoffset: 40; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
          <div style={styles.successCard}>
            <div style={styles.successIconRing}>
              <AnimatedCheckmark />
            </div>

            <div style={styles.successTitle}>
              {successMessage || "Decision Policy Create Successfully"}
            </div>

            <div style={styles.successText}>
              {successMessage ||
                "The Decision policy has been created successfully."}
            </div>

            <button
              onClick={closeSuccessModal}
              style={styles.backButton}
              type="button"
            >
              Back to Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function toNumberOrValue(value) {
  const trimmedValue = String(value ?? "").trim();

  if (!trimmedValue) return "";

  const numericValue = Number(trimmedValue);

  return Number.isFinite(numericValue) ? numericValue : trimmedValue;
}

function getDecisionPolicyLoadErrorMessage(error) {
  const message = getAuthErrorMessage(
    error,
    "Unable to load latest decision policy. Please try again.",
  );

  if (
    message.includes("Failed to convert") &&
    message.includes("latest")
  ) {
    return "Unable to load latest decision policy. Please try again after backend restart.";
  }

  return message;
}

function isAccessDeniedDecisionPolicyResponse(responseData) {
  const responseMessage = String(responseData?.responseMessage ?? "").toLowerCase();

  return (
    responseData?.status === false &&
    (responseMessage.includes("access denied") ||
      responseMessage.includes("unauthorized") ||
      responseMessage.includes("forbidden"))
  );
}

function normalizeDecisionPolicy(responseData, fallbackPolicy) {
  const policyData =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData ??
    fallbackPolicy;
  const createdAt =
    policyData.createdAt ?? policyData.createdDate ?? fallbackPolicy.createdDate;
  const updatedAt =
    policyData.updatedAt ?? policyData.updatedDate ?? fallbackPolicy.updatedDate;

  return {
    allowMinScore:
      policyData.allowMinScore ?? fallbackPolicy.allowMinScore,
    allowMaxScore:
      policyData.allowMaxScore ?? fallbackPolicy.allowMaxScore,
    reviewMinScore:
      policyData.reviewMinScore ?? fallbackPolicy.reviewMinScore,
    reviewMaxScore:
      policyData.reviewMaxScore ?? fallbackPolicy.reviewMaxScore,
    blockMinScore:
      policyData.blockMinScore ?? fallbackPolicy.blockMinScore,
    blockMaxScore:
      policyData.blockMaxScore ?? fallbackPolicy.blockMaxScore,
    description: policyData.description ?? fallbackPolicy.description,
    status: formatPolicyStatus(policyData.status ?? fallbackPolicy.status),
    createdBy: policyData.createdBy ?? fallbackPolicy.createdBy ?? "Admin",
    createdDate: formatDatePart(createdAt),
    createdTime: formatTimePart(createdAt),
    updatedDate: formatDatePart(updatedAt),
    updatedTime: formatTimePart(updatedAt),
  };
}

function formatPolicyStatus(status) {
  if (typeof status === "boolean") return status ? "Active" : "Inactive";
  if (status === null || status === undefined || status === "") return "Active";

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
  if (!value || !String(value).includes("T")) return "-";

  return String(value).split("T")[1]?.split(".")[0] ?? "-";
}
