import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import OperatorObservanceForm from "../components/OperatorObservanceForm";
import { lmsMenus } from "../data/LMSMenu";

const OperatorObservancePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("10 Cycle Operator");

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
          <Navbar
            setMobileOpen={setMobileOpen}
            activeMenu="10 Cycle Operator"
          />
        </div>

        {/* OPERATOR OBSERVANCE FORM */}
        <main className="flex-1 overflow-y-auto">
          <OperatorObservanceForm />
        </main>
      </div>
    </div>
  );
};

export default OperatorObservancePage;