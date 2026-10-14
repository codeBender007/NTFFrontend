import { useState } from "react";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import KPICards from "../../../components/KPICards";
import Filters from "../../../components/Filters";
// import OperatorTraining from "../components/OperatorTraining";
import { lmsMenus } from "../data/LMSMenu";
// import TrainingPlan from "../components/TrainingPlan";
// import ManRelatedDefects from "../components/ManRelatedDefects";
// import TrainingPlanActual from "../components/TrainingPlanActual";
// import ManPowerTrend from "../components/ManpowerTrend";
// import AttritionAbsentism from "../components/AttritionAbsentism";

const kpiData = [
  {
    title: "Total Operators",
    value: 10,
    color: "blue",
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 24 }} />,
  },
  {
    title: "Total Sections",
    value: 318,
    color: "green",
    icon: <PersonOutlinedIcon sx={{ fontSize: 24 }} />,
  },
  {
    title: "Total Courses",
    value: 670,
    color: "red",
    icon: <GroupsOutlinedIcon sx={{ fontSize: 24 }} />,
  },
  {
    title: "Dojo Hiring",
    value: "85.2%",
    color: "purple",
    icon: <SignalCellularAltRoundedIcon sx={{ fontSize: 24 }} />,
  },
];

const LMSDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <div className="flex h-screen bg-[#F7F7F5] overflow-hidden">
      <Sidebar
        menuItems={lmsMenus}
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
          <KPICards data={kpiData} />
          <Filters />
          {/* <OperatorTraining />
          <TrainingPlan />
          <ManRelatedDefects />
          <TrainingPlanActual />
          <ManPowerTrend />
          <AttritionAbsentism /> */}
        </main>
      </div>
    </div>
  );
};

export default LMSDashboard;
