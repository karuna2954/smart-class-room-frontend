
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function SensorHistory() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchHistory() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/sensors/history?limit=50`
        );

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error("Could not load sensor history.");
        }

        if (active) {
          const chartData = (result.data || [])
            .slice()
            .reverse()
            .map((reading) => ({
              time: new Date(reading.recordedAt).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit", second: "2-digit" }
              ),
              temperature: Number(reading.temperature),
              humidity: Number(reading.humidity),
              lightLevel: Number(reading.lightLevel),
              gasLevel: Number(reading.gasLevel),
            }));

          setReadings(chartData);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load history.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="mt-7 rounded-2xl border border-white/[0.08] bg-[#111722] p-5 md:p-6">
      <div className="mb-5">
        <h3 className="font-semibold text-white">Sensor history</h3>
        <p className="mt-1 text-sm text-slate-400">
          Latest saved readings from MongoDB
        </p>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">
          Loading sensor history…
        </p>
      ) : error ? (
        <p role="alert" className="py-10 text-center text-sm text-rose-300">
          {error}
        </p>
      ) : readings.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          No saved readings yet.
        </p>
      ) : (
        <div className="grid gap-8">
          {[
            { key: "temperature", label: "Temperature", color: "#f59e0b", unit: "°C" },
            { key: "humidity", label: "Humidity", color: "#38bdf8", unit: "%" },
            { key: "lightLevel", label: "Light level", color: "#a78bfa", unit: "" },
            { key: "gasLevel", label: "Gas level", color: "#fb7185", unit: "" },
          ].map((sensor) => (
            <div key={sensor.key}>
              <p className="mb-3 text-sm text-slate-300">
                {sensor.label} {sensor.unit && `(${sensor.unit})`}
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid
                      stroke="#293241"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      minTickGap={30}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0d111a",
                        border: "1px solid #293241",
                        borderRadius: 10,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={sensor.key}
                      name={sensor.label}
                      stroke={sensor.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
