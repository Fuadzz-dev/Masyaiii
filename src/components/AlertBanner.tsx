import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { SensorStatus } from "../hooks/useSensorData";

interface AlertBannerProps {
  status: SensorStatus;
}

const labelMap: Record<keyof SensorStatus, string> = {
  airHumidity: "Kelembapan Udara",
  soilHumidity: "Kelembapan Tanah",
  temperature: "Suhu Ruang",
  light: "Cahaya",
};

export default function AlertBanner({ status }: AlertBannerProps) {
  const dangers = Object.entries(status).filter(([, v]) => v === "danger");
  const warnings = Object.entries(status).filter(([, v]) => v === "warning");

  if (dangers.length === 0 && warnings.length === 0) {
    return (
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
        <CheckCircle className="text-emerald-400 shrink-0" size={18} />
        <p className="text-sm text-emerald-300 font-medium">
          Semua sensor dalam kondisi normal
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {dangers.map(([key]) => (
        <div
          key={key}
          className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
        >
          <XCircle className="text-red-400 shrink-0" size={18} />
          <p className="text-sm text-red-300 font-medium">
            ⚠️ <strong>{labelMap[key as keyof SensorStatus]}</strong> berada di tingkat berbahaya!
          </p>
        </div>
      ))}
      {warnings.map(([key]) => (
        <div
          key={key}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
        >
          <AlertTriangle className="text-amber-400 shrink-0" size={18} />
          <p className="text-sm text-amber-300 font-medium">
            ⚡ <strong>{labelMap[key as keyof SensorStatus]}</strong> memerlukan perhatian
          </p>
        </div>
      ))}
    </div>
  );
}
