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

function DetailRow({ label, value, valueClassName = "font-normal text-[#202224]" }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4 text-[13px] last:mb-0">
      <span className="shrink-0 font-normal text-[#8A8A8A]">{label}:</span>
      <span className={`text-right ${valueClassName}`}>{value ?? "-"}</span>
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

function RawEventJsonCard({ index, rawEvent }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(rawEvent, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <DetailCard
      index={index}
      title="Raw Event JSON"
      className="relative"
    >
      <button
        aria-label="Copy raw event JSON"
        className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-md text-[#8A8A8A] transition-colors hover:bg-[#ECECEC] hover:text-[#202224]"
        onClick={handleCopy}
        type="button"
      >
        <Copy size={15} />
      </button>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-[12px] leading-5 text-[#4B5563]">
        {json}
      </pre>
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

  if (row.rawEvent) {
    cards.push({ type: "rawEvent" });
  }

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
      className="fixed inset-0 z-[2000] overflow-y-auto bg-black/45 py-8 pl-[241px] pr-4"
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
              case "rawEvent":
                return (
                  <RawEventJsonCard
                    index={index}
                    key="rawEvent"
                    rawEvent={row.rawEvent}
                  />
                );
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
      </div>
    </div>,
    document.body,
  );
}
