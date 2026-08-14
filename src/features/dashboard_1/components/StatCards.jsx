import { RefreshCw, AlertTriangle, Ban, FileText } from "lucide-react";

const STATS = [
  {
    label: "Total Transactions",
    value: "+12,54,500",
    icon: RefreshCw,
    bg: "#2E9E5C",
  },
  {
    label: "Fraud Alert",
    value: "435",
    icon: AlertTriangle,
    bg: "#E5484D",
  },
  {
    label: "Blocked Amount",
    value: "35",
    icon: Ban,
    bg: "#9AA0A8",
  },
  {
    label: "Active Case",
    value: "123",
    icon: FileText,
    bg: "#2C5AC0",
  },
  {
    label: "High Risk Transaction",
    value: "36",
    icon: FileText,
    bg: "#F2994A",
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 px-7 sm:grid-cols-3 lg:grid-cols-5">
      {STATS.map(({ label, value, icon: Icon, bg }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-2xl bg-white px-5 py-5"
          style={{
            boxShadow:
              "0 18px 30px -16px rgba(15, 23, 42, 0.28), 0 6px 10px -6px rgba(15, 23, 42, 0.08)",
            containerType: "inline-size",
          }}
        >
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
            style={{ backgroundColor: bg }}
          >
            <Icon size={19} strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="truncate text-gray-500"
              style={{ fontSize: "12.5px" }}
            >
              {label}
            </div>
            <div
              className="mt-0.5 truncate font-bold text-gray-900"
              style={{ fontSize: "clamp(14px, 9cqw, 19px)" }}
              title={value}
            >
              {value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
