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
      if (value >= 50 && value <= 85) return "normal";
      if ((value >= 35 && value < 50) || (value > 85 && value <= 100)) return "warning";
      return "danger";
    case "soilHumidity":
      if (value >= 50 && value <= 85) return "normal";
      if ((value >= 35 && value < 50) || (value > 85 && value <= 100)) return "warning";
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

const API_URL = "http://localhost/Dashboard_Monitor_ESP32/api/get-data.php"; // Harap disesuaikan dengan URL server backend Anda

export function useSensorData() {
  const [history, setHistory] = useState<SensorReading[]>([
    {
      timestamp: new Date().toLocaleTimeString("id-ID"),
      airHumidity: 0,
      soilHumidity: 0,
      temperature: 0,
      light: 0,
    }
  ]);

  const [isLive, setIsLive] = useState(true);

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      
      const data: SensorReading[] = await response.json();
      
      // Update history hanya jika ada return data dari database
      if (data && data.length > 0) {
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  }, []);

  useEffect(() => {
    // Pengambilan data awal
    fetchSensorData();

    if (!isLive) return;
    
    // Polling ke server setiap 3 detik
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, [isLive, fetchSensorData]);

  const latest = history[history.length - 1] || {
      timestamp: "00:00:00",
      airHumidity: 0,
      soilHumidity: 0,
      temperature: 0,
      light: 0,
  };

  const status: SensorStatus = {
    airHumidity: getStatus(latest.airHumidity, "airHumidity"),
    soilHumidity: getStatus(latest.soilHumidity, "soilHumidity"),
    temperature: getStatus(latest.temperature, "temperature"),
    light: getStatus(latest.light, "light"),
  };

  return { history, latest, status, isLive, setIsLive };
}
