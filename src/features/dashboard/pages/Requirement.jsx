import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import Filters from "../../../components/Filters";
import RequirementTable from "../components/RequirementTable";
import { dashboardMenus } from "../data/DashboardMenu";

const Requirement = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Requirement");

  return (
    <div className="flex h-screen bg-[#F7F7F5] overflow-hidden">
      <Sidebar
        menuItems={dashboardMenus}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <Navbar setMobileOpen={setMobileOpen} activeMenu={activeMenu} />
        </div>

        <main className="flex-1 overflow-y-auto px-6 pt-5 pb-8 space-y-6">
          <Filters />
          <RequirementTable />
        </main>
      </div>
    </div>
  );
};

export default Requirement;