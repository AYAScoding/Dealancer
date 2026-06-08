import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft, Briefcase, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { Alert, Button, Card, TextInput } from "../components/ui";

export default function Login() {
  const { login, confirm2fa } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const passwordResetSuccess = location.state?.passwordResetSuccess;

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("credentials");
  const [ephemeralToken, setEphemeralToken] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(result.user?.role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard");
    } else if (result.requires2fa) {
      setEphemeralToken(result.ephemeralToken);
      setStep("otp");
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handle2faSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await confirm2fa(ephemeralToken, otpCode);
    if (result.success) {
      navigate(result.user?.role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard");
    } else if (result.expired) {
      setError("Session expired. Please sign in again.");
      setStep("credentials");
      setEphemeralToken("");
      setOtpCode("");
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const backToCredentials = () => {
    setStep("credentials");
    setEphemeralToken("");
    setOtpCode("");
    setError("");
  };

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to manage proposals, contracts, and marketplace work.">
      <Card className="p-6 sm:p-8">
        {step === "credentials" ? (
        <form className="space-y-5 animate-in" onSubmit={handleSubmit}>
          {passwordResetSuccess && <Alert variant="success">Password reset successfully. Sign in with your new password.</Alert>}
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">Email address</label>
            <TextInput
              id="login-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-cyan-700 hover:text-cyan-900">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <TextInput
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} icon={LogIn} className="w-full">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        ) : (
          <form className="space-y-6 animate-in" onSubmit={handle2faSubmit}>
            {error && <Alert variant="error">{error}</Alert>}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">Two-factor verification</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the 6-digit code from Google Authenticator.
              </p>
            </div>
            <TextInput
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center font-mono text-3xl tracking-[0.35em]"
              placeholder="000000"
              required
            />
            <Button type="submit" disabled={isLoading || otpCode.length !== 6} icon={ShieldCheck} className="w-full">
              {isLoading ? "Verifying..." : "Verify code"}
            </Button>
            <button
              type="button"
              onClick={backToCredentials}
              className="mx-auto flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          New to Dealancer?{" "}
          <Link to="/register" className="font-bold text-cyan-700 hover:text-cyan-900">Create an account</Link>
        </p>
      </Card>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black">Dealancer</span>
          </Link>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950">{title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">{subtitle}</p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["Verified profiles", "Proposal workflow", "Active contracts"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <div className="mb-7 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <Briefcase className="h-7 w-7 text-cyan-700" />
              <span className="text-2xl font-black">Dealancer</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
