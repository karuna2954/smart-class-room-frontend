
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import { io } from "socket.io-client";
import {
  Activity,
  AirVent,
  Bell,
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Wifi,
  Menu,
  X,
  SlidersHorizontal,
  Zap,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

import SensorHistory from "./components/SensorHistory";
import ClassroomStatus from "./components/ClassroomStatus";
import SensorPage from "./pages/SensorPage";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const initialState = {
  temperature: "--",
  humidity: "--",
  motionDetected: false,
  lightLevel: "--",
  gasLevel: "--",
  gasAlert: false,
  leds: {
    led1: false,
    led2: false,
    led3: false,
    led4: false,
    led5: false,
    alertLed: false,
  },
};

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sensors", label: "Sensors", icon: Activity },
  { to: "/lighting", label: "Lighting", icon: Lightbulb },
  { to: "/safety", label: "Safety", icon: ShieldCheck },
  { to: "/automation", label: "Automation", icon: SlidersHorizontal },
];

const sensorCards = [
  { key: "temperature", label: "Temperature", unit: "°C", icon: Thermometer, color: "#f59e0b" },
  { key: "humidity", label: "Humidity", unit: "%", icon: Droplets, color: "#38bdf8" },
  { key: "lightLevel", label: "Light level", unit: "", icon: Sun, color: "#c4b5fd" },
  { key: "gasLevel", label: "Gas level", unit: "", icon: Wind, color: "#fb7185" },
];

function SensorCard({ sensor, value }) {
  const Icon = sensor.icon;

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${sensor.color}18`,
            color: sensor.color,
          }}
        >
          <Icon size={21} />
        </div>
        <Activity size={17} className="text-slate-600" />
      </div>
      <p className="mt-5 text-sm text-slate-400">{sensor.label}</p>
      <p className="mt-1 text-3xl font-semibold text-white">
        {value}
        <span className="ml-1 text-base font-normal text-slate-400">
          {sensor.unit}
        </span>
      </p>
      <p className="mt-3 text-xs text-slate-500">Live classroom reading</p>
    </article>
  );
}

function AppSidebar({ mobile = false, onNavigate }) {
  return (
    <aside
      className={`${
        mobile ? "w-full" : "hidden w-64 shrink-0 md:flex"
      } flex-col border-r border-white/[0.07] bg-[#0d111a] p-5`}
    >
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
          <BookOpen size={23} />
        </div>
        <div>
          <h1 className="font-semibold text-white">ClassroomIQ</h1>
          <p className="text-xs text-slate-500">Smart campus system</p>
        </div>
      </div>

      <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Workspace
      </p>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive
                  ? "bg-cyan-400/10 font-medium text-cyan-300"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#111722] p-4">
        <p className="text-sm font-medium text-white">System overview</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Monitor classroom conditions and manage connected devices.
        </p>
      </div>
    </aside>
  );
}

