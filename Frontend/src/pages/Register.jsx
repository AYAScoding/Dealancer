import React, { useState, useContext, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserPlus, Eye, EyeOff } from "lucide-react";

// Reusable password input with visibility toggle
function PasswordInput({ id, value, onChange, placeholder = "" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 pr-12 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 outline-none transition"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function Register() {
  const { register } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    role: "FREELANCER",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-select role from URL query param: /register?role=CLIENT
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "CLIENT" || roleParam === "FREELANCER") {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side password match check before hitting the API
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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md glass p-10 rounded-2xl text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-5">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox!</h2>
          <p className="text-slate-600 mb-6">
            A verification link was sent to{" "}
            <span className="font-semibold text-slate-800">{formData.email}</span>. Click it to activate your account before logging in.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 flex justify-center items-center gap-2">
          <UserPlus className="text-primary" /> Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 outline-none transition"
                />
              </div>
            </div>

            {/* Password with toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Confirm Password with toggle */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="confirm_password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                />
              </div>
              {/* Inline mismatch indicator */}
              {formData.confirm_password && formData.password !== formData.confirm_password && (
                <p className="mt-1 text-xs text-red-500 font-medium">Passwords don't match yet.</p>
              )}
              {formData.confirm_password && formData.password === formData.confirm_password && (
                <p className="mt-1 text-xs text-green-600 font-medium">✓ Passwords match!</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I want to:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "FREELANCER" })}
                  className={`py-2.5 px-4 border rounded-xl shadow-sm text-sm font-medium transition-colors ${
                    formData.role === "FREELANCER"
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  🧑‍💻 Work (Freelancer)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "CLIENT" })}
                  className={`py-2.5 px-4 border rounded-xl shadow-sm text-sm font-medium transition-colors ${
                    formData.role === "CLIENT"
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  💼 Hire (Client)
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
