import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 overflow-y-auto bg-[#F7F7F5] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