function Dashboard({ classroom, connected, toggleLed, message }) {
  const ledNames = [
    ["led1", "Light 01"],
    ["led2", "Light 02"],
    ["led3", "Light 03"],
    ["led4", "Light 04"],
    ["led5", "Light 05"],
  ];

  return (
    <>
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sensorCards.map((sensor) => (
          <SensorCard
            key={sensor.key}
            sensor={sensor}
            value={classroom[sensor.key] ?? "--"}
          />
        ))}
      </section>

      <ClassroomStatus classroom={classroom} connected={connected} />

      <section className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Lighting control</h3>
              <p className="mt-1 text-sm text-slate-400">
                Manage individual classroom lights
              </p>
            </div>
            <Lightbulb className="text-amber-300" size={22} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ledNames.map(([key, name]) => {
              const isOn = Boolean(classroom.leds?.[key]);

              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#0c111a] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        isOn
                          ? "bg-amber-300/10 text-amber-300"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <Lightbulb size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {isOn ? "Switched on" : "Switched off"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLed(key, !isOn)}
                    aria-label={`Toggle ${name}`}
                    aria-pressed={isOn}
                    className={`h-7 w-12 rounded-full p-1 transition ${
                      isOn ? "bg-cyan-400" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition ${
                        isOn ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {message && (
            <p role="status" className="mt-4 text-sm text-amber-300">
              {message}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-400/10 p-3 text-rose-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Safety monitor</h3>
              <p className="mt-1 text-sm text-slate-400">Gas sensor status</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0c111a] p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-400">Gas alert</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  classroom.gasAlert
                    ? "bg-rose-400/10 text-rose-300"
                    : "bg-emerald-400/10 text-emerald-300"
                }`}
              >
                {classroom.gasAlert ? "Alert active" : "No alert reported"}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              {classroom.gasAlert
                ? "The simulated gas reading crossed the configured threshold."
                : "No gas alert is currently reported by the backend."}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] p-4">
            <div className="flex items-center gap-3">
              <Activity size={19} className="text-cyan-300" />
              <span className="text-sm">Motion detected</span>
            </div>
            <span className="text-sm text-slate-300">
              {classroom.motionDetected ? "Yes" : "No"}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.07] p-4">
            <div className="flex items-center gap-3">
              <AirVent size={19} className="text-cyan-300" />
              <span className="text-sm">System connection</span>
            </div>
            <Wifi
              size={18}
              className={connected ? "text-emerald-400" : "text-amber-400"}
            />
          </div>
        </div>
      </section>

      <SensorHistory />
    </>
  );
}

