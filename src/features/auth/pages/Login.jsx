import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import AuthApi from "../services/AuthApi";
import UserApi from "@/features/lms/services/UserApi.js";
import {
  saveSession,
  saveEmployeeSession,
  isAuthenticated,
  isEmployee,
  isSupervisor,
  saveSupervisorSession,
} from "../utils/authStorage";
import ntfLogo from "@/assets/images/NTF_logo_black.png";
import loginBg from "@/assets/images/login-bg.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to the corresponding portal
  useEffect(() => {
    if (isAuthenticated()) {
      if (isSupervisor()) {
        navigate("/supervisor", { replace: true });
      } else if (isEmployee()) {
        navigate("/employee", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const trimmedInput = email.trim();
    const trimmedPassword = String(password).trim();

    // 1. Client-side empty field validation
    if (!trimmedInput) {
      setErrorMessage("Please enter your username or email.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedInput = trimmedInput.toLowerCase();

      // 2. Supervisor Login (isolated frontend role flow)
      if (
        normalizedInput === "supervisor" &&
        trimmedPassword === "supervisor123"
      ) {
        saveSupervisorSession({
          id: "supervisor_1",
          username: "supervisor",
          name: "Supervisor",
          role: "supervisor",
          isSupervisor: true,
        });
        navigate("/supervisor", { replace: true });
        return;
      }

      // 3. Primary Backend Auth API login (Admin & email/DOB-authenticated users)
      let authApiError = null;
      try {
        const res = await AuthApi.login({
          email: trimmedInput,
          password: password,
        });
        saveSession(res.data);

        if (isSupervisor()) {
          navigate("/supervisor", { replace: true });
        } else if (isEmployee()) {
          navigate("/employee", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
        return;
      } catch (err) {
        authApiError = err;
      }

      // 4. Live Operator Login via fresh backend Users API (no stale localStorage / seed lists)
      // Matches Designation === "Operator" (case-insensitive, trimmed),
      // Username/Email === name/empName (case-insensitive, trimmed),
      // Password === paycode/payCode (trimmed string comparison)
      try {
        const liveUsers = await UserApi.getAllUsers();
        const matchedOperator = liveUsers.find((u) => {
          const designation = String(u?.designation || "").trim().toLowerCase();
          if (designation !== "operator") return false;

          const uPayCode = String(u?.payCode ?? u?.paycode ?? "").trim();
          if (!uPayCode || uPayCode.toLowerCase() !== trimmedPassword.toLowerCase()) {
            return false;
          }

          const uEmpName = String(u?.empName ?? "").trim().toLowerCase();
          const uName = String(u?.name ?? "").trim().toLowerCase();
          const uUsername = String(u?.username ?? "").trim().toLowerCase();
          const uEmail = String(u?.email ?? "").trim().toLowerCase();

          return (
            (uEmpName && uEmpName === normalizedInput) ||
            (uName && uName === normalizedInput) ||
            (uUsername && uUsername === normalizedInput) ||
            (uEmail && uEmail === normalizedInput)
          );
        });

        if (matchedOperator) {
          const resolvedName =
            matchedOperator.empName ?? matchedOperator.name ?? trimmedInput;
          const resolvedPayCode = String(
            matchedOperator.payCode ?? matchedOperator.paycode ?? trimmedPassword
          ).trim();
          const resolvedJoiningDate =
            matchedOperator.dateOfJoining ?? matchedOperator.joiningDate ?? "";

          saveEmployeeSession({
            id: matchedOperator.id,
            name: resolvedName,
            empName: resolvedName,
            username: resolvedName,
            payCode: resolvedPayCode,
            paycode: resolvedPayCode,
            cardNo: matchedOperator.cardNo ?? "",
            joiningDate: resolvedJoiningDate,
            dateOfJoining: resolvedJoiningDate,
            department:
              matchedOperator.departmentName ?? matchedOperator.department ?? "",
            subDepartment:
              matchedOperator.subDepartmentName ??
              matchedOperator.subDepartment ??
              "",
            line: matchedOperator.lineName ?? matchedOperator.line ?? "",
            machine:
              matchedOperator.machineName ?? matchedOperator.machine ?? "",
            shift: matchedOperator.shift ?? "",
            plant:
              matchedOperator.plantId != null
                ? String(matchedOperator.plantId)
                : (matchedOperator.plant ?? ""),
            plantLocation: matchedOperator.plantLocation ?? "",
            designation: matchedOperator.designation ?? "Operator",
            email: matchedOperator.email ?? "",
            mobileNo: matchedOperator.mobileNo ?? "",
            role: "OPERATOR",
            isEmployee: true,
          });

          navigate("/employee", { replace: true });
          return;
        }
      } catch (usersErr) {
        console.warn("Live Users API check failed during login:", usersErr?.message);
      }

      // 5. Neither Auth API nor live Operator lookup matched -> surface error
      throw authApiError || new Error("Invalid username/email or password.");
    } catch (err) {
      const data = err?.response?.data;
      let backendError = null;

      if (typeof data?.detail === "string") {
        backendError = data.detail;
      } else if (Array.isArray(data?.errors)) {
        backendError = data.errors.map((item) => item.msg || item.detail).join("; ");
      } else if (Array.isArray(data?.detail)) {
        backendError = data.detail.map((item) => item.msg || item.detail).join("; ");
      } else if (data?.message) {
        backendError = data.message;
      } else if (err?.response?.status === 401) {
        backendError = "Invalid username/email or password. Please try again.";
      } else if (err?.response?.status === 422) {
        backendError = "Invalid credentials. Please verify your username/email and password.";
      } else if (!err?.response) {
        backendError = "Unable to connect to authentication server. Please try again.";
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
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 font-sans select-none relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* NTF Brand Logo Centered Above Card */}
        <div className="mb-2 sm:mb-2.5 flex justify-center">
          <img
            src={ntfLogo}
            alt="NTF Group Holding"
            className="h-24 sm:h-28 w-auto max-w-[280px] object-contain mix-blend-multiply"
          />
        </div>

        {/* Login Card Container */}
        <div className="w-full bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-slate-100/90 p-7 sm:p-9">
          {/* Card Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f1f38] tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-normal">
              NTF Operations & Learning Management Portal
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username or Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Username or Email
              </label>
              <div className="flex items-center bg-[#edf3fb] border border-[#d9e6f7] rounded-xl px-3.5 py-2.5 focus-within:border-[#0d254c] focus-within:ring-2 focus-within:ring-[#0d254c]/10 transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username or Email"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium disabled:opacity-60"
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
              <div className="flex items-center bg-[#edf3fb] border border-[#d9e6f7] rounded-xl px-3.5 py-2.5 focus-within:border-[#0d254c] focus-within:ring-2 focus-within:ring-[#0d254c]/10 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-2 shrink-0 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[1.8]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info below card */}
        <p className="text-center text-xs text-slate-400 mt-7">
          &copy; {new Date().getFullYear()} NTF Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
