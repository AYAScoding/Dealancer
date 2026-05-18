import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Mail } from "lucide-react";

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("");
  const hasRequested = React.useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    
    const verify = async () => {
      hasRequested.current = true;
      // Add a slight artificial delay for a smoother UX transition
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const res = await api.get(`/auth/verify-email/${uid}/${token}/`);
        setStatus("success");
        setMessage(res.data.message || "Your email has been verified successfully. You can now access all features of Dealancer.");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || "This verification link is invalid, expired, or has already been used.");
      }
    };

    if (uid && token) {
      verify();
    } else {
      setStatus("error");
      setMessage("Missing verification parameters.");
    }
  }, [uid, token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3">
              <Mail className="w-full h-full text-primary" />
           </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass p-10 rounded-3xl shadow-2xl border border-white/20 text-center relative overflow-hidden">
          
          {status === "verifying" && (
            <div className="py-8">
              <RefreshCw className="w-16 h-16 text-primary mx-auto animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying your account</h2>
              <p className="text-slate-500">Please wait while we confirm your identity...</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Email Verified!</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {message}
              </p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
              >
                Go to Login <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Verification Error</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {message}
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all"
                >
                  Create New Account
                </Link>
                <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Need help? <a href="mailto:support@dealancer.com" className="hover:text-primary underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}
