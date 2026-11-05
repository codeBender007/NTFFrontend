import { useState } from "react";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import KPICards from "../../../components/KPICards";
import { lmsMenus } from "../data/LMSMenu";
import { loadOperators } from "../utils/operatorUtils";
import Operators from "../components/Operators";

const OperatorsPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Operators");
  const [operators, setOperators] = useState(loadOperators);

  const kpiData = [
    {
      title: "Total Operators",
      value: operators.length,
      color: "blue",
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Active Operators",
      value: operators.filter((operator) => !operator.leavingDate).length,
      color: "green",
      icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Left Operators",
      value: operators.filter((operator) => operator.leavingDate).length,
      color: "orange",
      icon: <PersonOffOutlinedIcon sx={{ fontSize: 24 }} />,
    },
    {
      title: "Departments",
      value: new Set(
        operators.map((operator) => operator.department).filter(Boolean),
      ).size,
      color: "red",
      icon: <ApartmentOutlinedIcon sx={{ fontSize: 24 }} />,
    },
  ];

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

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <KPICards data={kpiData} />
          <Operators operators={operators} setOperators={setOperators} />
        </main>
      </div>
    </div>
  );
};

export default OperatorsPage;
