import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

const data = [
  { month: "Jan", value: 60, type: "fraud" },
  { month: "Feb", value: 32, type: "fraud" },
  { month: "March", value: 18, type: "blocked" },
  { month: "April", value: 45, type: "fraud" },
  { month: "May", value: 45, type: "blocked" },
  { month: "June", value: 23, type: "fraud" },
  { month: "July", value: 36, type: "blocked" },
  { month: "Aug", value: 18, type: "fraud" },
  { month: "Sep", value: 29, type: "blocked" },
  { month: "Oct", value: 49, type: "fraud" },
  { month: "Nov", value: 49, type: "fraud" },
  { month: "Dec", value: 5, type: "fraud" },
];

const RED = "#F0424F";
const BLUE = "#4C7EF3";

export default function FraudDetectionTrend() {
  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-5 shadow-card">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-brand-ink">
          Fraud Detection Trend
        </h2>

        <select className="rounded-lg border border-brand-border px-3 py-1.5 text-[12.5px] text-brand-ink outline-none">
          <option>Month</option>
          <option>Quarter</option>
          <option>Year</option>
        </select>
      </div>

      {/* Legend */}
      <div className="mb-4 mt-2 flex gap-6 text-[13px] text-brand-ink">
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: RED }}
          />
          Fraud Alert
        </span>

        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: BLUE }}
          />
          Blocked Transaction
        </span>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 10,
              left: 10,
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
              dataKey="month"
              padding={{
                left: 0,
                right: 0,
              }}
              tick={{
                fontSize: 11.5,
                fill: "#8A90A2",
              }}
              tickMargin={10}
              axisLine={{
                stroke: "#E6E6E6",
              }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 60]}
              ticks={[0, 12, 30, 32, 45, 54, 60]}
              tick={{
                fontSize: 11,
                fill: "#8A90A2",
              }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(v, _n, item) => [
                v,
                item.payload.type === "fraud"
                  ? "Fraud Alert"
                  : "Blocked Transaction",
              ]}
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #ECEEF3",
                fontSize: 12,
              }}
            />

            <Bar
              dataKey="value"
              barSize={50}
              radius={0}
            >
              {data.map((item) => (
                <Cell
                  key={item.month}
                  fill={item.type === "fraud" ? RED : BLUE}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}