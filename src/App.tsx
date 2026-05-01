import { useState } from "react";
import {
  Droplets,
  Sprout,
  Thermometer,
  Sun,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import { useSensorData } from "./hooks/useSensorData";
import { usePumpControl } from "./hooks/usePumpControl";
import StatCard from "./components/StatCard";
import SensorChart from "./components/SensorChart";
import GaugeCard from "./components/GaugeCard";
import AlertBanner from "./components/AlertBanner";
import PumpControl from "./components/PumpControl";

type ChartFilter = "all" | "airHumidity" | "soilHumidity" | "temperature" | "light";

const chartFilters: { key: ChartFilter; label: string; color: string }[] = [
  { key: "all", label: "Semua", color: "bg-slate-600" },
  { key: "airHumidity", label: "Kelembapan Udara", color: "bg-sky-500" },
  { key: "soilHumidity", label: "Kelembapan Tanah", color: "bg-emerald-500" },
  { key: "temperature", label: "Suhu", color: "bg-orange-500" },
  { key: "light", label: "Cahaya", color: "bg-yellow-500" },
];

export default function App() {
  const { history, latest, status, isLive, setIsLive } = useSensorData();
  const { pump, loading: pumpLoading, error: pumpError, togglePump, setAutoMode } = usePumpControl();
  const [activeChart, setActiveChart] = useState<ChartFilter>("all");

  const now = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sensors = [
    {
      key: "airHumidity" as const,
      title: "Kelembapan Udara",
      value: latest.airHumidity,
      unit: "%",
      icon: <Droplets size={20} />,
      color: "bg-sky-500",
      min: 0,
      max: 100,
      description: "Rentang ideal: 40% – 70% RH untuk kenyamanan ruangan",
    },
    {
      key: "soilHumidity" as const,
      title: "Kelembapan Tanah",
      value: latest.soilHumidity,
      unit: "%",
      icon: <Sprout size={20} />,
      color: "bg-emerald-500",
      min: 0,
      max: 100,
      description: "Rentang ideal: 50% – 80% untuk pertumbuhan tanaman optimal",
    },
    {
      key: "temperature" as const,
      title: "Suhu Ruang",
      value: latest.temperature,
      unit: "°C",
      icon: <Thermometer size={20} />,
      color: "bg-orange-500",
      min: 0,
      max: 50,
      description: "Rentang ideal: 18°C – 28°C untuk kenyamanan termal",
    },
    {
      key: "light" as const,
      title: "Intensitas Cahaya",
      value: latest.light,
      unit: "lux",
      icon: <Sun size={20} />,
      color: "bg-yellow-500",
      min: 0,
      max: 1200,
      description: "Rentang ideal: 300 – 800 lux untuk aktivitas dalam ruangan",
    },
  ];

  const gauges = [
    {
      value: latest.airHumidity,
      min: 0,
      max: 100,
      title: "Kelembapan Udara",
      unit: "%",
      color: "#38bdf8",
      trackColor: "#0f2231",
    },
    {
      value: latest.soilHumidity,
      min: 0,
      max: 100,
      title: "Kelembapan Tanah",
      unit: "%",
      color: "#34d399",
      trackColor: "#0c2018",
    },
    {
      value: latest.temperature,
      min: 0,
      max: 50,
      title: "Suhu Ruang",
      unit: "°C",
      color: "#f97316",
      trackColor: "#2a1505",
    },
    {
      value: latest.light,
      min: 0,
      max: 1200,
      title: "Intensitas Cahaya",
      unit: "lux",
      color: "#facc15",
      trackColor: "#2a2205",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-sky-500/20 rounded-lg">
                <Activity className="text-sky-400" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Dashboard Monitor Lingkungan
              </h1>
            </div>
            <p className="text-sm text-slate-500 ml-11">{now}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Last update */}
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2">
              <RefreshCw
                size={13}
                className={`text-slate-400 ${isLive ? "animate-spin" : ""}`}
                style={{ animationDuration: "3s" }}
              />
              <span className="text-xs text-slate-400">
                Update: {latest.timestamp}
              </span>
            </div>

            {/* Live toggle */}
            <button
              onClick={() => setIsLive((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                isLive
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {isLive ? (
                <>
                  <Wifi size={14} />
                  Live
                </>
              ) : (
                <>
                  <WifiOff size={14} />
                  Paused
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="mb-6">
          <AlertBanner status={status} />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {sensors.map((s) => (
            <StatCard
              key={s.key}
              title={s.title}
              value={s.value}
              unit={s.unit}
              icon={s.icon}
              status={status[s.key]}
              min={s.min}
              max={s.max}
              description={s.description}
              color={s.color}
            />
          ))}
        </div>

        {/* Middle row: Chart */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-sky-400" size={18} />
              <h2 className="text-base font-bold text-white">
                Grafik Sensor Real-time
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {chartFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveChart(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeChart === f.key
                      ? `${f.color} text-white shadow-sm`
                      : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <SensorChart data={history} activeChart={activeChart} />
        </div>

        {/* Bottom row: Gauges + Pump */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Gauges */}
          <div className="xl:col-span-2 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col h-full">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2 flex-shrink-0">
              <Activity className="text-emerald-400" size={18} />
              Indikator Gauge
            </h2>
            <div className="flex-grow flex flex-col justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {gauges.map((g) => (
                  <GaugeCard key={g.title} {...g} />
                ))}
              </div>
            </div>
          </div>

          {/* Pump Control */}
          <PumpControl
            pump={pump}
            loading={pumpLoading}
            error={pumpError}
            onToggle={togglePump}
            onSetAuto={setAutoMode}
          />
        </div>

        {/* Data table */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="text-slate-400" size={16} />
            Riwayat Data Terbaru
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/60">
                  <th className="pb-3 pr-4">Waktu</th>
                  <th className="pb-3 pr-4">Kelembapan Udara</th>
                  <th className="pb-3 pr-4">Kelembapan Tanah</th>
                  <th className="pb-3 pr-4">Suhu Ruang</th>
                  <th className="pb-3">Cahaya</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().slice(0, 10).map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-800/60 ${
                      i === 0 ? "bg-sky-500/5" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">
                      {row.timestamp}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-sky-400 font-semibold">
                        {row.airHumidity.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-emerald-400 font-semibold">
                        {row.soilHumidity.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-orange-400 font-semibold">
                        {row.temperature.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-yellow-400 font-semibold">
                        {row.light.toFixed(0)} lux
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600">
          Dashboard Monitor Lingkungan • Data diperbarui setiap 3 detik •{" "}
          {history.length} data tercatat
        </div>
      </div>
    </div>
  );
}
