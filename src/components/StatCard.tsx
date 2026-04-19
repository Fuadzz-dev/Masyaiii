import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: "normal" | "warning" | "danger";
  min: number;
  max: number;
  description: string;
  color: string;
}

const statusConfig = {
  normal: {
    label: "Normal",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  warning: {
    label: "Perhatian",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
  },
  danger: {
    label: "Bahaya",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    badge: "bg-red-500/20 text-red-300",
  },
};

export default function StatCard({
  title,
  value,
  unit,
  icon,
  status,
  min,
  max,
  description,
  color,
}: StatCardProps) {
  const cfg = statusConfig[status];
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div
      className={`relative rounded-2xl border ${cfg.border} ${cfg.bg} backdrop-blur-sm p-5 flex flex-col gap-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${color} text-white shadow-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-bold text-white">
                {typeof value === "number" ? value.toFixed(1) : value}
              </span>
              <span className="text-sm text-slate-400">{unit}</span>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge} flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
        <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              status === "normal"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : status === "warning"
                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : "bg-gradient-to-r from-red-500 to-red-400"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}
