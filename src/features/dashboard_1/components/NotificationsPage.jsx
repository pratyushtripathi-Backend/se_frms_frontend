import { useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { openDashboardDatePicker } from "./dashboardDatePicker";

const FILTERS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimestamp(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}-${month}-${year}, ${String(hours).padStart(2, "0")}:${minutes} ${meridiem}`;
}

function decisionLabel(decision) {
  if (decision === "BLOCK") return "blocked";
  if (decision === "REVIEW") return "flagged for review";
  return (decision || "").toLowerCase() || "flagged";
}

function NotificationMessage({ transactionId, riskScore, decision }) {
  return (
    <>
      Transaction Id{" "}
      <span className="font-semibold text-brand-blue">{transactionId}</span>{" "}
      has been {decisionLabel(decision)} due to a high fraud risk. The transaction received a{" "}
      <span className="font-semibold text-brand-blue">
        risk score of {riskScore}
      </span>
      , and the{" "}
      <span className="font-semibold text-brand-red">
        fraud decision was {decision}
      </span>
      .
    </>
  );
}

function toNotificationItem(notification) {
  return {
    id: notification.id,
    transactionId: notification.transactionId,
    riskScore: notification.riskScore ?? 0,
    decision: notification.fraudDecision ?? "REVIEW",
    occurredAt: notification.createdDate
      ? new Date(notification.createdDate)
      : new Date(),
  };
}

export default function NotificationsPage({ searchQuery = "" }) {
  const rawNotifications = useNotifications();
  const notifications = useMemo(
    () => rawNotifications.map(toNotificationItem),
    [rawNotifications],
  );
  const [activeFilter, setActiveFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const customDateInputRef = useRef(null);

  const filtered = useMemo(() => {
    const now = new Date();
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      let matchesFilter = true;

      if (activeFilter === "today") {
        matchesFilter = isSameDay(item.occurredAt, now);
      } else if (activeFilter === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesFilter = isSameDay(item.occurredAt, yesterday);
      } else if (activeFilter === "last7") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesFilter = item.occurredAt >= sevenDaysAgo;
      } else if (activeFilter === "custom" && customDate) {
        const selected = new Date(customDate);
        matchesFilter = isSameDay(item.occurredAt, selected);
      }

      if (!matchesFilter) return false;
      if (!query) return true;

      return (
        item.transactionId.toLowerCase().includes(query) ||
        item.decision.toLowerCase().includes(query)
      );
    });
  }, [notifications, activeFilter, customDate, searchQuery]);

  return (
    <div className="flex flex-col gap-4 px-6 pb-10">
      <div className="rounded-card border border-brand-border bg-brand-panel p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-bold text-brand-ink">
            All Notification
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                  activeFilter === filter.key
                    ? "bg-brand-red text-white"
                    : "border border-brand-border text-brand-dim"
                }`}
              >
                {filter.label}
              </button>
            ))}

            <input
              ref={customDateInputRef}
              type="date"
              value={customDate}
              onChange={(event) => {
                setCustomDate(event.target.value);
                setActiveFilter("custom");
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={(event) => {
                setActiveFilter("custom");
                openDashboardDatePicker(
                  customDateInputRef.current,
                  event.currentTarget,
                );
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                activeFilter === "custom"
                  ? "bg-brand-red text-white"
                  : "border border-brand-border text-brand-dim"
              }`}
            >
              Custom Date
              <CalendarDays size={14} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-brand-border">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[13px] text-brand-dim">
              No notifications to show.
            </div>
          )}

          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-6 py-3.5 text-[13px] leading-6 text-brand-ink"
            >
              <div className="flex min-w-0 gap-3">
                <span className="shrink-0 text-brand-dim">{index + 1}.</span>
                <p>
                  <NotificationMessage
                    transactionId={item.transactionId}
                    riskScore={item.riskScore}
                    decision={item.decision}
                  />
                </p>
              </div>

              <div className="shrink-0 whitespace-nowrap text-[12px] text-brand-dim">
                {formatTimestamp(item.occurredAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
