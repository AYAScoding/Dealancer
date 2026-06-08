import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { ArrowRight, CheckCircle, Mail, RefreshCw, XCircle } from "lucide-react";
import { Alert, Card } from "../components/ui";

function normalizeVerificationResult(responseMessage, errorMessage, statusCode) {
  const text = (errorMessage || responseMessage || "").toLowerCase();

  if (text.includes("already verified")) {
    return { status: "info", title: "Email already verified", message: "This email address is already verified. You can sign in normally." };
  }
  if (text.includes("expired")) {
    return { status: "error", title: "Verification link expired", message: "This verification link has expired. Please create a new account or contact support for help." };
  }
  if (text.includes("invalid") || statusCode >= 400) {
    return { status: "error", title: "Invalid verification link", message: errorMessage || "This verification link is invalid or has already been used." };
  }
  return {
    status: "success",
    title: "Email verified",
    message: responseMessage || "Your email has been verified successfully. You can now sign in.",
  };
}

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const [result, setResult] = useState({ status: "verifying", title: "Verifying your account", message: "Please wait while we confirm your email address." });
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const verify = async () => {
      if (!uid || !token) {
        setResult({ status: "error", title: "Invalid verification link", message: "This verification link is missing required information." });
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${uid}/${token}/`);
        setResult(normalizeVerificationResult(res.data?.message));
      } catch (err) {
        const message = err.response?.data?.error || err.response?.data?.detail || "Invalid verification link.";
        setResult(normalizeVerificationResult(null, message, err.response?.status));
      }
    };

    verify();
  }, [uid, token]);

  const isSuccess = result.status === "success";
  const isInfo = result.status === "info";
  const isError = result.status === "error";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md p-8 text-center">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
          isSuccess ? "bg-emerald-50 text-emerald-600" : isError ? "bg-red-50 text-red-600" : isInfo ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-cyan-700"
        }`}>
          {result.status === "verifying" && <RefreshCw className="h-8 w-8 animate-spin" />}
          {isSuccess && <CheckCircle className="h-8 w-8" />}
          {isInfo && <Mail className="h-8 w-8" />}
          {isError && <XCircle className="h-8 w-8" />}
        </div>

        <h1 className="text-3xl font-black text-slate-950">{result.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{result.message}</p>

        {isError && (
          <Alert variant="warning" className="mt-6 text-left">
            If you requested verification a while ago, the safest next step is to register again or contact support.
          </Alert>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
            Go to login <ArrowRight className="h-4 w-4" />
          </Link>
          {isError && (
            <Link to="/register" className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
              Create a new account
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
