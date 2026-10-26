import { useEffect, useState } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUser } from "../features/auth/utils/authStorage";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const trimmed = name.trim();
  if (!trimmed) return "U";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatRole = (role) => {
  if (!role || typeof role !== "string") return "";
  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Resolve dynamic title based on current route or activeMenu
const resolveTitle = (pathname, activeMenu) => {
  const cleanPath = pathname?.replace(/\/+$/, "") || "";

  // 1. LMS navigation routes
  if (cleanPath === "/lms/dashboard" || cleanPath === "/lms") return "Overview";
  if (cleanPath === "/lms/dojo-hiring" || cleanPath === "/lms/hiring") return "DOJO Hiring";
  if (
    cleanPath.startsWith("/lms/l0") ||
    cleanPath.startsWith("/lms/l1") ||
    cleanPath.startsWith("/lms/paper")
  ) {
    return "DOJO Hiring";
  }
  if (cleanPath === "/lms/roles") return "Roles & Permissions";
  if (cleanPath === "/lms/users" || cleanPath.startsWith("/lms/user/")) return "Users";
  if (cleanPath === "/lms/training") return "Training Effectiveness";
  if (cleanPath === "/lms/operator-observance") return "10 Cycle Operator";
  if (cleanPath === "/lms/operators" || cleanPath.startsWith("/lms/operator/")) return "Operators";
  if (
    cleanPath === "/lms/plant" ||
    cleanPath.startsWith("/lms/plant/") ||
    cleanPath.startsWith("/lms/department") ||
    cleanPath.startsWith("/lms/subdepartment") ||
    cleanPath.startsWith("/lms/line") ||
    cleanPath.startsWith("/lms/machine")
  ) {
    if (activeMenu && activeMenu !== "LMS" && activeMenu !== "Dashboard") {
      return activeMenu;
    }
    return "Plant";
  }

  // 2. Dashboard navigation routes
  if (cleanPath === "/dashboard") return "Dashboard";
  if (cleanPath === "/dashboard/attendance") return "Attendance";
  if (cleanPath === "/dashboard/requirement") return "Requirement";
  if (cleanPath === "/home") return "Home Portal";

  // 3. Fallback based on activeMenu or default
  if (activeMenu) {
    if (activeMenu === "LMS") return "DOJO Hiring";
    if (activeMenu === "Dashboard" && cleanPath.startsWith("/lms")) return "Overview";
    return activeMenu;
  }

  return "Overview";
};

const Navbar = ({ activeMenu, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const currentUser = getUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Failed to load user profile in Navbar:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);
    return () => {
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  const userName =
    user?.empName?.trim() ||
    user?.name?.trim() ||
    user?.username?.trim() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";

  const userInitials = getInitials(userName);

  const formattedRole = formatRole(user?.role);
  const departmentName = user?.departmentName || user?.department;
  const userRoleOrDept =
    formattedRole && departmentName
      ? `${formattedRole} • ${departmentName}`
      : formattedRole || departmentName || user?.designation || "NTF Operations";

  const title = resolveTitle(location.pathname, activeMenu);

  return (
    <nav className="bg-white/85 backdrop-blur-md h-16 border-b border-[#e2edf2] flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        {setMobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-[#e2edf2] bg-white text-[#0f172a] hover:bg-[#e6f7f5] hover:text-[#0d9488] transition-colors shadow-xs"
            title="Open Navigation"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-xl border border-[#e2edf2] bg-white flex items-center justify-center text-[#64748b] hover:bg-[#e6f7f5] hover:text-[#0d9488] transition-colors shrink-0 shadow-xs"
          title="Go Back"
        >
          <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
        </button>

        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#0f172a] truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle & Right Section */}
      <div className="flex items-center gap-3 shrink-0">
        {/* User Profile */}
        {loadingUser ? (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#e2edf2] shadow-xs animate-pulse">
            <div className="h-7 w-7 rounded-full bg-gray-200" />
            <div className="hidden sm:flex flex-col gap-1 text-left">
              <div className="h-2.5 w-16 rounded bg-gray-200" />
              <div className="h-2 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#e2edf2] shadow-xs">
            <div
              className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#0d9488] to-[#14b8a6] text-white flex items-center justify-center text-xs font-semibold shadow-xs select-none"
              title={userName}
            >
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span
                className="text-xs font-semibold text-[#0f172a] leading-none truncate max-w-[140px]"
                title={userName}
              >
                {userName}
              </span>
              <span
                className="text-[10px] text-[#64748b] leading-none mt-1 truncate max-w-[140px]"
                title={userRoleOrDept}
              >
                {userRoleOrDept}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

