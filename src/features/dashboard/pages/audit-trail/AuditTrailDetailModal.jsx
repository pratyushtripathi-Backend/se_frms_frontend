import { Copy, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

const STATUS_TONES = {
  review: "text-[#F2994A]",
  approved: "text-[#27AE60]",
  approve: "text-[#27AE60]",
  rejected: "text-[#EB5757]",
  reject: "text-[#EB5757]",
  success: "text-[#27AE60]",
  failed: "text-[#EB5757]",
};

function toneForValue(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return STATUS_TONES[key] ?? "text-[#202224]";
}

function DetailCard({ index, title, children, className = "" }) {
  return (
    <div
      className={`mb-5 break-inside-avoid rounded-2xl border border-[#ECECEC] bg-[#FAFAFA] p-5 ${className}`}
    >
      <h3 className="mb-4 text-[14px] font-semibold text-[#202224]">
        {index}. {title}
      </h3>
      {children}
    </div>
  );
}

// Label and value both wrap inside the card: long IDs, timestamps and nested
// labels used to run past the card edge and overlap the neighbouring card.
function DetailRow({ label, value, valueClassName = "font-normal text-[#202224]" }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4 text-[13px] last:mb-0">
      <span className="max-w-[45%] shrink-0 break-words font-normal text-[#8A8A8A]">
        {label}:
      </span>
      <span className={`min-w-0 text-right [overflow-wrap:anywhere] ${valueClassName}`}>
        {value ?? "-"}
      </span>
    </div>
  );
}

function AuditSummaryCard({ index, row }) {
  const created = row.createdAt ? new Date(row.createdAt) : null;
  const createdLabel =
    created && !Number.isNaN(created.getTime())
      ? `${created.toLocaleDateString("en-GB").replace(/\//g, "-")} ${created.toLocaleTimeString(
          "en-IN",
          { hour: "2-digit", minute: "2-digit" },
        )}`
      : row.createdAt || "-";

  return (
    <DetailCard index={index} title="Audit Summary">
      <DetailRow label="Created At" value={createdLabel} />
      <DetailRow label="Transaction ID" value={row.transactionId} />
      <DetailRow label="Service Name" value={row.serviceName} />
      <DetailRow label="Event Type" value={row.eventType} />
      <DetailRow label="Reference ID" value={row.referenceId} />
      <DetailRow label="Perform by" value={row.performedBy} />
      <DetailRow
        label="Status"
        value={row.status ? "Success" : "Failed"}
        valueClassName={`font-medium ${row.status ? "text-[#27AE60]" : "text-[#EB5757]"}`}
      />
    </DetailCard>
  );
}

function ScoringDetailsCard({ index, evaluation }) {
  return (
    <DetailCard index={index} title="Scoring Details">
      <DetailRow label="Risk Score" value={evaluation.riskScore} />
      <DetailRow label="Risk Level" value={evaluation.riskLevel} />
      <DetailRow label="Model Name" value={evaluation.modelName} />
      <DetailRow label="Model Version" value={evaluation.modelVersion} />
    </DetailCard>
  );
}

function DecisionDetailsCard({ index, evaluation }) {
  return (
    <DetailCard index={index} title="Decision Details">
      <DetailRow
        label="Decision"
        value={evaluation.decision}
        valueClassName={`font-medium ${toneForValue(evaluation.decision)}`}
      />
      <DetailRow label="Decision Reason" value={evaluation.decisionReason} />
    </DetailCard>
  );
}

function TriggeredRuleCard({ index, evaluation }) {
  const rules = Array.isArray(evaluation.triggeredRules)
    ? evaluation.triggeredRules
    : evaluation.triggeredRule
      ? [evaluation.triggeredRule]
      : [];

  return (
    <DetailCard index={index} title="Triggered Rule">
      {rules.length === 0 ? (
        <p className="text-[13px] text-[#8A8A8A]">No rule triggered.</p>
      ) : (
        rules.map((rule, ruleIndex) => (
          <div
            className="mb-2 flex items-center justify-between text-[13px] font-medium text-[#EB5757] last:mb-0"
            key={`${rule.name}-${ruleIndex}`}
          >
            <span>{rule.name}</span>
            <span>{rule.delta}</span>
          </div>
        ))
      )}
    </DetailCard>
  );
}

function TransactionDataCard({ index, evaluation }) {
  return (
    <DetailCard index={index} title="Transaction Data">
      <DetailRow label="Transaction Amount" value={evaluation.transactionAmount} />
    </DetailCard>
  );
}

// Converts a backend-style key (camelCase or snake_case) into a readable
// label, e.g. "totalRiskScore" -> "Total Risk Score".
function formatFieldLabel(key) {
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return spaced.replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatFieldValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
}

// The backend sometimes sends the event payload (or a field inside it) as JSON
// *text* rather than an object; parse it so it's shown as fields instead of
// one long unbroken string.
function parseMaybeJson(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

const isPlainValue = (value) => value === null || typeof value !== "object";

// Recursively flattens a nested object into readable {label, value} rows,
// e.g. { transactionData: { userId: "USR006" } } ->
// [{ label: "Transaction Data → User Id", value: "USR006" }], so the event
// payload reads as a plain key-value list instead of raw JSON text.
function flattenEventData(rawValue, parentLabel = "") {
  const value = parseMaybeJson(rawValue);

  if (value === null || value === undefined) return [];

  if (typeof value !== "object") {
    return [{ label: parentLabel || "Value", value: formatFieldValue(value) }];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [{ label: parentLabel || "Value", value: "-" }];
    }

    // A list of plain values reads best on one line: "A, B, C".
    if (value.every(isPlainValue)) {
      return [
        { label: parentLabel || "Value", value: value.map(formatFieldValue).join(", ") },
      ];
    }

    return value.flatMap((item, itemIndex) =>
      flattenEventData(item, `${parentLabel || "Value"} [${itemIndex + 1}]`),
    );
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return [{ label: parentLabel || "Value", value: "-" }];
  }

  return entries.flatMap(([key, childValue]) => {
    const label = parentLabel
      ? `${parentLabel} → ${formatFieldLabel(key)}`
      : formatFieldLabel(key);

    return flattenEventData(childValue, label);
  });
}

