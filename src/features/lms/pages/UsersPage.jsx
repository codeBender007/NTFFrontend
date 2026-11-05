import { useState } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Building2,
  GraduationCap,
} from "lucide-react";
import KPICards from "../../../components/KPICards";
import Users from "../components/Users";
import { isUserInactive } from "../utils/userUtils";

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  const kpiData = [
    {
      title: "Total Users",
      value: users.length,
      color: "blue",
      icon: <UsersIcon size={22} />,
    },
    {
      title: "Active Users",
      value: users.filter((user) => !user.leavingDate && !isUserInactive(user)).length,
      color: "green",
      icon: <UserCheck size={22} />,
    },
    {
      title: "Left Users",
      value: users.filter((user) => user.leavingDate).length,
      color: "orange",
      icon: <UserX size={22} />,
    },
    {
      title: "Departments",
      value: new Set(users.map((user) => user.department).filter(Boolean)).size,
      color: "red",
      icon: <Building2 size={22} />,
    },
    {
      title: "Dojo Users",
      value: users.filter((user) => user.isDojo === "Yes").length,
      color: "purple",
      icon: <GraduationCap size={22} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            Users Management
          </h2>
        </div>
      </div>

      {/* KPI CARDS */}
      <KPICards
        gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        data={kpiData}
      />

      {/* TABLE */}
      <Users users={users} setUsers={setUsers} />
    </div>
  );
};

export default UsersPage;
