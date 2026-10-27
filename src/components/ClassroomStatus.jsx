
import {
  Activity,
  Lightbulb,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";

export default function ClassroomStatus({ classroom, connected }) {
  const lightsOn = [
    "led1",
    "led2",
    "led3",
    "led4",
    "led5",
  ].filter((key) => classroom.leds?.[key]).length;

  const items = [
    {
      label: "Lights active",
      value: `${lightsOn} / 5`,
      icon: Lightbulb,
      color: "text-amber-300",
    },
    {
      label: "Motion",
      value: classroom.motionDetected ? "Detected" : "None",
      icon: Users,
      color: "text-cyan-300",
    },
    {
      label: "Gas monitoring",
      value: classroom.gasAlert ? "Alert" : "Normal",
      icon: ShieldCheck,
      color: classroom.gasAlert
        ? "text-rose-300"
        : "text-emerald-300",
    },
    {
      label: "Backend",
      value: connected ? "Online" : "Offline",
      icon: Wifi,
      color: connected
        ? "text-emerald-300"
        : "text-amber-300",
    },
  ];

  return (
    <section className="mt-7">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          Classroom status
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          A quick overview of your classroom system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#111722] p-4"
            >
              <div className={`rounded-xl bg-white/[0.04] p-3 ${item.color}`}>
                <Icon size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className={`mt-1 font-semibold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
