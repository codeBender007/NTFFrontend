// import { useState } from "react";
// import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import { useNavigate } from "react-router-dom";
// import AuthLayout from "../components/AuthLayout";

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ empId: "", password: "" });

//   const handleChange = (e) =>
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(formData);
//     navigate("/home");
//   };

//   const fields = [
//     { name: "empId", type: "text", placeholder: "Employee ID", Icon: BadgeOutlinedIcon },
//     { name: "password", type: "password", placeholder: "Password", Icon: LockOutlinedIcon },
//   ];

//   return (
//     <AuthLayout
//       welcomeTitle="Welcome Back!"
//       welcomeText="Login to access the NTF Attendance & Manpower Management System."
//       title="Login"
//       subtitle="Welcome back, please login to your account"
//     >
//       <form onSubmit={handleSubmit} className="space-y-5">
//         {fields.map(({ name, type, placeholder, Icon }) => (
//           <div key={name} className="flex items-center border rounded-lg px-5 h-12">
//             <Icon className="text-gray-400" />
//             <input
//               type={type}
//               name={name}
//               placeholder={placeholder}
//               value={formData[name]}
//               onChange={handleChange}
//               className="w-full ml-3 outline-none"
//             />
//           </div>
//         ))}

//         <div className="flex justify-end">
//           <button
//             type="button"
//             onClick={() => navigate("/forgot-password")}
//             className="text-sm font-medium text-primary hover:underline"
//           >
//             Forgot Password?
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="w-full h-12 rounded-lg bg-gradient-to-r from-primary-light to-primary-dark text-white font-semibold shadow-lg hover:opacity-90 transition"
//         >
//           Login
//         </button>
//       </form>
//     </AuthLayout>
//   );
// };

// export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import loginBg from "../assets/images/ntf-login-bg.png";
import ntfBlackLogo from "../assets/images/NTF_logo_black.png";
import AuthApi from "../features/auth/services/AuthApi";
import { saveSession } from "../features/auth/utils/authStorage";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await AuthApi.login({
        email: email.trim(),
        password,
      });

      saveSession(data);
      navigate("/home");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string" && detail
          ? detail
          : "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#F7F7F5] bg-cover bg-center bg-no-repeat lg:h-screen lg:min-h-0"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      {/* Background Overlay - Soft neutral tint */}
      <div className="absolute inset-0 backdrop-blur-[2px]"></div>

      {/* Login Container */}
      <div className="relative flex min-h-screen w-full items-center justify-center px-5 py-6 sm:px-8 lg:h-screen lg:min-h-0 lg:px-12 lg:py-3">

        {/* ================= DESKTOP LOGIN SECTION ================= */}
        <div className="hidden w-full max-w-[420px] lg:block">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/90 backdrop-blur-md px-7 py-7 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <div className="relative z-10">

              {/* Logo */}
              <div className="mb-5 flex justify-center">
                <img
                  src={ntfBlackLogo}
                  alt="NTF Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>

              {/* Heading */}
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
                  Login to Your Account
                </h2>
                <p className="mt-1 text-xs text-[#64748b]">
                  Enter your credentials to access the NTF portal
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">

                {/* Username */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0f172a]">
                    Email
                  </label>

                  <div className="flex h-[46px] items-center rounded-xl border border-[#e2edf2] bg-[#FFFFFF] px-3 transition-all focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/15">
                    <PersonIcon
                      className="mr-2.5 text-[#94a3b8]"
                      fontSize="small"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="h-full w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0f172a]">
                    Password
                  </label>

                  <div className="flex h-[46px] items-center rounded-xl border border-[#e2edf2] bg-[#FFFFFF] px-3 transition-all focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/15">
                    <LockOutlinedIcon
                      className="mr-2.5 text-[#94a3b8]"
                      fontSize="small"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-full w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 flex items-center justify-center text-[#94a3b8] transition hover:text-[#0f172a]"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-xs font-medium text-[#e11d48]">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] text-sm font-semibold text-white shadow-sm shadow-[#0d9488]/30 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{loading ? "Signing In..." : "Sign In"}</span>

                  <ArrowForwardIcon
                    fontSize="small"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E5E5E5]"></div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8A8A]">
                  Secure Authentication
                </span>
                <div className="h-px flex-1 bg-[#E5E5E5]"></div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8A8A8A]">
                <SecurityOutlinedIcon fontSize="inherit" />
                <span>Protected enterprise management system</span>
              </div>

            </div>
          </div>
        </div>

        {/* ================= MOBILE LOGIN SECTION ================= */}
        <div className="flex w-full items-center justify-center lg:hidden">
          <div className="w-full max-w-[420px] rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/90 backdrop-blur-md px-6 py-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-8">

            {/* Mobile Logo */}
            <div className="mb-5 flex justify-center">
              <img
                src={ntfBlackLogo}
                alt="NTF Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Mobile Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
                Login to Your Account
              </h2>
              <p className="mt-1 text-xs text-[#64748b]">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Username */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#0f172a]">
                  Email
                </label>

                <div className="flex h-12 items-center rounded-xl border border-[#e2edf2] bg-[#FFFFFF] px-3.5 focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/15">
                  <PersonIcon
                    className="mr-3 text-[#64748b]"
                    fontSize="small"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="h-full w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#0f172a]">
                  Password
                </label>

                <div className="flex h-12 items-center rounded-xl border border-[#e2edf2] bg-[#FFFFFF] px-3.5 focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/15">
                  <LockOutlinedIcon
                    className="mr-3 text-[#64748b]"
                    fontSize="small"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-full w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-[#64748b] hover:text-[#0f172a]"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-xs font-medium text-[#e11d48]">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-sm font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all duration-200 hover:from-[#0f766e] hover:to-[#0d9488] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? "Signing In..." : "Sign In"}</span>

                <ArrowForwardIcon
                  fontSize="small"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>

            </form>

            {/* Mobile Secure Footer */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#8A8A8A]">
              <SecurityOutlinedIcon fontSize="inherit" />
              <span>Protected enterprise management system</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;