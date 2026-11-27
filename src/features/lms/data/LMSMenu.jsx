import {
  LayoutGrid,
  LayoutDashboard,
  GraduationCap,
  Factory,
  CheckSquare,
  Users,
  ShieldCheck,
  Award,
} from "lucide-react";

export const lmsMenus = [
  {
    id: "Home",
    name: "Home Portal",
    label: "Home Portal",
    icon: LayoutGrid,
    path: "/home",
    nestedPaths: ["/home"],
  },
  {
    id: "Overview",
    name: "Overview",
    label: "Overview",
    icon: LayoutDashboard,
    path: "/lms/dashboard",
    nestedPaths: ["/lms/dashboard"],
  },
  {
    id: "DOJO Hiring",
    name: "DOJO Hiring",
    label: "DOJO Hiring",
    icon: GraduationCap,
    path: "/lms/dojo-hiring",
    nestedPaths: [
      "/lms/dojo-hiring",
      "/lms/day-1",
      "/lms/day-2",
      "/lms/l0",
      "/lms/l1",
      "/lms/paper",
    ],
  },
  {
    id: "Plant",
    name: "Plant",
    label: "Plant",
    icon: Factory,
    path: "/lms/plant",
    nestedPaths: [
      "/lms/plant",
      "/lms/department",
      "/lms/subdepartment",
      "/lms/line",
      "/lms/machine",
    ],
  },
  {
    id: "10 Cycle Operator",
    name: "10 Cycle Operator",
    label: "10 Cycle Operator",
    icon: CheckSquare,
    path: "/lms/operator-observance",
    nestedPaths: [
      "/lms/operator-observance",
      "/lms/operators",
      "/lms/operator",
    ],
  },
  {
    id: "Users",
    name: "Users",
    label: "Users",
    icon: Users,
    path: "/lms/users",
    nestedPaths: [
      "/lms/users",
      "/lms/user",
    ],
  },
  {
    id: "Roles & Permissions",
    name: "Roles & Permissions",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    path: "/lms/roles",
    nestedPaths: ["/lms/roles"],
  },
  {
    id: "Training Effectiveness",
    name: "Training Effectiveness",
    label: "Training Effectiveness",
    icon: Award,
    path: "/lms/training",
    nestedPaths: ["/lms/training"],
  },
];

export default lmsMenus;
