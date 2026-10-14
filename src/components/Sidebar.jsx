import { useEffect } from "react";
import logo from "../assets/images/NTF_logo_black.png";
import sidebarBg from "../assets/images/sidebar_bg.png";
import { ChevronsLeft, ChevronsRight, LayoutGrid, LogOut, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthApi from "../features/auth/services/AuthApi";
import { clearSession } from "../features/auth/utils/authStorage";

const Sidebar = ({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  activeMenu,
  setActiveMenu,
  menuItems = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      // Always clear the local session, even if the server call fails
    } finally {
      clearSession();
      navigate("/");
    }
  };

  // Desktop = Open
  // Mobile = Collapsed
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Update when screen size changes
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setCollapsed]);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && !collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => {
            setCollapsed(true);
            setMobileOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`relative flex h-screen flex-col overflow-hidden border-r border-[#e2edf2] bg-white/90 backdrop-blur-md transition-all duration-300 ${collapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Sidebar Background Image - Subtle overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url(${sidebarBg})`,
          }}
        />

        {/* Sidebar Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div
            className={`flex h-16 shrink-0 items-center border-b border-[#e2edf2] ${collapsed ? "justify-center px-2" : "justify-between px-4"
              }`}
          >
            {/* Logo */}
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center">
                  <img
                    src={logo}
                    alt="NTF Logo"
                    className="h-12 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Collapse Button */}
            <button
              onClick={() => {
                setCollapsed(!collapsed);

                // Close mobile sidebar when collapsing
                if (window.innerWidth < 1024) {
                  setMobileOpen(false);
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2edf2] bg-white p-2 text-[#64748b] transition-all hover:bg-[#e6f7f5] hover:text-[#0d9488] shadow-xs"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronsRight size={18} />
              ) : (
                <ChevronsLeft size={18} />
              )}
            </button>
          </div>

          {/* Portal Switch */}
          <div className="px-3 pt-3">
            <button
              onClick={() => navigate("/home")}
              className={`group relative flex w-full items-center rounded-2xl border border-[#e2edf2] bg-white/80 py-2.5 transition-all duration-200 hover:border-[#0d9488]/40 hover:bg-[#e6f7f5]/40 shadow-xs ${collapsed ? "justify-center" : "gap-3 px-3"
                }`}
              title="Back to Home Portal"
            >
              {/* Portal Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white shadow-xs ${collapsed ? "mx-auto" : ""
                  }`}
              >
                <LayoutGrid size={18} />
              </div>

              {/* Portal Text */}
              {!collapsed && (
                <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                  Home Portal
                </span>
              )}

              {/* Tooltip when Collapsed */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <div className="whitespace-nowrap rounded-xl bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                    Home Portal
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3">
            {menuItems.map((item) => {
              const active =
                activeMenu === item.name ||
                (item.path && location.pathname === item.path) ||
                (item.path &&
                  item.path !== "/lms" &&
                  location.pathname.startsWith(item.path));

              return (
                <div key={item.name} className="group relative">
                  {/* Menu Button */}
                  <button
                    onClick={() => {
                      setActiveMenu(item.name);

                      if (item.path) {
                        navigate(item.path);
                      }

                      // Collapse sidebar after selecting menu on mobile
                      if (window.innerWidth < 1024) {
                        setCollapsed(true);
                        setMobileOpen(false);
                      }
                    }}
                    className={`flex w-full items-center rounded-2xl py-2.5 transition-all duration-200 ${collapsed ? "justify-center" : "gap-3 px-3"
                      } ${active
                        ? "bg-[#e6f7f5] font-semibold text-[#0d9488] shadow-xs"
                        : "text-[#64748b] hover:bg-[#f0f9f8] hover:text-[#0d9488]"
                      }`}
                  >
                    {/* Menu Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${active
                        ? "bg-white text-[#0d9488] shadow-xs"
                        : "bg-[#f1f6f9] text-[#64748b] group-hover:bg-[#e6f7f5] group-hover:text-[#0d9488]"
                        } ${collapsed ? "mx-auto" : ""}`}
                    >
                      {item.icon}
                    </div>

                    {/* Menu Name */}
                    {!collapsed && (
                      <span className="whitespace-nowrap text-sm">
                        {item.name}
                      </span>
                    )}

                    {/* Right Active Indicator Dot */}
                    {!collapsed && active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-[#0d9488]" />
                    )}
                  </button>

                  {/* Tooltip when Collapsed */}
                  {collapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      <div className="whitespace-nowrap rounded-xl bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                        {item.name}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Card & Logout */}
          <div className="mt-auto px-3 pb-4">
            {!collapsed && (
              <div className="mb-3 p-3 rounded-2xl bg-gradient-to-b from-[#f0fdfa] to-[#e6f7f5] border border-[#ccfbf1] text-center shadow-xs">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-[#0d9488] text-white shadow-xs">
                  <Sparkles size={14} />
                </div>
                <p className="text-xs font-bold text-[#0f172a]">NTF Operations</p>
                <p className="mt-0.5 text-[10px] text-[#64748b]">Live data sync &amp; analytics</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`group relative flex w-full items-center rounded-2xl py-2.5 transition-all duration-200 ${collapsed ? "justify-center" : "gap-3 px-3"
                } text-[#64748b] hover:bg-[#fff1f2] hover:text-[#fb7185]`}
            >
              {/* Logout Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 bg-[#f1f6f9] text-[#64748b] group-hover:bg-[#fff1f2] group-hover:text-[#fb7185] ${collapsed ? "mx-auto" : ""
                  }`}
              >
                <LogOut size={18} />
              </div>

              {/* Logout Text */}
              {!collapsed && (
                <span className="whitespace-nowrap text-sm font-medium">
                  Logout
                </span>
              )}

              {/* Tooltip when Collapsed */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <div className="whitespace-nowrap rounded-xl bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                    Logout
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
