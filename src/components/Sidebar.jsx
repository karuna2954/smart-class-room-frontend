
import { NavLink } from "react-router-dom";
import {
  Activity,
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sensors", label: "Sensors", icon: Activity },
  { to: "/lighting", label: "Lighting", icon: Lightbulb },
  { to: "/safety", label: "Safety", icon: ShieldCheck },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-[#0d111a] p-5 md:block">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
          <BookOpen size={23} />
        </div>
        <div>
          <h1 className="font-semibold text-white">ClassroomIQ</h1>
          <p className="text-xs text-slate-500">Smart campus system</p>
        </div>
      </div>

      <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Workspace
      </p>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
    </aside>
  );
}
