import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SensorReading } from "../hooks/useSensorData";

interface SensorChartProps {
  data: SensorReading[];
  activeChart: "all" | "airHumidity" | "soilHumidity" | "temperature" | "light";
}

const chartLines = [
  {
    key: "airHumidity",
    name: "Kelembapan Udara (%)",
    color: "#38bdf8",
    yDomain: [0, 100] as [number, number],
  },
  {
    key: "soilHumidity",
    name: "Kelembapan Tanah (%)",
    color: "#34d399",
    yDomain: [0, 100] as [number, number],
  },
  {
    key: "temperature",
    name: "Suhu Ruang (°C)",
    color: "#f97316",
    yDomain: [0, 50] as [number, number],
  },
  {
    key: "light",
    name: "Cahaya (lux)",
    color: "#facc15",
    yDomain: [0, 1200] as [number, number],
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>
              {Number(entry.value).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SensorChart({ data, activeChart }: SensorChartProps) {
  const visibleLines =
    activeChart === "all"
      ? chartLines
      : chartLines.filter((l) => l.key === activeChart);

  const yDomain =
    activeChart === "all" ? [0, 1200] : visibleLines[0]?.yDomain ?? [0, 100];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#1e293b" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yDomain}
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#1e293b" }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "8px" }}
          />
          {visibleLines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
