import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/password-reset/", { email });
      // Backend always returns 200 (anti-enumeration) — treat any success as sent
      setStatus("success");
      setMessage(res.data.detail || "If this email exists, a reset link has been sent.");
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <h2 className="text-center text-3xl font-extrabold text-slate-900 flex justify-center items-center gap-2">
          <Mail className="text-primary" /> Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your registered email and we'll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10">
          {status === "success" ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h3 className="text-xl font-bold text-slate-900">Check your inbox</h3>
              <p className="text-slate-600 text-sm">{message}</p>
              <Link
                to="/login"
                className="mt-4 inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
