import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${uid}/${token}/`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed. Link may be invalid or expired.");
      }
    };

    verify();
  }, [uid, token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="glass p-8 rounded-2xl max-w-md w-full text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-900">Verifying your email...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verified!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <Link to="/login" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-medium transition-colors">
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <Link to="/register" className="text-primary font-medium hover:text-primary-dark">
              Return to Registration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
