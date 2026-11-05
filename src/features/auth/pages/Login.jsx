import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import AuthApi from "../services/AuthApi";
import { saveSession, isAuthenticated } from "../utils/authStorage";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to the homepage
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const trimmedEmail = email.trim();

    // 1. Client-side empty field validation
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Build credentials payload (backend strictly requires 'email' along with 'password')
      const credentials = {
        email: trimmedEmail,
        username: trimmedEmail,
        password: password,
      };

      // 3. API Login call
      const res = await AuthApi.login(credentials);

      // 4. Save session to authStorage
      saveSession(res.data);

      // 5. Redirect to Homepage
      navigate("/home", { replace: true });
    } catch (err) {
      // Extract detailed error message from response
      const data = err?.response?.data;
      let backendError = null;

      if (typeof data?.detail === "string") {
        backendError = data.detail;
      } else if (Array.isArray(data?.errors)) {
        backendError = data.errors.map((e) => e.msg || e.detail).join("; ");
      } else if (Array.isArray(data?.detail)) {
        backendError = data.detail.map((e) => e.msg || e.detail).join("; ");
      } else if (data?.message) {
        backendError = data.message;
      } else if (err?.response?.status === 401) {
        backendError = "Invalid email or password. Please try again.";
      } else if (err?.response?.status === 422) {
        backendError = "Validation error: please verify your email and password format.";
      } else {
        backendError = err?.message || "An unexpected error occurred. Please try again.";
      }

      setErrorMessage(
        typeof backendError === "string" ? backendError : JSON.stringify(backendError)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col justify-center items-center px-4 sm:px-6 py-12 font-sans text-slate-800 select-none">
      <div className="w-full max-w-md">
        {/* NTF Brand Emblem */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center border-y-2 border-[#0b295c] px-3.5 py-1 tracking-[0.25em] mb-3">
            <span className="font-serif-logo text-2xl font-bold tracking-widest text-[#0b295c]">
              NTF
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            NTF Operations & Learning Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0b295c] hover:bg-[#082046] active:scale-[0.99] text-white font-medium text-sm rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} NTF Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
