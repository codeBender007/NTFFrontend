import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import AuthApi from "../services/AuthApi";
import UserApi from "@/features/lms/services/UserApi.js";
import { SEED_EMPLOYEES } from "@/features/lms/utils/userSchema.js";
import { applyRoleDesignationOverrides } from "@/features/lms/utils/userUtils.js";
import { saveSession, isAuthenticated, isEmployee, saveEmployeeSession } from "../utils/authStorage";
import ntfLogo from "@/assets/images/NTF_logo_black.png";
import loginBg from "@/assets/images/login-bg.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to the homepage or employee portal
  useEffect(() => {
    if (isAuthenticated()) {
      if (isEmployee()) {
        navigate("/employee", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const trimmedEmail = email.trim();

    // 1. Client-side empty field validation
    if (!trimmedEmail) {
      setErrorMessage("Please enter your username or email.");
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

      // Dynamic Employee Login: authenticate Operators from Users table
      // Username matches employee Name (empName / name), Password matches employee Paycode (paycode / payCode)
      const inputUsername = trimmedEmail.toLowerCase();
      const inputPassword = String(password).trim();

      let matchedOperator = null;
      try {
        let usersList = [];
        try {
          const usersRes = await UserApi.getUsers({ limit: 1000 });
          const raw = Array.isArray(usersRes?.data)
            ? usersRes.data
            : Array.isArray(usersRes?.data?.data)
              ? usersRes.data.data
              : [];
          if (raw.length > 0) {
            usersList = raw.map((u) => ({
              id: u.id,
              empName: u.name ?? u.empName ?? "",
              name: u.name ?? u.empName ?? "",
              payCode: u.payCode ?? u.paycode ?? "",
              paycode: u.payCode ?? u.paycode ?? "",
              cardNo: u.cardNo ?? "",
              joiningDate: u.dateOfJoining ?? u.joiningDate ?? "",
              dateOfJoining: u.dateOfJoining ?? u.joiningDate ?? "",
              department: u.departmentName ?? u.department ?? "",
              subDepartment: u.subDepartmentName ?? u.subDepartment ?? "",
              line: u.lineName ?? u.line ?? "",
              machine: u.machineName ?? u.machine ?? "",
              shift: u.shift ?? "",
              plant: u.plantId != null ? String(u.plantId) : (u.plant ?? ""),
              plantLocation: u.plantLocation ?? "",
              grade: u.grade ?? "",
              designation: u.designation ?? "",
              category: u.category ?? "",
              gender: u.gender ?? "",
              bloodGroup: u.bloodGroup ?? "",
              maritalStatus: u.maritalStatus ?? "",
              email: u.email ?? "",
              number: u.mobileNo ?? u.number ?? "",
              salary: u.salary != null ? String(u.salary) : "",
            }));
          }
        } catch (fetchErr) {
          console.warn("Could not load users list from API for Operator check:", fetchErr);
        }

        // Merge with SEED_EMPLOYEES if needed
        if (usersList.length === 0) {
          usersList = [...SEED_EMPLOYEES];
        } else {
          SEED_EMPLOYEES.forEach((seed) => {
            const seedPay = String(seed.payCode || seed.paycode).trim();
            if (seedPay && !usersList.some((u) => String(u.payCode || u.paycode).trim() === seedPay)) {
              usersList.push(seed);
            }
          });
        }

        // Apply any saved role designation overrides
        const syncedUsers = applyRoleDesignationOverrides(usersList);

        // Filter for Operator designation and match Username (Name) and Password (Paycode)
        matchedOperator = syncedUsers.find((u) => {
          const designation = String(u.designation || u.role || u.roleName || "").trim().toLowerCase();
          if (designation !== "operator") return false;

          const uPayCode = String(u.payCode || u.paycode || "").trim();
          if (!uPayCode || uPayCode.toLowerCase() !== inputPassword.toLowerCase()) {
            return false;
          }

          const uName = String(u.empName || u.name || "").trim().toLowerCase();
          const uUsername = String(u.username || "").trim().toLowerCase();
          const uEmail = String(u.email || "").trim().toLowerCase();

          return (
            (uName && uName === inputUsername) ||
            (uUsername && uUsername === inputUsername) ||
            (uEmail && uEmail === inputUsername)
          );
        });
      } catch (checkErr) {
        console.warn("Operator login check error:", checkErr);
      }

      if (matchedOperator) {
        const operatorProfile = {
          id: matchedOperator.id || `op_${matchedOperator.payCode || matchedOperator.paycode || Date.now()}`,
          name: matchedOperator.empName || matchedOperator.name || trimmedEmail,
          empName: matchedOperator.empName || matchedOperator.name || trimmedEmail,
          paycode: matchedOperator.paycode || matchedOperator.payCode || inputPassword,
          payCode: matchedOperator.payCode || matchedOperator.paycode || inputPassword,
          cardNo: matchedOperator.cardNo || "",
          joiningDate: matchedOperator.joiningDate || matchedOperator.dateOfJoining || "",
          dateOfJoining: matchedOperator.dateOfJoining || matchedOperator.joiningDate || "",
          department: matchedOperator.department || "Production",
          subDepartment: matchedOperator.subDepartment || "",
          line: matchedOperator.line || "",
          machine: matchedOperator.machine || "",
          plant: matchedOperator.plant || "",
          plantLocation: matchedOperator.plantLocation || "",
          designation: matchedOperator.designation || "Operator",
          email:
            matchedOperator.email ||
            `${String(matchedOperator.payCode || matchedOperator.paycode || "operator").trim().toLowerCase()}@ntf.com`,
          username: matchedOperator.empName || matchedOperator.name || trimmedEmail,
          role: "employee",
          isEmployee: true,
        };

        saveEmployeeSession(operatorProfile);
        navigate("/employee", { replace: true });
        return;
      }

      // 3. Admin / standard API Login call
      const res = await AuthApi.login(credentials);

      // 4. Save session to authStorage
      saveSession(res.data);

      // 5. Redirect based on role
      if (isEmployee()) {
        navigate("/employee", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
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
