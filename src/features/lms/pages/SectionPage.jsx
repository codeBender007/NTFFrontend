import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import Section from "../components/Section";
import { lmsMenus } from "../data/LMSMenu";

const SectionPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Plant");

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      {/* SIDEBAR */}

      <Sidebar
        menuItems={lmsMenus}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* NAVBAR */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <Navbar setMobileOpen={setMobileOpen} activeMenu="Section" />
        </div>

        {/* SECTION PAGE */}

        <main className="flex-1 overflow-y-auto">
          <Section />
        </main>
      </div>
    </div>
  );
};

export default SectionPage;
