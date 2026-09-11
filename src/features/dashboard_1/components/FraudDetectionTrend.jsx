import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getFraudTrend } from "../services/analyticsService";

const RED = "#F0424F";
const BLUE = "#4C7EF3";

// Same silent-poll pattern as StatCards.jsx / TransactionMonitoring.jsx -
// keeps the chart close to real-time without hammering the backend.
const AUTO_REFRESH_INTERVAL_MS = 5000;

const GROUP_BY_OPTIONS = [
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
  { label: "Year", value: "year" },
];

function normalizeTrendResponse(responseData) {
  const payload = responseData?.responseData ?? responseData?.data ?? responseData ?? [];
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map((row) => ({
    period: row.period,
    fraudAlertCount: Number(row.fraudAlertCount ?? 0),
    blockedCount: Number(row.blockedCount ?? 0),
  }));
}

export default function FraudDetectionTrend() {
  const [activeSeries, setActiveSeries] = useState("fraud");
  const [groupBy, setGroupBy] = useState("month");
  const [chartData, setChartData] = useState([]);
  const requestIdRef = useRef(0);

  const loadTrend = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestIdRef.current;

    try {
      const response = await getFraudTrend({ groupBy });
      if (requestId !== requestIdRef.current) return;
      setChartData(normalizeTrendResponse(response?.data));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      // A silent background refresh failing shouldn't wipe the last good
      // chart off the screen - only clear it if the very first load fails.
      if (!silent) {
        setChartData([]);
      }
      console.error("Failed to load fraud trend", err);
    }
  }, [groupBy]);

  useEffect(() => {
    loadTrend();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      loadTrend({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadTrend]);

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-4 shadow-card">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-brand-ink">
          Fraud Detection Trend
        </h2>

        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="rounded-lg border border-brand-border px-2.5 py-1 text-[11.5px] text-brand-ink outline-none"
        >
          {GROUP_BY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="mb-2 mt-1.5 flex gap-2 text-[11.5px]">
        <button
          type="button"
          onClick={() => setActiveSeries("fraud")}
          className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
            activeSeries === "fraud"
              ? "bg-[#1A1A1A] text-white"
              : "bg-[#EFEFEF] text-[#6B7280]"
          }`}
        >
          Fraud Alert
        </button>

        <button
          type="button"
          onClick={() => setActiveSeries("blocked")}
          className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
            activeSeries === "blocked"
              ? "bg-[#1A1A1A] text-white"
              : "bg-[#EFEFEF] text-[#6B7280]"
          }`}
        >
          Block Transaction
        </button>
      </div>

      {/* Chart */}
      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 8,
              right: 6,
              left: 6,
              bottom: 0,
            }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              stroke="#E6E6E6"
              vertical={true}
              strokeWidth={1}
            />

            <XAxis
              dataKey="period"
              padding={{
                left: 0,
                right: 0,
              }}
              tick={{
                fontSize: 10,
                fill: "#8A90A2",
              }}
              tickMargin={8}
              axisLine={{
                stroke: "#E6E6E6",
              }}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 10,
                fill: "#8A90A2",
              }}
              tickMargin={6}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(v, name) => [
                v,
                name === "fraudAlertCount" ? "Fraud Alert" : "Blocked Transaction",
              ]}
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #ECEEF3",
                fontSize: 12,
              }}
            />

            <Bar
              dataKey="fraudAlertCount"
              fill={RED}
              barSize={16}
              radius={0}
              hide={activeSeries === "blocked"}
            />

            <Bar
              dataKey="blockedCount"
              fill={BLUE}
              barSize={16}
              radius={0}
              hide={activeSeries === "fraud"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
