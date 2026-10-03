
import {
  RefreshCw,
  AlertTriangle,
  Ban,
  FileText,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getAnalyticsSummary } from "../services/analyticsService";

const AUTO_REFRESH_INTERVAL_MS = 1500;

function formatCount(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-IN");
}

function normalizeSummaryResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data ??
    responseData ??
    {};

  return {
    totalTransactions: payload.totalTransactions,
    allowCount: payload.allowCount,
    reviewCount: payload.reviewCount,
    averageRiskScore: payload.averageRiskScore,
    fraudAlertCount: payload.fraudAlertCount,
    highRiskCount: payload.highRiskCount,
    blockedAmount: payload.blockedAmount,
  };
}

function buildStats(summary, isLoading) {
  const liveValue = (field) =>
    isLoading
      ? "…"
      : formatCount(summary?.[field]);

  return [
    {
      label: "Total Transactions",
      value: liveValue("totalTransactions"),
      icon: RefreshCw,
      bg: "#2E9E5C",
      page: "transaction-data",
    },
    {
      label: "Fraud Alert",
      value: liveValue("fraudAlertCount"),
      icon: AlertTriangle,
      bg: "#E5484D",
    },
    {
      label: "Blocked Amount",
      value: liveValue("blockedAmount"),
      icon: Ban,
      bg: "#9AA0A8",
    },
    {
      label: "Active Case",
      value: liveValue("reviewCount"),
      icon: FileText,
      bg: "#2C5AC0",
      page: "case-management",
    },
    {
      label: "High Risk Transaction",
      value: liveValue("highRiskCount"),
      icon: FileText,
      bg: "#F2994A",
    },
  ];
}

export default function StatCards({ setCurrentPage }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestIdRef = useRef(0);

  const loadSummary = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestIdRef.current;

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await getAnalyticsSummary();

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSummary(
          normalizeSummaryResponse(response?.data),
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!silent) {
          setSummary(null);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadSummary();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") {
        return;
      }

      loadSummary({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadSummary]);

  const stats = buildStats(summary, isLoading);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map(
        ({
          label,
          value,
          icon: Icon,
          bg,
          page,
        }) => (
          <div
            key={label}
            onClick={() => {
              if (
                !isLoading &&
                page &&
                setCurrentPage
              ) {
                setCurrentPage(page);
              }
            }}
            className={`flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 ${
              page && !isLoading
                ? "cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                : ""
            }`}
            style={{
              boxShadow:
                "0 18px 30px -16px rgba(15, 23, 42, 0.28), 0 6px 10px -6px rgba(15, 23, 42, 0.08)",
              containerType: "inline-size",
            }}
          >
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
              style={{
                backgroundColor: bg,
              }}
            >
              <Icon
                size={16}
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div
                className="truncate text-gray-500"
                style={{
                  fontSize: "11px",
                }}
              >
                {label}
              </div>

              <div
                className="mt-0.5 truncate font-bold text-gray-900"
                style={{
                  fontSize: "clamp(13px, 8cqw, 17px)",
                }}
                title={value}
              >
                {value}
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

