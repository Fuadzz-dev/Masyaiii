import { useState, useEffect, useCallback } from "react";

export interface SensorReading {
  timestamp: string;
  airHumidity: number;
  soilHumidity: number;
  temperature: number;
  light: number;
}

export interface SensorStatus {
  airHumidity: "normal" | "warning" | "danger";
  soilHumidity: "normal" | "warning" | "danger";
  temperature: "normal" | "warning" | "danger";
  light: "normal" | "warning" | "danger";
}

function getStatus(
  value: number,
  type: "airHumidity" | "soilHumidity" | "temperature" | "light"
): "normal" | "warning" | "danger" {
  switch (type) {
    case "airHumidity":
      if (value >= 40 && value <= 70) return "normal";
      if ((value >= 30 && value < 40) || (value > 70 && value <= 80)) return "warning";
      return "danger";
    case "soilHumidity":
      if (value >= 50 && value <= 80) return "normal";
      if ((value >= 30 && value < 50) || (value > 80 && value <= 90)) return "warning";
      return "danger";
    case "temperature":
      if (value >= 18 && value <= 28) return "normal";
      if ((value >= 15 && value < 18) || (value > 28 && value <= 35)) return "warning";
      return "danger";
    case "light":
      if (value >= 300 && value <= 800) return "normal";
      if ((value >= 100 && value < 300) || (value > 800 && value <= 1000)) return "warning";
      return "danger";
    default:
      return "normal";
  }
}

function generateReading(prev?: SensorReading): SensorReading {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const jitter = (base: number, range: number) =>
    base + (Math.random() - 0.5) * range;

  if (!prev) {
    return {
      timestamp: timeStr,
      airHumidity: clamp(jitter(60, 20), 20, 95),
      soilHumidity: clamp(jitter(65, 20), 10, 100),
      temperature: clamp(jitter(25, 10), 10, 45),
      light: clamp(jitter(500, 400), 0, 1200),
    };
  }

  return {
    timestamp: timeStr,
    airHumidity: clamp(jitter(prev.airHumidity, 4), 20, 95),
    soilHumidity: clamp(jitter(prev.soilHumidity, 4), 10, 100),
    temperature: clamp(jitter(prev.temperature, 1.5), 10, 45),
    light: clamp(jitter(prev.light, 60), 0, 1200),
  };
}

const MAX_HISTORY = 20;

export function useSensorData() {
  const [history, setHistory] = useState<SensorReading[]>(() => {
    const initial: SensorReading[] = [];
    let prev: SensorReading | undefined = undefined;
    for (let i = 0; i < MAX_HISTORY; i++) {
      const reading = generateReading(prev);
      // Backdate timestamps
      const d = new Date();
      d.setSeconds(d.getSeconds() - (MAX_HISTORY - i) * 3);
      reading.timestamp = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      initial.push(reading);
      prev = reading;
    }
    return initial;
  });

  const [isLive, setIsLive] = useState(true);

  const latest = history[history.length - 1];

  const status: SensorStatus = {
    airHumidity: getStatus(latest.airHumidity, "airHumidity"),
    soilHumidity: getStatus(latest.soilHumidity, "soilHumidity"),
    temperature: getStatus(latest.temperature, "temperature"),
    light: getStatus(latest.light, "light"),
  };

  const addReading = useCallback(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      const next = generateReading(last);
      return [...prev.slice(-MAX_HISTORY + 1), next];
    });
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(addReading, 3000);
    return () => clearInterval(interval);
  }, [isLive, addReading]);

  return { history, latest, status, isLive, setIsLive };
}
