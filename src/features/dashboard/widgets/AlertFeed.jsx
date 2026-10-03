import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { useNotifications } from "../../../context/NotificationContext.jsx";

const WIDGET_LIMIT = 10;

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toFeedItem(notification) {
  return {
    id: notification.id,
    title: notification.subject || "Alert",
    time: formatTime(notification.createdDate),
    rows: [
      `Transaction: ${notification.transactionId ?? "-"}`,
      `Risk Score: ${notification.riskScore ?? "-"}`,
    ],
  };
}

export default function AlertFeed() {
  const notifications = useNotifications();
  const alerts = useMemo(
    () => notifications.slice(0, WIDGET_LIMIT).map(toFeedItem),
    [notifications],
  );

  return (
    <div className="flex h-full flex-col rounded-card border border-brand-border bg-brand-panel px-4 pt-3.5 pb-3.5 shadow-card">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-brand-ink">
          Real Time Alert Feed
        </h2>

        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ECECEC] bg-white shadow-sm">
          <AlertCircle
            size={14}
            strokeWidth={2}
            className="text-brand-red"
          />
        </div>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto pr-1" style={{ maxHeight: "230px" }}>
        {alerts.length === 0 && (
          <div className="py-6 text-center text-[11px] text-brand-dim">
            No alerts yet.
          </div>
        )}

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="pb-3 last:pb-0"
          >
            <div className="flex justify-between">
              <h3 className="text-[12px] font-semibold leading-4 text-brand-ink">
                {alert.title}
              </h3>

              <span className="pt-[1px] text-[10px] font-medium text-[#666]">
                {alert.time}
              </span>
            </div>

            <div className="mt-0.5 text-[10px] leading-4 text-[#6F6F6F]">
              {alert.rows.map((row) => (
                <p key={row}>{row}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
