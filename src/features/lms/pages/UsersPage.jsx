import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import KPICards from "../../../components/KPICards";
import Users from "../components/Users";
import { lmsMenus } from "../data/LMSMenu";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { isUserInactive } from "../utils/userUtils";

const UsersPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Users");
  const [users, setUsers] = useState([]);

  const kpiData = [
    {
      title: "Total Users",
      value: users.length,
      color: "blue",
      icon: <GroupOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Active Users",
      value: users.filter((user) => !user.leavingDate && !isUserInactive(user)).length,
      color: "green",
      icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Left Users",
      value: users.filter((user) => user.leavingDate).length,
      color: "orange",
      icon: <PersonOffOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Departments",
      value: new Set(users.map((user) => user.department).filter(Boolean)).size,
      color: "red",
      icon: <ApartmentOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Dojo Users",
      value: users.filter((user) => user.isDojo === "Yes").length,
      color: "purple",
      icon: <SchoolOutlinedIcon sx={{ fontSize: 24 }} />,
    },
  ];

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
          <Navbar setMobileOpen={setMobileOpen} activeMenu={activeMenu} />
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
          {/* KPI CARDS */}
          <KPICards
            gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            data={kpiData}
          />

          {/* TABLE */}
          <Users users={users} setUsers={setUsers} />
        </main>
      </div>
    </div>
  );
};

export default UsersPage;
