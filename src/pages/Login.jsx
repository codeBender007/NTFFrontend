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

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // Add your existing login/authentication logic here
    if (username && password) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/home");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat lg:h-screen lg:min-h-0"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#0B1636]/25"></div>

      {/* Login Container */}
      <div className="relative flex min-h-screen w-full items-center justify-center px-5 py-6 sm:px-8 lg:h-screen lg:min-h-0 lg:px-12 lg:py-3">

          {/* ================= DESKTOP LOGIN SECTION ================= */}
          <div className="hidden w-full max-w-[400px] lg:block">

            <div className="relative w-full overflow-hidden rounded-[20px] bg-white px-6 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] xl:max-w-[410px] xl:px-7 xl:py-5">
            

              <div className="relative z-10">

                {/* Logo */}
                <div className="mb-3 flex justify-center">
                  <img
                    src={ntfBlackLogo}
                    alt="NTF Logo"
                    className="w-[110px] object-contain"
                  />
                </div>

                {/* Heading */}
                <div className="mb-4">
                  <h2 className="text-[22px] font-bold leading-tight text-[#111827]">
                    Login to Your Account
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Enter your credentials to continue.
                  </p>
                </div>

                <form onSubmit={handleLogin}>

                  {/* Username */}
                  <div className="mb-3">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Username
                    </label>

                    <div className="flex h-[48px] items-center rounded-xl border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-[#7A5AF8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A5AF8]/10">

                      <PersonIcon
                        className="mr-2.5 text-gray-400"
                        fontSize="small"
                      />

                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Password
                    </label>

                    <div className="flex h-[48px] items-center rounded-xl border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-[#7A5AF8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A5AF8]/10">

                      <LockOutlinedIcon
                        className="mr-2.5 text-gray-400"
                        fontSize="small"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 flex items-center justify-center text-gray-400 transition hover:text-gray-600"
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon fontSize="small" />
                        ) : (
                          <VisibilityOutlinedIcon fontSize="small" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="group flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6F4AE7] to-[#7A5AF8] text-sm font-semibold text-white shadow-lg shadow-[#6F4AE7]/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-[#6F4AE7]/30 active:translate-y-0"
                  >
                    <span>Login</span>

                    <ArrowForwardIcon
                      fontSize="small"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>

                </form>

                {/* Divider */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-100"></div>

                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Secure Login
                  </span>

                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                  <SecurityOutlinedIcon fontSize="inherit" />

                  <span>
                    Your account information is securely protected
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* ================= MOBILE LOGIN SECTION ================= */}
          <div className="flex w-full items-center justify-center lg:hidden">

            <div className="w-full max-w-[480px] rounded-[24px] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:px-9">

              {/* Mobile Logo */}
              <div className="mb-5 flex justify-center">
                <img
                  src={ntfBlackLogo}
                  alt="NTF Logo"
                  className="w-[100px] object-contain"
                />
              </div>

              {/* Mobile Heading */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-[#111827]">
                  Login to Your Account
                </h2>

                <p className="mt-1.5 text-sm text-gray-500">
                  Enter your credentials to continue.
                </p>
              </div>

              <form onSubmit={handleLogin}>

                {/* Username */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Username
                  </label>

                  <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#7A5AF8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A5AF8]/10">

                    <PersonIcon
                      className="mr-3 text-gray-400"
                      fontSize="small"
                    />

                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#7A5AF8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A5AF8]/10">

                    <LockOutlinedIcon
                      className="mr-3 text-gray-400"
                      fontSize="small"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6F4AE7] to-[#7A5AF8] text-sm font-semibold text-white shadow-lg shadow-[#6F4AE7]/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0"
                >
                  <span>Login</span>

                  <ArrowForwardIcon
                    fontSize="small"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

              </form>

              {/* Mobile Secure Footer */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <SecurityOutlinedIcon fontSize="inherit" />

                <span>
                  Secure and protected login
                </span>
              </div>

            </div>
          </div>

        </div>
    </div>
  );
};

export default Login;