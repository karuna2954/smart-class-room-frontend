
import { useEffect, useState } from "react";
import {
  Activity,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  ShieldCheck,
  Users,
} from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://smart-class-room-backend-ic69.onrender.com";

const initialState = {
  temperature: null,
  humidity: null,
  motionDetected: false,
  lightLevel: null,
  gasLevel: null,
  gasAlert: false,
};

const sensors = [
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    subtitle: "Room temperature",
    icon: Thermometer,
    color: "#C6F36B",
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    subtitle: "Air humidity",
    icon: Droplets,
    color: "#70D6FF",
  },
  {
    key: "motionDetected",
    label: "Motion",
    unit: "",
    subtitle: "Motion sensor",
    icon: Users,
    color: "#FFD166",
  },
  {
    key: "lightLevel",
    label: "Light level",
    unit: "",
    subtitle: "Light intensity",
    icon: Sun,
    color: "#FFD166",
  },
  {
    key: "gasLevel",
    label: "Gas level",
    unit: "",
    subtitle: "Gas sensor reading",
    icon: Wind,
    color: "#C6F36B",
  },
  {
    key: "gasAlert",
    label: "Safety",
    unit: "",
    subtitle: "Gas monitoring status",
    icon: ShieldCheck,
    color: "#FF7777",
  },
];

function getDisplayValue(key, data) {
  switch (key) {
    case "temperature":
    case "humidity":
    case "lightLevel":
    case "gasLevel":
      return data[key] == null ? "--" : data[key];

    case "motionDetected":
      return data.motionDetected ? "Detected" : "Clear";

    case "gasAlert":
      return data.gasAlert ? "Alert" : "Secure";

    default:
      return "--";
  }
}

export default function SensorPage() {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/sensors/current`
        );

        if (!response.ok) {
          throw new Error(`Request failed (HTTP ${response.status})`);
        }

        const result = await response.json();

        if (result.success === false) {
          throw new Error(
            result.message || "Could not load sensor data."
          );
        }

        // Support both { success: true, data: {...} }
        // and a direct sensor object response.
        const data = result.data ?? result;

        if (active) {
          setState((previous) => ({
            ...previous,
            ...data,
          }));
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load sensors.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
    <section className="mt-7">
      <div className="mb-7">
        <p className="text-sm text-slate-500">
          Workspace / Sensors
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-white">
          Sensor monitoring
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Current readings reported by your backend.
        </p>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-slate-400">
          Loading sensor readings…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300"
        >
          Unable to update sensors: {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sensors.map((sensor) => {
          const Icon = sensor.icon;
          const value = getDisplayValue(sensor.key, state);

          const subtitle =
            sensor.key === "gasAlert"
              ? state.gasAlert
                ? "Check gas levels"
                : "No gas alert reported"
              : sensor.key === "motionDetected"
                ? state.motionDetected
                  ? "Movement detected"
                  : "No movement reported"
                : sensor.subtitle;

          return (
            <article
              key={sensor.key}
              className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 transition hover:border-white/20"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${sensor.color}18`,
                  color: sensor.color,
                }}
              >
                <Icon size={22} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                {sensor.label}
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {value}
                {sensor.unit && (
                  <span className="ml-1 text-base font-normal text-slate-400">
                    {sensor.unit}
                  </span>
                )}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                <Activity size={13} className="mr-1 inline" />
                {subtitle}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Auto-refreshes every 10 seconds
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
