import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar.jsx";
import Sidebar from "@/components/Sidebar.jsx";
import { employeeMenus } from "@/features/employee/data/employeeMenu.js";
import { clearSession } from "@/features/auth/utils/authStorage.js";
import { useSidebar } from "@/contexts/SidebarContext.jsx";

export default function EmployeeLayout() {
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
      {/* Top Employee Navigation (matching Admin Portal Navbar) */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Employee Container */}
      <div className="flex flex-1 relative">
        {/* Left Employee Sidebar (matching Admin Portal Sidebar) */}
        <Sidebar
          menu={employeeMenus}
          homePath="/employee/upcoming-papers"
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
