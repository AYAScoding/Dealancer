import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogIn, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Read the success flag passed from ResetPassword after a successful reset
  const passwordResetSuccess = location.state?.passwordResetSuccess;

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Role-based redirect: CLIENT → client dashboard, FREELANCER → freelancer dashboard
      const role = result.user?.role;
      if (role === "CLIENT") {
        navigate("/client/dashboard");
      } else {
        navigate("/freelancer/dashboard");
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 flex justify-center items-center gap-2">
          <LogIn className="text-primary" /> Sign in to Dealancer
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Post-reset success banner */}
            {passwordResetSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Password reset successfully! Sign in with your new password.
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="login-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password with toggle and forgot link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-3 pr-12 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
