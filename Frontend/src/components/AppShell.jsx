import { useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "./ui";

export default function AppShell() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [menuPath, setMenuPath] = useState(null);
  const open = menuPath === location.pathname;
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuPath(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );
  const client = user?.role === "CLIENT";
  const home = client ? "/client/dashboard" : "/freelancer/dashboard";
  const links = [
    { to: home, label: "Overview", icon: LayoutDashboard },
    {
      to: client ? "/client/jobs/new" : "/jobs",
      label: client ? "Post a job" : "Find work",
      icon: client ? Plus : Search,
    },
    { to: "/profile", label: "My profile", icon: UserRound },
  ];
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("dealancer-theme", next ? "dark" : "light");
    } catch {
      /* Theme still works without storage. */
    }
  }
  return (
    <div className="workspace">
      {open && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuPath(null)}
        />
      )}
      <aside
        className={`workspace-nav ${open ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-brand">
          <Link to="/" className="wordmark">
            <BriefcaseBusiness size={23} />
            Dealancer
            <span className="brand-dot" />
          </Link>
          <button
            className="mobile-close icon-button"
            aria-label="Close navigation"
            onClick={() => setMenuPath(null)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="status-dot" />
          {client ? "Client workspace" : "Freelancer workspace"}
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-note">
          <span className="eyebrow">A little more possibility.</span>
          <p>
            {client
              ? "Find the skills for your next big idea."
              : "Your next opportunity starts with a great profile."}
          </p>
          <Link to={client ? "/client/jobs/new" : "/profile"}>
            {client ? "Create a brief" : "Update profile"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="nav-account">
          <div className="avatar">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div>
            <strong>
              {user?.first_name} {user?.last_name}
            </strong>
            <span>{client ? "Client" : "Independent professional"}</span>
          </div>
          <button
            className="icon-button"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="topbar-leading">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenuPath(location.pathname)}
              aria-label="Open navigation"
              aria-expanded={open}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {links.find((item) => item.to === location.pathname)?.label ||
                "Project details"}
            </strong>
          </div>
          <div className="topbar-actions">
            <span className="workspace-status">
              <span className="status-dot" />
              Ready for what's next
            </span>
            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </header>
        <div className="workspace-body" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
