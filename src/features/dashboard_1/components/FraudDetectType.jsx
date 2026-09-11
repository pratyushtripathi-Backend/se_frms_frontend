import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTransactionsByChannel } from "../services/analyticsService";

// Cycled by index rather than mapped by channel name, since channel values
// come straight from whatever transaction-service was actually sent - not
// a fixed enum - so this renders correctly no matter what channels exist.
const CHANNEL_COLORS = [
  "#4C7EF3",
  "#F97316",
  "#E7202D",
  "#22C55E",
  "#FBBF24",
  "#8B5CF6",
  "#14B8A6",
  "#EC4899",
];

// Same silent-poll pattern as StatCards.jsx.
const AUTO_REFRESH_INTERVAL_MS = 5000;

function normalizeChannelResponse(responseData) {
  const payload = responseData?.responseData ?? responseData?.data ?? responseData ?? [];
  const rows = Array.isArray(payload) ? payload : [];
  return rows
    .map((row, index) => ({
      name: row.channel || "Unknown",
      value: Number(row.transactionCount ?? 0),
      color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export default function FraudDetectType() {
  const [channelData, setChannelData] = useState([]);
  const requestIdRef = useRef(0);

  const loadChannels = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestIdRef.current;

    try {
      const response = await getTransactionsByChannel();
      if (requestId !== requestIdRef.current) return;
      setChannelData(normalizeChannelResponse(response?.data));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (!silent) {
        setChannelData([]);
      }
      console.error("Failed to load transactions by channel", err);
    }
  }, []);

  useEffect(() => {
    loadChannels();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      loadChannels({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadChannels]);

  const total = channelData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-card border border-brand-border bg-brand-panel p-4 shadow-card">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-brand-ink">
          Fraud Detect Type
        </h2>

        <div className="grid h-7 w-7 place-items-center rounded-full border border-brand-redSoft text-brand-orange">
          <Bell size={13} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-[140px] w-[140px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                dataKey="value"
                innerRadius={42}
                outerRadius={68}
                startAngle={90}
                endAngle={-270}
                paddingAngle={1.5}
                cornerRadius={0}
                stroke="#FFFFFF"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {channelData.map((d) => (
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
              <div className="text-[16px] font-extrabold text-brand-ink">
                {total.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-brand-dim">
                Total
              </div>
            </div>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5">
          {channelData.length === 0 && (
            <li className="text-[11px] text-brand-dim">No transactions yet.</li>
          )}

          {channelData.map((d) => (
            <li
              key={d.name}
              className="flex items-center justify-between text-[11.5px]"
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
