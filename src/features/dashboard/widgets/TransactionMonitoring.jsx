
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
import { openDashboardDatePicker } from "../utils/dashboardDatePicker";

const LINE = "#2582DA";
const GRID = "#E6E6E6";
const AXIS_TEXT = "#8B8B8B";
const INK = "#111827";
const DIM = "#6B7280";

const AUTO_REFRESH_INTERVAL_MS = 5000;

const PERIOD_OPTIONS = [
  { label: "Day", value: "DAY" },
  { label: "Week", value: "WEEK" },
  { label: "Month", value: "MONTH" },
  { label: "Quarter", value: "QUARTER" },
  { label: "Half Year", value: "HALF_YEAR" },
  { label: "Year", value: "YEAR" },
];

// Format date using local year, month and day.
function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Format daily date for Week and Month.
function formatAxisDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

// Calculate selected period's date range.
function resolveRange(period, selectedDate) {
  const toDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : new Date();

  const fromDate = new Date(toDate);

  switch (period) {
    case "DAY":
      break;

    case "WEEK":
      fromDate.setDate(fromDate.getDate() - 6);
      break;

    case "MONTH":
      fromDate.setDate(fromDate.getDate() - 29);
      break;

    case "QUARTER":
      fromDate.setDate(fromDate.getDate() - 89);
      break;

    case "HALF_YEAR":
      fromDate.setDate(fromDate.getDate() - 181);
      break;

    case "YEAR":
      fromDate.setDate(fromDate.getDate() - 364);
      break;

    default:
      fromDate.setDate(fromDate.getDate() - 6);
  }

  return {
    fromDate: toIsoDate(fromDate),
    toDate: toIsoDate(toDate),
  };
}

// Format monthly labels.
function formatMonth(date) {
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

// Format quarterly labels.
function formatQuarter(date) {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

// Prepare graph data according to selected period.
function normalizeVolumeResponse(responseData, period) {
  const payload =
    responseData?.responseData ??
    responseData?.data ??
    responseData ??
    [];

  const rows = Array.isArray(payload) ? payload : [];

  // Day, Week and Month: show daily dates.
  if (
    period === "DAY" ||
    period === "WEEK" ||
    period === "MONTH"
  ) {
    return rows
      .map((row) => ({
        date: formatAxisDate(row.date),
        value: Number(row.totalAmount ?? 0),
        sortDate: new Date(`${row.date}T00:00:00`).getTime(),
      }))
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(({ date, value }) => ({ date, value }));
  }

  // Quarter: group daily records by calendar quarter.
  // Half Year and Year: group daily records by month.
  const groupedData = new Map();

  rows.forEach((row) => {
    const date = new Date(`${row.date}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    let key;
    let label;

    if (period === "QUARTER") {
      const quarter = Math.floor(date.getMonth() / 3) + 1;

      key = `${date.getFullYear()}-Q${quarter}`;
      label = formatQuarter(date);
    } else {
      const month = String(date.getMonth() + 1).padStart(2, "0");

      key = `${date.getFullYear()}-${month}`;
      label = formatMonth(date);
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, {
        date: label,
        value: 0,
        sortDate: date.getTime(),
      });
    }

    const group = groupedData.get(key);
    group.value += Number(row.totalAmount ?? 0);
  });

  return Array.from(groupedData.values())
    .sort((a, b) => a.sortDate - b.sortDate)
    .map(({ date, value }) => ({ date, value }));
}

export default function TransactionMonitoring() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("WEEK");

  const [chartData, setChartData] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const dateInputRef = useRef(null);
  const requestIdRef = useRef(0);

  // Load transaction volume based on selected date and period.
  const loadVolume = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestIdRef.current;

      const { fromDate, toDate } = resolveRange(
        selectedPeriod,
        selectedDate
      );

      try {
        const response = await getDailyTransactionVolume({
          fromDate,
          toDate,
        });

        // Ignore outdated responses.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setChartData(
          normalizeVolumeResponse(
            response?.data,
            selectedPeriod
          )
        );

        setHasLoaded(true);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setHasLoaded(true);

        // Keep last successful chart during silent refresh failures.
        if (!silent) {
          setChartData([]);
        }

        console.error(
          "Failed to load daily transaction volume",
          err
        );
      }
    },
    [selectedPeriod, selectedDate]
  );

  // Initial load and automatic refresh.
  useEffect(() => {
    loadVolume();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") {
        return;
      }

      loadVolume({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);

      // Invalidate requests belonging to previous selection.
      requestIdRef.current += 1;
    };
  }, [loadVolume]);

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-4 shadow-card">

      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

        <h2
          className="text-[14px] font-bold"
          style={{ color: INK }}
        >
          Transaction Monitoring
        </h2>

        <div className="flex flex-wrap items-center gap-2">

          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) =>
              setSelectedPeriod(e.target.value)
            }
            className="rounded-lg border bg-white px-2.5 py-1.5 text-[11.5px] outline-none cursor-pointer"
            style={{
              borderColor: "#D9D9D9",
              color: DIM,
            }}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            max={toIsoDate(new Date())}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
            }}
          />

          <button
            type="button"
            onClick={(event) =>
              openDashboardDatePicker(
                dateInputRef.current,
                event.currentTarget
              )
            }
            className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11.5px] hover:bg-gray-50"
            style={{
              borderColor: "#D9D9D9",
              color: DIM,
            }}
          >
            {selectedDate || "Select Date"}

            <CalendarDays size={13} />
          </button>

          {/* Clear Date */}
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="text-[11px] font-medium hover:underline"
              style={{ color: LINE }}
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Graph */}
      <div
        className="relative w-full"
        style={{
          height: "230px",
        }}
      >
        {!hasLoaded && (
          <div className="absolute inset-0 z-[1] bg-white p-2">
            <span className="frms-skeleton h-full w-full" />
          </div>
        )}

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
              interval="preserveStartEnd"
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
              tickFormatter={(value) =>
                value === 0
                  ? "0"
                  : `${(
                      value / 1000
                    ).toFixed(
                      value % 1000 === 0 ? 0 : 1
                    )}K`
              }
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: AXIS_TEXT,
              }}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString("en-IN", {
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
