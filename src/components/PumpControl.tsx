import { Power, Zap, RefreshCw, AlertCircle, Cpu } from "lucide-react";
import type { PumpState } from "../hooks/usePumpControl";

interface PumpControlProps {
  pump: PumpState;
  loading: boolean;
  error: string | null;
  onToggle: () => void;
  onSetAuto: () => void;
}

export default function PumpControl({
  pump,
  loading,
  error,
  onToggle,
  onSetAuto,
}: PumpControlProps) {
  const isManual = pump.mode === "manual";
  const isOn = pump.is_active;

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className={`p-2 rounded-lg transition-all duration-300 ${
            isOn
              ? "bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              : "bg-slate-700/50"
          }`}
        >
          <Zap
            size={18}
            className={`transition-colors duration-300 ${
              isOn ? "text-cyan-400" : "text-slate-500"
            }`}
          />
        </div>
        <h2 className="text-base font-bold text-white">Kontrol Pompa Air</h2>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-5">
        {/* Status On/Off */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
            isOn
              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
              : "bg-slate-700/50 border-slate-600/50 text-slate-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOn ? "bg-cyan-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          {isOn ? "MENYALA" : "MATI"}
        </div>

        {/* Mode Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
            isManual
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
          }`}
        >
          <Cpu size={11} />
          {isManual ? "Mode Manual" : "Mode Otomatis"}
        </div>
      </div>

      {/* Visual Pump Indicator */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-700 ${
              isOn
                ? "animate-ping bg-cyan-400/20"
                : "bg-transparent"
            }`}
            style={{ animationDuration: "2s" }}
          />
          {/* Main circle */}
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              isOn
                ? "bg-cyan-500/20 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                : "bg-slate-800/60 border-slate-600/50"
            }`}
          >
            <Power
              size={36}
              className={`transition-all duration-300 ${
                isOn ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "text-slate-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 mb-4 text-xs text-red-400">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        {/* Toggle ON/OFF Manual */}
        <button
          id="pump-toggle-btn"
          onClick={onToggle}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
            isOn
              ? "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
              : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
          }`}
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Power size={15} />
          )}
          {loading
            ? "Memproses..."
            : isOn
            ? "Matikan Pompa"
            : "Nyalakan Pompa (Manual)"}
        </button>

        {/* Set Auto Mode */}
        {isManual && (
          <button
            id="pump-auto-btn"
            onClick={onSetAuto}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cpu size={13} />
            Kembalikan ke Mode Otomatis
          </button>
        )}
      </div>

      {/* Last updated */}
      <div className="mt-auto pt-4">
        {pump.updated_at && (
          <p className="text-center text-xs text-slate-600">
            Diperbarui: {new Date(pump.updated_at).toLocaleTimeString("id-ID")}
          </p>
        )}
      </div>
    </div>
  );
}
