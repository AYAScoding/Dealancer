import { useEffect, useId, useRef } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

export function Button({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  ...props
}) {
  return (
    <button
      type="button"
      className={`button button-${variant} ${className}`}
      {...props}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}
export function Card({ children, className = "", ...props }) {
  return (
    <section className={`surface ${className}`} {...props}>
      {children}
    </section>
  );
}
export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function StatusBadge({ status }) {
  const tone = ["OPEN", "ACTIVE", "ACCEPTED", "COMPLETED"].includes(status)
    ? "success"
    : status === "PENDING" || status === "IN_PROGRESS"
      ? "warning"
      : "neutral";
  return (
    <Badge tone={tone}>
      {(status || "Unknown").replaceAll("_", " ").toLowerCase()}
    </Badge>
  );
}
export function Alert({ children, variant = "error" }) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`notice notice-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
export function LoadingState({ label = "Loading your workspace" }) {
  return (
    <div className="loading-state" role="status">
      <Loader2 className="animate-spin" size={22} />
      <span>{label}</span>
    </div>
  );
}
export function EmptyState({ title, description, children }) {
  return (
    <div className="empty-state">
      <ArrowUpRight size={26} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      <div className="heading-actions">{children}</div>
    </header>
  );
}
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="view-tabs" role="group" aria-label="View">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-pressed={value === tab.value}
          aria-label={`${tab.label}${tab.count != null ? ` ${tab.count}` : ""}`}
          onClick={() => onChange(tab.value)}
          className={value === tab.value ? "selected" : ""}
        >
          {tab.label}
          {tab.count != null && <span>{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// Native dialog supplies focus trapping and makes the background inert.
export function Drawer({ open, title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    const previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header className="drawer-header">
        <h2 id={titleId}>{title}</h2>
        <Button
          variant="ghost"
          onClick={onClose}
          aria-label="Close panel"
          title="Close panel"
        >
          <X size={20} />
        </Button>
      </header>
      <div className="drawer-content">{children}</div>
    </dialog>
  );
}
