import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import OperatorProfileDetails from "../components/OperatorProfileDetails";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { lmsMenus } from "../data/LMSMenu";
import { OPERATORS_STORAGE_KEY, SEED_OPERATORS, loadOperators, formatDate } from "../utils/operatorUtils";

const OperatorProfile = () => {
  const { id } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Operators");
  const [operators] = useLocalStorage(OPERATORS_STORAGE_KEY, loadOperators);
  const found = operators.find((item) => item.id === id);

  const operator = found
    ? {
      sno: found.sno,
      name: found.empName,
      employeeId: found.payCode,
      cardNo: found.cardNo,
      department: found.department,
      status: found.leavingDate ? "Left" : "Active",
      level: found.skillLevel || found.grade,
      designation: found.designation,
      category: found.category,
      grade: found.grade,
      companyName: found.companyName,
      subDepartment: found.subDepartment,
      line: found.line,
      machine: found.machine,
      shift: found.shift,
      plant: found.plant,
      plantLocation: found.plantLocation,
      isDojo: found.isDojo,
      fatherHusband: found.fatherName,
      gender: found.gender,
      dob: formatDate(found.dob),
      bloodGroup: found.bloodGroup,
      maritalState: found.maritalState,
      email: found.email,
      phone: found.number,
      joiningDate: formatDate(found.joiningDate),
      leavingDate: formatDate(found.leavingDate),
      firstOfDate: formatDate(found.firstOfDate),
      salary: found.salary,
    }
    : undefined;

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
          <Navbar setMobileOpen={setMobileOpen} activeMenu="Operators" />
        </div>

        {/* PROFILE CONTENT */}

        <main className="flex-1 overflow-y-auto">
          <OperatorProfileDetails operator={operator} />
        </main>
      </div>
    </div>
  );
};

export default OperatorProfile;
