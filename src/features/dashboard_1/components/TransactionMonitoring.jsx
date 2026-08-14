import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Dot,
} from "recharts";
import { useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { transactionMonitoringData } from "./TransactionMonitoringData";
import { openDashboardDatePicker } from "./dashboardDatePicker";

const LINE = "#2582DA";
const FLAG = "#FF3F2F";
const GRID = "#E6E6E6";
const AXIS_TEXT = "#8B8B8B";
const INK = "#111827";
const DIM = "#6B7280";

function FlaggedDot(props) {
  const { cx, cy, payload } = props;

  if (!payload.flagged) return null;

  return (
    <g>
      <foreignObject
        x={cx - 72}
        y={cy - 64}
        width={144}
        height={36}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            background: FLAG,
            color: "#fff",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 10px rgba(0,0,0,.18)",
          }}
        >
          Suspected Fraud

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -6,
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `6px solid ${FLAG}`,
            }}
          />
        </div>
      </foreignObject>

      <Dot
        cx={cx}
        cy={cy}
        r={5}
        fill="#fff"
        stroke={FLAG}
        strokeWidth={3}
      />
    </g>
  );
}

export default function TransactionMonitoring() {
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef(null);

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-5 shadow-card">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h2
          className="text-[15px] font-bold"
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
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12.5px]"
            style={{
              borderColor: "#D9D9D9",
              color: DIM,
            }}
          >
            {selectedDate || "Select Date"}
            <CalendarDays size={14} />
          </button>
        </>
      </div>

      {/* Graph */}
      <div
        className="w-full"
        style={{
          height: "360px",
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={transactionMonitoringData}
            margin={{
              top: 36,
              right: 16,
              left: 8,
              bottom: 40,
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
              height={86}
              interval={0}
              tickMargin={18}
              axisLine={{
                stroke: GRID,
                strokeWidth: 1,
              }}
              tickLine={false}
              tick={{
                fontSize: 10.5,
                fill: AXIS_TEXT,
                angle: -35,
                textAnchor: "end",
              }}
            />

            <YAxis
              width={42}
              domain={[0, 6000]}
              ticks={[
                0,
                1000,
                2000,
                3000,
                4000,
                5000,
                6000,
              ]}
              tickFormatter={(v) =>
                v === 0 ? "0" : `${v / 1000}K`
              }
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: AXIS_TEXT,
              }}
            />

            <Tooltip
              formatter={(v) => [v, "Transactions"]}
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
              dot={<FlaggedDot />}
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