function AutomationPage() {
  const [rules, setRules] = useState([
    { id: 1, name: "Cooling assist", sensor: "temperature", operator: ">=", threshold: 30, offThreshold: 27, unit: "°C", action: "Turn cooling appliance ON", enabled: true },
    { id: 2, name: "Low-light response", sensor: "lightLevel", operator: "<", threshold: 300, offThreshold: 400, unit: "lux", action: "Turn classroom lights ON", enabled: true },
    { id: 3, name: "Gas safety alert", sensor: "gasLevel", operator: ">", threshold: 450, offThreshold: 350, unit: "level", action: "Activate alert indicator", enabled: true },
  ]);
  const [notice, setNotice] = useState("Rules are currently saved in this browser session only.");

  const updateRule = (id, field, value) => setRules((current) => current.map((rule) => rule.id === id ? { ...rule, [field]: value } : rule));
  const addRule = () => {
    const id = Math.max(0, ...rules.map((rule) => rule.id)) + 1;
    setRules((current) => [...current, { id, name: "New automation rule", sensor: "temperature", operator: ">=", threshold: 30, offThreshold: 27, unit: "°C", action: "Turn appliance ON", enabled: false }]);
    setNotice("New draft rule added. Configure it before enabling.");
  };

  return (
    <section className="automation-page mt-7 space-y-6">
      <div className="automation-hero panel-glow rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.07] px-3 py-1.5 text-xs font-medium text-lime-200"><Zap size={14} /> RULE ENGINE / CONFIGURATION</div>
            <h3 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Make the classroom respond <span className="text-lime-300">automatically.</span></h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Define sensor thresholds and the actions your classroom should take. Separate ON and OFF thresholds help reduce rapid switching near a limit.</p>
          </div>
          <button onClick={addRule} className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-200"><Plus size={17} /> Add rule</button>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="metric-chip"><span>RULES CREATED</span><strong>{rules.length.toString().padStart(2, "0")}</strong></div>
          <div className="metric-chip"><span>ENABLED</span><strong>{rules.filter((r) => r.enabled).length.toString().padStart(2, "0")}</strong></div>
          <div className="metric-chip"><span>EXECUTION MODE</span><strong className="!text-base">Prototype</strong></div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="section-kicker">AUTOMATION WORKSPACE</p><h3 className="mt-1 text-xl font-semibold text-white">Your rules</h3></div>
        <p className="text-xs text-slate-500">Edit thresholds · Toggle a rule · Remove drafts</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {rules.map((rule, index) => (
          <article key={rule.id} className="rule-card rounded-2xl p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rule-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">{rule.sensor === "temperature" ? <Thermometer size={22} /> : rule.sensor === "lightLevel" ? <Sun size={22} /> : <Wind size={22} />}</div>
                <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">RULE {String(index + 1).padStart(2, "0")}</p><input aria-label="Rule name" value={rule.name} onChange={(e) => updateRule(rule.id, "name", e.target.value)} className="rule-name mt-1 w-full bg-transparent text-base font-semibold text-white outline-none" /><p className="mt-1 text-xs text-slate-500">Sensor-triggered action</p></div>
              </div>
              <button aria-label={rule.enabled ? "Disable rule" : "Enable rule"} aria-pressed={rule.enabled} onClick={() => updateRule(rule.id, "enabled", !rule.enabled)} className={`toggle-switch ${rule.enabled ? "is-on" : ""}`}><span /></button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="field-wrap"><span>Sensor</span><select value={rule.sensor} onChange={(e) => updateRule(rule.id, "sensor", e.target.value)}><option value="temperature">Temperature</option><option value="humidity">Humidity</option><option value="lightLevel">Light level</option><option value="gasLevel">Gas level</option></select></label>
              <label className="field-wrap"><span>Condition</span><select value={rule.operator} onChange={(e) => updateRule(rule.id, "operator", e.target.value)}><option value=">=">Greater than or equal</option><option value=">">Greater than</option><option value="<=">Less than or equal</option><option value="<">Less than</option></select></label>
              <label className="field-wrap"><span>Turn ON at</span><div className="threshold-input"><input type="number" value={rule.threshold} onChange={(e) => updateRule(rule.id, "threshold", Number(e.target.value))} /><span>{rule.sensor === "temperature" ? "°C" : rule.sensor === "humidity" ? "%" : rule.sensor === "lightLevel" ? "lux" : "level"}</span></div></label>
              <label className="field-wrap"><span>Turn OFF at</span><div className="threshold-input"><input type="number" value={rule.offThreshold} onChange={(e) => updateRule(rule.id, "offThreshold", Number(e.target.value))} /><span>{rule.sensor === "temperature" ? "°C" : rule.sensor === "humidity" ? "%" : rule.sensor === "lightLevel" ? "lux" : "level"}</span></div></label>
            </div>
            <div className="action-preview mt-4 flex items-center gap-3 rounded-xl p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-300/10 text-lime-300"><Zap size={17} /></div><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-[.16em] text-slate-500">THEN DO THIS</p><input aria-label="Automation action description" value={rule.action} onChange={(e) => updateRule(rule.id, "action", e.target.value)} className="mt-1 w-full bg-transparent text-sm text-slate-200 outline-none" /></div><span className={`status-pill ${rule.enabled ? "status-live" : "status-off"}`}>{rule.enabled ? "ENABLED" : "DISABLED"}</span></div>
            <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">{rule.enabled ? "Ready for backend rule-engine integration" : "This rule is paused"}</p><button onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={14} /> Remove</button></div>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><p role="status" className="text-xs leading-5 text-slate-400">{notice} These settings do not yet trigger physical appliances.</p><button onClick={() => setNotice("Your current rule configuration is active in the page state. Backend persistence and device execution still need to be connected.")} className="inline-flex items-center gap-2 rounded-xl border border-lime-300/20 px-4 py-2.5 text-sm font-medium text-lime-200 transition hover:bg-lime-300/10"><Save size={15} /> Apply configuration</button></div>
      <p className="text-xs leading-5 text-slate-500">Hardware note: actual appliance control needs backend rule evaluation plus an ESP32 and suitable driver hardware. Never connect mains-powered equipment directly to a microcontroller pin.</p>
    </section>
  );
}

function AppLayout() {
  const [classroom, setClassroom] = useState(initialState);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [socketClient, setSocketClient] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    setSocketClient(socket);

    socket.on("connect", () => {
      setConnected(true);
      setMessage("");
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    const updateState = (data) => {
      setClassroom((previous) => ({
        ...previous,
        ...data,
        leds: { ...previous.leds, ...(data.leds || {}) },
      }));
    };

    socket.on("classroom:state", updateState);
    socket.on("sensor:update", updateState);

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleLed = (led, state) => {
    if (!socketClient?.connected) {
      setMessage("Backend disconnected. Please try again when it reconnects.");
      return;
    }

    setMessage("");

    socketClient.emit("led:control", { led, state }, (response) => {
      if (!response?.success) {
        setMessage(response?.message || "Failed to update the light.");
        return;
      }

      setMessage(`${led.toUpperCase()} command acknowledged.`);
    });
  };

  const pageInfo = {
    "/": ["Workspace / Overview", "Classroom overview", "Monitor your classroom environment in real time."],
    "/sensors": ["Workspace / Sensors", "Sensor monitoring", "View current sensor readings."],
    "/lighting": ["Workspace / Lighting", "Lighting control", "Manage classroom lighting."],
    "/safety": ["Workspace / Safety", "Safety monitoring", "Review gas and motion status."],
    "/automation": ["Workspace / Automation", "Automation studio", "Configure the classroom response to changing conditions."],
  };

  const [eyebrow, title, description] =
    pageInfo[location.pathname] || ["ClassroomIQ", "Page not found", "The requested page does not exist."];

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 md:flex">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <div className="border-b border-white/[0.07] px-5 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpen className="text-cyan-300" />
              ClassroomIQ
            </div>
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="rounded-lg border border-white/10 p-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="mt-3">
              <AppSidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          )}
        </div>

        <main className="min-w-0 p-5 md:p-9">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
            <div>
              <p className="text-sm text-slate-500">{eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#111722] px-3 py-2 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                {connected ? "Backend connected" : "Connecting…"}
              </div>
              <button
                aria-label="Notifications"
                className="rounded-xl border border-white/10 bg-[#111722] p-3 text-slate-300"
              >
                <Bell size={19} />
              </button>
            </div>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  classroom={classroom}
                  connected={connected}
                  toggleLed={toggleLed}
                  message={message}
                />
              }
            />
            <Route path="/sensors" element={<SensorPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route
              path="/lighting"
              element={
                <section className="mt-7">
                  <h3 className="text-lg font-semibold">Classroom lights</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Switch individual lights on the dashboard. Physical control
                    requires the ESP32 device to be connected.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {["led1", "led2", "led3", "led4", "led5"].map((led, index) => (
                      <div key={led} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111722] p-4">
                        <span>Light {String(index + 1).padStart(2, "0")}</span>
                        <button
                          onClick={() => toggleLed(led, !classroom.leds?.[led])}
                          aria-pressed={Boolean(classroom.leds?.[led])}
                          className={`rounded-full px-4 py-2 text-sm ${
                            classroom.leds?.[led]
                              ? "bg-cyan-400 text-slate-950"
                              : "bg-slate-800 text-white"
                          }`}
                        >
                          {classroom.leds?.[led] ? "ON" : "OFF"}
                        </button>
                      </div>
                    ))}
                  </div>
                  {message && <p role="status" className="mt-4 text-sm text-amber-300">{message}</p>}
                </section>
              }
            />
            <Route
              path="/safety"
              element={
                <section className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#111722] p-5">
                    <ShieldCheck className="text-rose-300" size={24} />
                    <h3 className="mt-4 font-semibold">Gas monitoring</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {classroom.gasAlert ? "Backend reports a gas alert." : "No gas alert is currently reported."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#111722] p-5">
                    <Activity className="text-cyan-300" size={24} />
                    <h3 className="mt-4 font-semibold">Motion detection</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {classroom.motionDetected ? "Motion detected." : "No motion currently reported."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#111722] p-5 sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <Wifi className={connected ? "text-emerald-300" : "text-amber-300"} />
                      <h3 className="font-semibold">Backend connection</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {connected ? "Socket.IO is connected." : "Waiting for backend connection."}
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-slate-500 sm:col-span-2">
                    Sensor readings are simulated in the current prototype. This display is not a certified fire or gas safety system.
                  </p>
                </section>
              }
            />
            <Route
              path="*"
              element={<p className="mt-8 text-slate-400">Page not found. Use the sidebar to navigate.</p>}
            />
          </Routes>

          <footer className="mt-8 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
            <span>ClassroomIQ · Smart classroom monitoring</span>
            <span>Live data depends on backend availability</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
