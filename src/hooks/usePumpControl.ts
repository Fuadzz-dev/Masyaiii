import { useState, useEffect, useCallback } from "react";

export type PumpMode = "auto" | "manual";

export interface PumpState {
  is_active: boolean;
  mode: PumpMode;
  updated_at: string | null;
}

const PUMP_API = "http://localhost/Dashboard_Monitor_ESP32/api/pump-control.php";

export function usePumpControl() {
  const [pump, setPump] = useState<PumpState>({
    is_active: false,
    mode: "auto",
    updated_at: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling status pompa setiap 3 detik
  const fetchPump = useCallback(async () => {
    try {
      const res = await fetch(PUMP_API);
      if (!res.ok) throw new Error("Gagal membaca status pompa");
      const data: PumpState = await res.json();
      setPump(data);
    } catch (e) {
      console.error("Pump fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchPump();
    const interval = setInterval(fetchPump, 3000);
    return () => clearInterval(interval);
  }, [fetchPump]);

  // Toggle pompa ON/OFF (mode manual)
  const togglePump = useCallback(async () => {
    setLoading(true);
    setError(null);
    const newActive = !pump.is_active;
    try {
      const res = await fetch(PUMP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manual", is_active: newActive }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status pompa");
      const data = await res.json();
      setPump((prev) => ({ ...prev, is_active: data.is_active, mode: data.mode }));
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [pump.is_active]);

  // Set ke mode AUTO (ESP32 yang mengendalikan)
  const setAutoMode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PUMP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "auto", is_active: false }),
      });
      if (!res.ok) throw new Error("Gagal mengubah mode pompa");
      const data = await res.json();
      setPump((prev) => ({ ...prev, is_active: data.is_active, mode: data.mode }));
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  return { pump, loading, error, togglePump, setAutoMode };
}
