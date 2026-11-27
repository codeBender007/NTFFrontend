import { FileText, CheckCircle2 } from "lucide-react";

export const employeeMenus = [
  {
    id: "Current Question Paper",
    name: "Current Question Paper",
    label: "Current Question Paper",
    icon: FileText,
    path: "/employee/upcoming-papers",
    nestedPaths: ["/employee/upcoming-papers"],
  },
  {
    id: "Past Question Paper",
    name: "Past Question Paper",
    label: "Past Question Paper",
    icon: CheckCircle2,
    path: "/employee/past-papers",
    nestedPaths: ["/employee/past-papers"],
  },
];

export default employeeMenus;
