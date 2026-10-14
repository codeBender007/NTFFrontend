import { useState } from "react";
// import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
// import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import DailyManpower from "../components/DailyManpower";
// import KPICards from "../../../components/KPICards";
import Filters from "../../../components/Filters";
import Attrition from "../components/Attrition";
import Absentism from "../components/Absentism";
import DailySalary from "../components/DailySalary";
import DojoManpowerTrend from "../components/DojoManpowerTrend";
import SkillLevelDistribution from "../components/SkillLevelDistribution";
import GenderDistribution from "../components/GenderDistribution";
// import GenderAttendance from "../components/GenderAttendance";
import { dashboardMenus } from "../data/DashboardMenu";

// const kpiData = [
//   {
//     title: "L0 Pages",
//     value: 10,
//     color: "blue",
//     icon: <PeopleAltOutlinedIcon sx={{ fontSize: 24 }} />,
//   },
//   {
//     title: "Total Present",
//     value: 318,
//     color: "green",
//     icon: <PersonOutlinedIcon sx={{ fontSize: 24 }} />,
//   },
//   {
//     title: "Total Manpower",
//     value: 670,
//     color: "red",
//     icon: <GroupsOutlinedIcon sx={{ fontSize: 24 }} />,
//   },
//   {
//     title: "Attendance %",
//     value: "85.2%",
//     color: "purple",
//     icon: <SignalCellularAltRoundedIcon sx={{ fontSize: 24 }} />,
//   },
// ];

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

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
          {/* <KPICards data={kpiData} /> */}
          <Filters />
          <DailyManpower />
          <div className="grid gap-6 lg:grid-cols-2">
            <Attrition />
            <Absentism />
          </div>
          <DailySalary />
          <DojoManpowerTrend />
          <SkillLevelDistribution />
          <GenderDistribution />
          {/* <GenderAttendance /> */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
