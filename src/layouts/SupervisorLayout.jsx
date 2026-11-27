import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar.jsx";
import Sidebar from "@/components/Sidebar.jsx";
import { supervisorMenus } from "@/features/supervisor/data/supervisorMenu.js";
import { clearSession } from "@/features/auth/utils/authStorage.js";
import { useSidebar } from "@/contexts/SidebarContext.jsx";

export default function SupervisorLayout() {
  const { isCollapsed } = useSidebar();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-slate-800">
      {/* Top Supervisor Navigation (matching Admin & Employee Portals) */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Supervisor Container */}
      <div className="flex flex-1 relative">
        {/* Left Supervisor Sidebar */}
        <Sidebar
          menu={supervisorMenus}
          homePath="/supervisor/create"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Right Main Content */}
        <main
          className={`flex-1 p-3 sm:p-4 md:p-5 min-h-[calc(100vh-64px)] overflow-x-hidden transition-all duration-300 ${
            isCollapsed ? "ml-0 lg:ml-20" : "ml-0 lg:ml-60"
          }`}
        >
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
}
