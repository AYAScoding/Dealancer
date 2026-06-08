import { AlertCircle, CheckCircle, Loader2, Search } from "lucide-react";

const buttonVariants = {
  primary: "bg-slate-950 text-white hover:bg-slate-800 shadow-sm shadow-slate-950/10",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
  subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-red-100 text-red-700 hover:bg-red-200",
  success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  ghost: "text-slate-600 hover:text-slate-950 hover:bg-slate-100",
};

const badgeVariants = {
  neutral: "bg-slate-100 text-slate-700",
  primary: "bg-cyan-50 text-cyan-700 border-cyan-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-red-50 text-red-700 border-red-100",
};

const alertVariants = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-cyan-50 border-cyan-200 text-cyan-800",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
};

export function Button({ children, variant = "primary", className = "", icon: Icon, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function LinkButton({ children, variant = "primary", className = "", icon: Icon, ...props }) {
  return (
    <a
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </a>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 ${className}`}>
      {children}
    </section>
  );
}

export function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Alert({ children, variant = "info", className = "" }) {
  const Icon = variant === "success" ? CheckCircle : AlertCircle;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${alertVariants[variant]} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
