import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Briefcase,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function AppShell({ children, title, subtitle }) {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const isClient = user?.role === "CLIENT";
  const nav = isClient ? clientNav : freelancerNav;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-slate-950 lg:block">
        <Sidebar nav={nav} roleLabel={isClient ? "Client workspace" : "Freelancer workspace"} onLogout={logout} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-72 bg-slate-950">
            <Sidebar nav={nav} roleLabel={isClient ? "Client workspace" : "Freelancer workspace"} onLogout={logout} />
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                {subtitle && <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:text-slate-950">
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 sm:block">
                {user?.first_name || "User"}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ nav, roleLabel, onLogout }) {
  const location = useLocation();

  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-white/10 p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-white">Dealancer</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {nav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-bold text-white">Demo roadmap</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Messages, analytics, saved talent, and subscriptions are ready as UX placeholders.</p>
        </div>
        <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-500/20 hover:text-white">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

const clientNav = [
  { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/client/jobs", label: "My Jobs", icon: Briefcase },
  { to: "/client/jobs/new", label: "Post a Job", icon: Plus },
  { to: "/contracts", label: "Active Work", icon: Star },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/client/dashboard", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/client/dashboard", label: "Messages", icon: MessageSquare },
];

const freelancerNav = [
  { to: "/freelancer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Find Jobs", icon: Search },
  { to: "/contracts", label: "Active Work", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/freelancer/dashboard", label: "Portfolio", icon: Star },
  { to: "/freelancer/dashboard", label: "Messages", icon: MessageSquare },
];
