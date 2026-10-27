
import { useEffect, useState } from "react";
import { Activity, Droplets, Sun, Thermometer, Wind } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const sensors = [
  { key: "temperature", label: "Temperature", unit: "°C", icon: Thermometer },
  { key: "humidity", label: "Humidity", unit: "%", icon: Droplets },
  { key: "lightLevel", label: "Light level", unit: "", icon: Sun },
  { key: "gasLevel", label: "Gas level", unit: "", icon: Wind },
];

export default function SensorPage() {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/sensors/current`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (!result.success) throw new Error("Could not load sensor data.");

        if (active) {
          setState(result.data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load sensors.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section>
      <div className="mb-7">
        <p className="text-sm text-slate-500">Workspace / Sensors</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Sensor monitoring
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Current readings reported by your backend.
        </p>
      </div>

      {loading && <p className="text-slate-400">Loading readings…</p>}
      {error && <p role="alert" className="text-rose-300">{error}</p>}

      {state && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sensors.map(({ key, label, unit, icon: Icon }) => (
            <article
              key={key}
              className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5"
            >
              <Icon size={22} className="text-cyan-300" />
              <p className="mt-5 text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {state[key] ?? "--"}
                <span className="ml-1 text-base font-normal text-slate-400">
                  {unit}
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-500">
                <Activity size={13} className="mr-1 inline" />
                Auto-refreshes every 10 seconds
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
