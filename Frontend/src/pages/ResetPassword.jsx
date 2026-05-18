import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff, KeyRound, CheckCircle, XCircle } from "lucide-react";

// Reusable password input with toggle — same as in Register.jsx
function PasswordInput({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          className="block w-full px-3 py-3 pr-12 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 backdrop-blur-sm"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract uid and token from query string: /reset-password?uid=xxx&token=yyy
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  // If no uid/token in URL, this is an invalid link — show error immediately
  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("This reset link is invalid or malformed. Please request a new one.");
    }
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setStatus("success");
      setMessage(res.data.detail || "Password has been reset successfully.");

      // Redirect to login after 2 seconds with a state flag to show success toaster
      setTimeout(() => {
        navigate("/login", { state: { passwordResetSuccess: true } });
      }, 2500);
    } catch (err) {
      setStatus("error");
      const data = err.response?.data;
      // DRF can return errors under different keys
      const errMsg =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        Object.values(data || {}).flat()[0] ||
        "Something went wrong. The link may have expired.";
      setMessage(errMsg);
    }
  };

  // --- Success State ---
  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="glass p-10 rounded-2xl max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Password Reset!</h2>
          <p className="text-slate-600">{message}</p>
          <p className="text-sm text-slate-400">Redirecting you to login...</p>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // --- Invalid Link State (no uid/token) ---
  if (!uid || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="glass p-10 rounded-2xl max-w-md w-full text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Invalid Link</h2>
          <p className="text-slate-600">{message}</p>
          <Link
            to="/forgot-password"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Reset Form ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 flex justify-center items-center gap-2">
          <KeyRound className="text-primary" /> Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Choose a strong password for your Dealancer account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error banner */}
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {message}
              </div>
            )}

            <PasswordInput
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div>
              <PasswordInput
                id="confirm-new-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {/* Live match indicator */}
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-medium">Passwords don't match yet.</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1 text-xs text-green-600 font-medium">✓ Passwords match!</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Remembered it?{" "}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
