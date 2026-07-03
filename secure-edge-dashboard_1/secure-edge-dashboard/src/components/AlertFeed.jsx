import { AlertCircle } from "lucide-react";

const ALERTS = [
  {
    title: "High Risk Transaction Detected",
    time: "10:30 AM",
    rows: ["Amount: 15000", "Location: International"],
  },
  {
    title: "Multiple failed Login",
    time: "10:30 AM",
    rows: ["User- Cust_1003", "Location: International"],
  },
  {
    title: "High Risk Transaction Detected",
    time: "10:30 AM",
    rows: ["Amount: 15000", "Location: International"],
  },
  {
    title: "High Risk Transaction Detected",
    time: "10:30 AM",
    rows: ["Amount: 15000", "Location: International"],
  },
  {
    title: "High Risk Transaction Detected",
    time: "10:30 AM",
    rows: ["Amount: 15000", "Location: International"],
  },
];

export default function AlertFeed() {
  return (
    <div className="flex h-full flex-col rounded-card border border-brand-border bg-brand-panel px-5 pt-4 pb-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-brand-ink">
          Real Time Alert Feed
        </h2>

        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ECECEC] bg-white shadow-sm">
          <AlertCircle
            size={16}
            strokeWidth={2}
            className="text-brand-red"
          />
        </div>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto pr-1">
        {ALERTS.map((alert, index) => (
          <div
            key={index}
            className="pb-5 last:pb-0"
          >
            <div className="flex justify-between">
              <h3 className="text-[13px] font-semibold leading-5 text-brand-ink">
                {alert.title}
              </h3>

              <span className="pt-[1px] text-[11px] font-medium text-[#666]">
                {alert.time}
              </span>
            </div>

            <div className="mt-1 text-[11px] leading-5 text-[#6F6F6F]">
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