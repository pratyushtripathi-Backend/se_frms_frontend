import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Bell } from "lucide-react";
import { fraudDetectTypeData } from "./FraudDetectTypeData";


const total = fraudDetectTypeData.reduce(
  (sum, d) => sum + d.value,
  0
);

export default function FraudDetectType() {
  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-brand-ink">
          Fraud Detect Type
        </h2>

        <div className="grid h-8 w-8 place-items-center rounded-full border border-brand-redSoft text-brand-orange">
          <Bell size={15} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-[190px] w-[190px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fraudDetectTypeData}
                dataKey="value"
                innerRadius={58}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                paddingAngle={1.5}
                cornerRadius={0}
                stroke="#FFFFFF"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {fraudDetectTypeData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={d.color}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[20px] font-extrabold text-brand-ink">
                {total.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-brand-dim">
                Total
              </div>
            </div>
          </div>
        </div>

        <ul className="flex-1 space-y-2.5">
          {fraudDetectTypeData.map((d) => (
            <li
              key={d.name}
              className="flex items-center justify-between text-[13px]"
            >
              <span className="flex items-center gap-2 text-brand-ink">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </span>

              <span className="font-semibold text-brand-ink">
                {d.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}