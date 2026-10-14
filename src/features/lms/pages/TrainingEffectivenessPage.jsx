import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import TrainingEffectivenessForm from "../components/TrainingEffectivenessForm";
import { lmsMenus } from "../data/LMSMenu";

const TrainingEffectivenessPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Training Effectiveness Form");

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      <Sidebar
        menuItems={lmsMenus}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <Navbar setMobileOpen={setMobileOpen} activeMenu={activeMenu} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <TrainingEffectivenessForm />
        </main>
      </div>
    </div>
  );
};

export default TrainingEffectivenessPage;