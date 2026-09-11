import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getDailyTransactionVolume } from "../services/analyticsService";
import { openDashboardDatePicker } from "./dashboardDatePicker";

const LINE = "#2582DA";
const GRID = "#E6E6E6";
const AXIS_TEXT = "#8B8B8B";
const INK = "#111827";
const DIM = "#6B7280";

// Same silent-poll pattern as StatCards.jsx - keeps the chart close to
// real-time without a full-page refresh, without hammering the backend.
const AUTO_REFRESH_INTERVAL_MS = 5000;

// How many days back to show when the user hasn't picked a specific date.
const DEFAULT_WINDOW_DAYS = 7;

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatAxisDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// Selecting a date shows the 7-day window ending on that date, rather than
// a single point, so the chart still reads as a trend.
function resolveRange(selectedDate) {
  const toDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - (DEFAULT_WINDOW_DAYS - 1));
  return { fromDate: toIsoDate(fromDate), toDate: toIsoDate(toDate) };
}

function normalizeVolumeResponse(responseData) {
  const payload = responseData?.responseData ?? responseData?.data ?? responseData ?? [];
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map((row) => ({
    date: formatAxisDate(row.date),
    value: Number(row.totalAmount ?? 0),
  }));
}

export default function TransactionMonitoring() {
  const [selectedDate, setSelectedDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const dateInputRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadVolume = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestIdRef.current;
    const { fromDate, toDate } = resolveRange(selectedDate);

    try {
      const response = await getDailyTransactionVolume({ fromDate, toDate });
      if (requestId !== requestIdRef.current) return;
      setChartData(normalizeVolumeResponse(response?.data));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      // A silent background refresh failing shouldn't wipe the last good
      // chart off the screen - only clear it if the very first load fails.
      if (!silent) {
        setChartData([]);
      }
      console.error("Failed to load daily transaction volume", err);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadVolume();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      loadVolume({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadVolume]);

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-4 shadow-card">
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between">
        <h2
          className="text-[14px] font-bold"
          style={{ color: INK }}
        >
          Transaction Monitoring
        </h2>

        <>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
            }}
          />

          <button
            type="button"
            onClick={(event) =>
              openDashboardDatePicker(dateInputRef.current, event.currentTarget)
            }
            className="flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[11.5px]"
            style={{
              borderColor: "#D9D9D9",
              color: DIM,
            }}
          >
            {selectedDate || "Select Date"}
            <CalendarDays size={13} />
          </button>
        </>
      </div>

      {/* Graph */}
      <div
        className="w-full"
        style={{
          height: "230px",
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 30,
              right: 12,
              left: 4,
              bottom: 24,
            }}
          >
            <defs>
              <linearGradient
                id="tmFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={LINE}
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor={LINE}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke={GRID}
              strokeWidth={1}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              height={56}
              interval={0}
              tickMargin={10}
              axisLine={{
                stroke: GRID,
                strokeWidth: 1,
              }}
              tickLine={false}
              tick={{
                fontSize: 9.5,
                fill: AXIS_TEXT,
                angle: -35,
                textAnchor: "end",
              }}
            />

            <YAxis
              width={44}
              tickFormatter={(v) =>
                v === 0 ? "0" : `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`
              }
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: AXIS_TEXT,
              }}
            />

            <Tooltip
              formatter={(v) => [
                Number(v).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }),
                "Total Amount",
              ]}
              contentStyle={{
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
            />

            <Area
              type="linear"
              dataKey="value"
              stroke={LINE}
              strokeWidth={2.5}
              fill="url(#tmFill)"
              activeDot={{
                r: 5,
                fill: LINE,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
