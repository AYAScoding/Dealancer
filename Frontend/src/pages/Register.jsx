import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Briefcase, Eye, EyeOff, UserPlus } from "lucide-react";
import { Alert, Button, Card, TextInput } from "../components/ui";

function PasswordInput({ id, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <TextInput id={id} type={show ? "text" : "password"} required value={value} onChange={onChange} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((current) => !current)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function Register() {
  const { register } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole = roleParam === "CLIENT" || roleParam === "FREELANCER" ? roleParam : "FREELANCER";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    role: initialRole,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <AuthFrame title="Check your inbox" subtitle="We sent a verification link to activate your Dealancer account.">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <UserPlus className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-950">Verification email sent</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We sent a link to <span className="font-bold text-slate-900">{formData.email}</span>. Verify your email before signing in.
          </p>
          <Link to="/login" className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
            Return to login
          </Link>
        </Card>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Create your workspace" subtitle="Choose your role, complete your profile, and start building trusted marketplace relationships.">
      <Card className="p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" id="first_name">
              <TextInput id="first_name" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
            </Field>
            <Field label="Last name" id="last_name">
              <TextInput id="last_name" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
            </Field>
          </div>

          <Field label="Email address" id="email">
            <TextInput id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </Field>

          <Field label="Password" id="password">
            <PasswordInput id="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </Field>

          <Field label="Confirm password" id="confirm_password">
            <PasswordInput id="confirm_password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} />
            {formData.confirm_password && (
              <p className={`mt-2 text-xs font-semibold ${formData.password === formData.confirm_password ? "text-emerald-600" : "text-red-600"}`}>
                {formData.password === formData.confirm_password ? "Passwords match." : "Passwords do not match yet."}
              </p>
            )}
          </Field>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">I want to</p>
            <div className="grid grid-cols-2 gap-3">
              <RoleButton active={formData.role === "FREELANCER"} onClick={() => setFormData({ ...formData, role: "FREELANCER" })}>
                Find work
              </RoleButton>
              <RoleButton active={formData.role === "CLIENT"} onClick={() => setFormData({ ...formData, role: "CLIENT" })}>
                Hire talent
              </RoleButton>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} icon={UserPlus} className="w-full">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-bold text-cyan-700 hover:text-cyan-900">Sign in</Link>
        </p>
      </Card>
    </AuthFrame>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function RoleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
        active ? "border-cyan-600 bg-cyan-50 text-cyan-800 ring-4 ring-cyan-500/10" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function AuthFrame({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_480px]">
        <div className="hidden lg:block">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black">Dealancer</span>
          </Link>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950">{title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">{subtitle}</p>
        </div>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
