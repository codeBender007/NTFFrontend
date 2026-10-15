import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Resolve dynamic title based on current route or activeMenu
const resolveTitle = (pathname, activeMenu) => {
  const cleanPath = pathname?.replace(/\/+$/, "") || "";

  // 1. LMS navigation routes
  if (cleanPath === "/lms/dashboard") return "Overview";
  if (cleanPath === "/lms") return "DOJO Hiring";
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
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#e2edf2] shadow-xs">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#0d9488] to-[#14b8a6] text-white flex items-center justify-center text-xs font-semibold shadow-xs">
            TA
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#0f172a] leading-none">Admin</span>
            <span className="text-[10px] text-[#64748b] leading-none mt-1">NTF Operations</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

