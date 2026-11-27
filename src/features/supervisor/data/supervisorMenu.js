import { FilePlus, FileText, Send, ClipboardCheck } from "lucide-react";

export const supervisorMenus = [
  {
    id: "Create Question Paper",
    name: "Create Question Paper",
    label: "Create Question Paper",
    icon: FilePlus,
    path: "/supervisor/create",
    nestedPaths: ["/supervisor/create", "/supervisor/edit"],
  },
  {
    id: "Saved Test Papers",
    name: "Saved Test Papers",
    label: "Saved Test Papers",
    icon: FileText,
    path: "/supervisor/saved-papers",
    nestedPaths: ["/supervisor/saved-papers", "/supervisor/preview"],
  },
  {
    id: "Assign to Operators",
    name: "Assign to Operators",
    label: "Assign to Operators",
    icon: Send,
    path: "/supervisor/assign-operators",
    nestedPaths: ["/supervisor/assign-operators"],
  },
  {
    id: "Submitted Papers",
    name: "Submitted Papers",
    label: "Submitted Papers",
    icon: ClipboardCheck,
    path: "/supervisor/submitted-papers",
    nestedPaths: ["/supervisor/submitted-papers"],
  },
];

export default supervisorMenus;