// Splits the event payload into sections: top-level plain fields under
// "General", and each nested object/list under its own heading (e.g.
// "Transaction Data"), with labels relative to that section. Avoids long
// "A → B → C" labels for everything.
function groupEventData(rawEvent) {
  const data = parseMaybeJson(rawEvent);

  if (data === null || data === undefined) return [];

  if (typeof data !== "object" || Array.isArray(data)) {
    const rows = flattenEventData(data);
    return rows.length ? [{ title: null, rows }] : [];
  }

  const general = [];
  const sections = [];

  Object.entries(data).forEach(([key, childValue]) => {
    const parsedChild = parseMaybeJson(childValue);
    const label = formatFieldLabel(key);

    if (
      parsedChild !== null &&
      typeof parsedChild === "object" &&
      !(Array.isArray(parsedChild) && parsedChild.every(isPlainValue))
    ) {
      const rows = flattenEventData(parsedChild);
      if (rows.length) sections.push({ title: label, rows });
      return;
    }

    general.push(...flattenEventData(parsedChild, label));
  });

  return [
    ...(general.length ? [{ title: sections.length ? "General" : null, rows: general }] : []),
    ...sections,
  ];
}

function RawEventJsonCard({ index, rawEvent }) {
  const [copied, setCopied] = useState(false);
  const groups = groupEventData(rawEvent);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(parseMaybeJson(rawEvent), null, 2),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <DetailCard
      index={index}
      title="Event Data"
      className="relative"
    >
      <button
        aria-label="Copy event data as JSON"
        className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-md text-[#8A8A8A] transition-colors hover:bg-[#ECECEC] hover:text-[#202224]"
        onClick={handleCopy}
        type="button"
      >
        <Copy size={15} />
      </button>
      {groups.length === 0 ? (
        <p className="text-[13px] text-[#8A8A8A]">No details available.</p>
      ) : (
        groups.map((group, groupIndex) => (
          <div
            className={groupIndex > 0 ? "mt-5 border-t border-[#ECECEC] pt-4" : ""}
            key={`${group.title ?? "event"}-${groupIndex}`}
          >
            {group.title && (
              <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#8A8A8A]">
                {group.title}
              </h4>
            )}
            {/* Full card width, so the fields sit in 2–3 columns. */}
            <div className="grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
              {group.rows.map((row, rowIndex) => (
                <DetailRow
                  key={`${row.label}-${rowIndex}`}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </div>
        ))
      )}
      {copied && (
        <span className="absolute right-14 top-6 text-[11px] font-semibold text-[#27AE60]">
          Copied!
        </span>
      )}
    </DetailCard>
  );
}

function buildDetailCards(row) {
  const cards = [{ type: "summary" }];

  (row.evaluations ?? []).forEach((evaluation, evaluationIndex) => {
    cards.push({ type: "scoring", evaluation, key: `scoring-${evaluationIndex}` });
    cards.push({ type: "decision", evaluation, key: `decision-${evaluationIndex}` });
    cards.push({ type: "triggeredRule", evaluation, key: `rule-${evaluationIndex}` });

    if (evaluation.transactionAmount) {
      cards.push({
        type: "transaction",
        evaluation,
        key: `transaction-${evaluationIndex}`,
      });
    }
  });

  return cards;
}

export default function AuditTrailDetailModal({ row, onClose }) {
  if (!row) {
    return null;
  }

  const cards = buildDetailCards(row);

  return createPortal(
    <div
      className="frms-modal-overlay fixed inset-0 z-[2000] overflow-y-auto bg-black/45 py-8 pl-[241px] pr-4"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-[1680px] rounded-[16px] bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#ECECEC] pb-4">
          <h2 className="text-[20px] font-semibold text-[#202224]">Audit Trail</h2>

          <button
            aria-label="Close audit trail detail"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202224] text-white transition-opacity hover:opacity-80"
            onClick={onClose}
            type="button"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="columns-1 gap-5 sm:columns-2 xl:columns-4">
          {cards.map((card, cardIndex) => {
            const index = cardIndex + 1;

            switch (card.type) {
              case "summary":
                return <AuditSummaryCard index={index} key="summary" row={row} />;
              case "scoring":
                return (
                  <ScoringDetailsCard
                    evaluation={card.evaluation}
                    index={index}
                    key={card.key}
                  />
                );
              case "decision":
                return (
                  <DecisionDetailsCard
                    evaluation={card.evaluation}
                    index={index}
                    key={card.key}
                  />
                );
              case "triggeredRule":
                return (
                  <TriggeredRuleCard
                    evaluation={card.evaluation}
                    index={index}
                    key={card.key}
                  />
                );
              case "transaction":
                return (
                  <TransactionDataCard
                    evaluation={card.evaluation}
                    index={index}
                    key={card.key}
                  />
                );
              default:
                return null;
            }
          })}
        </div>

        {/* Event Data has the most (and longest) fields, so it spans the
            full width below the summary cards instead of being squeezed
            into one narrow column. */}
        {row.rawEvent && (
          <RawEventJsonCard index={cards.length + 1} rawEvent={row.rawEvent} />
        )}
      </div>
    </div>,
    document.body,
  );
}
