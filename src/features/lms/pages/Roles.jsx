import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { lmsMenus } from "../data/LMSMenu";

import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Users,
  UserCog,
  BookOpen,
  Building2,
  LayoutDashboard,
  FileText,
  Edit3,
  Eye,
  Trash2,
  Upload,
  Plus,
  Search,
  X,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Lock,
  Unlock,
  Settings2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  CheckSquare,
} from "lucide-react";

const permissionActions = ["View", "Upload Excel", "Create", "Edit", "Delete"];

const actionMeta = {
  View: {
    icon: Eye,
    color: "#3b82f6",
    badge: "Read Only",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    description: "Can view and inspect dashboards, operational tables, metrics and reports",
    risk: "Low Risk",
    riskColor: "text-blue-600 bg-blue-50",
  },
  "Upload Excel": {
    icon: Upload,
    color: "#06b6d4",
    badge: "Bulk Import",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
    description: "Can upload spreadsheet templates and batch import operational datasets",
    risk: "Medium Risk",
    riskColor: "text-cyan-600 bg-cyan-50",
  },
  Create: {
    icon: Plus,
    color: "#10b981",
    badge: "Write Access",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    description: "Can create new records, modules, department units and test configurations",
    risk: "Standard",
    riskColor: "text-emerald-600 bg-emerald-50",
  },
  Edit: {
    icon: Edit3,
    color: "#f59e0b",
    badge: "Modify Data",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
    description: "Can modify existing entries, update settings and change operational statuses",
    risk: "Elevated",
    riskColor: "text-amber-600 bg-amber-50",
  },
  Delete: {
    icon: Trash2,
    color: "#ef4444",
    badge: "Destructive",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
    description: "Can permanently remove records, user accounts, and structural hierarchy items",
    risk: "High Privilege",
    riskColor: "text-rose-600 bg-rose-50",
  },
};

const moduleData = [
  {
    id: "dashboard",
    title: "Executive Dashboard",
    description: "High-level operations analytics, production trends & KPIs",
    category: "Operations Dashboard",
    icon: LayoutDashboard,
    color: "#3b82f6",
    permissions: ["Access"],
  },
  {
    id: "attendance",
    title: "Attendance Tracker",
    description: "Daily manpower attendance, shift presence & biometric records",
    category: "Operations Dashboard",
    icon: BookOpen,
    color: "#10b981",
    permissions: ["Access"],
  },
  {
    id: "requirement",
    title: "Manpower Requirement",
    description: "Daily requirement planning, station staffing & gap analysis",
    category: "Operations Dashboard",
    icon: Building2,
    color: "#f59e0b",
    permissions: ["Access"],
  },
  {
    id: "lms-dashboard",
    title: "LMS Overview",
    description: "Training analytics, learning progress & certification status",
    category: "Learning Management System",
    icon: LayoutDashboard,
    color: "#8b5cf6",
    permissions: ["Access"],
  },
  {
    id: "dojo-hiring",
    title: "DOJO Hiring",
    description: "Candidate onboarding, qualification tracks & skill assessment",
    category: "Learning Management System",
    icon: UserCog,
    color: "#06b6d4",
    permissions: ["Access"],
  },
  {
    id: "department",
    title: "Department Structure",
    description: "Plant hierarchy, sub-departments, lines & machine allocation",
    category: "Learning Management System",
    icon: Building2,
    color: "#f97316",
    permissions: ["Access"],
  },
  {
    id: "operators",
    title: "Operators Directory",
    description: "Operator profiles, skill levels, assignment history & records",
    category: "Learning Management System",
    icon: Users,
    color: "#3b82f6",
    permissions: ["Access"],
  },
  {
    id: "operator-observance",
    title: "10 Cycle Operator Observance",
    description: "Cycle time checks, standard work adherence & audit findings",
    category: "Learning Management System",
    icon: FileText,
    color: "#14b8a6",
    permissions: ["Access"],
  },
  {
    id: "users",
    title: "Users Management",
    description: "System user credentials, account provisioning & role assignment",
    category: "Learning Management System",
    icon: Users,
    color: "#10b981",
    permissions: ["Access"],
  },
  {
    id: "roles-and-permissions",
    title: "Roles & Permissions",
    description: "Security access policies, RBAC privilege matrix & governance",
    category: "Learning Management System",
    icon: ShieldCheck,
    color: "#f59e0b",
    permissions: ["Access"],
  },
  {
    id: "training-effectiveness",
    title: "Training Effectiveness",
    description: "L0/L1 evaluations, test paper editor & learning efficacy metrics",
    category: "Learning Management System",
    icon: BookOpen,
    color: "#ec4899",
    permissions: ["Access"],
  },
];

const defaultPageAccess = moduleData.reduce((acc, module) => {
  acc[module.id] = true;
  return acc;
}, {});

const defaultPermissions = {
  View: true,
  "Upload Excel": true,
  Create: true,
  Edit: true,
  Delete: true,
};

const DEFAULT_ROLES = [
  {
    id: 1,
    name: "Admin",
    shortName: "AD",
    icon: ShieldCheck,
    color: "#0d9488",
    users: 4,
    type: "System",
    description: "Full system access with complete management and governance capabilities",
  },
  {
    id: 2,
    name: "HR & Admin",
    shortName: "HR",
    icon: Users,
    color: "#3b82f6",
    users: 6,
    type: "Custom",
    description: "Manage plant personnel, departmental structures, and operator onboarding",
  },
  {
    id: 3,
    name: "Plant Supervisor",
    shortName: "PS",
    icon: UserCog,
    color: "#8b5cf6",
    users: 12,
    type: "Custom",
    description: "Daily manpower monitoring, attendance oversight, and line observance audits",
  },
  {
    id: 4,
    name: "Training Lead",
    shortName: "TL",
    icon: BookOpen,
    color: "#10b981",
    users: 3,
    type: "Custom",
    description: "DOJO evaluations, L0/L1 training modules, test paper previews & observance",
  },
];

const INITIAL_ROLE_SETTINGS = {
  1: {
    pageAccess: { ...defaultPageAccess },
    permissions: { ...defaultPermissions },
    status: true,
  },
  2: {
    pageAccess: {
      ...defaultPageAccess,
      "roles-and-permissions": false,
    },
    permissions: {
      View: true,
      "Upload Excel": true,
      Create: true,
      Edit: true,
      Delete: false,
    },
    status: true,
  },
  3: {
    pageAccess: {
      ...defaultPageAccess,
      "roles-and-permissions": false,
      users: false,
      department: false,
      "training-effectiveness": false,
    },
    permissions: {
      View: true,
      "Upload Excel": false,
      Create: true,
      Edit: true,
      Delete: false,
    },
    status: true,
  },
  4: {
    pageAccess: {
      ...defaultPageAccess,
      dashboard: false,
      attendance: false,
      requirement: false,
      department: false,
      users: false,
      "roles-and-permissions": false,
    },
    permissions: {
      View: true,
      "Upload Excel": true,
      Create: true,
      Edit: true,
      Delete: false,
    },
    status: true,
  },
};

const PRESET_COLORS = [
  "#0d9488", // Teal (NTF brand)
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#f43f5e", // Rose
];

const Roles = () => {
  // Navigation & layout state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Roles & Permissions");

  // Core Role state
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState(1);
  const [searchRole, setSearchRole] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState("All"); // All | System | Custom

  // Role permissions mapping (roleId -> { pageAccess, permissions, status })
  const [roleSettings, setRoleSettings] = useState(INITIAL_ROLE_SETTINGS);

  // Active tab within Role View
  const [activeTab, setActiveTab] = useState("Pages"); // "Pages" | "Permissions" | "Matrix"

  // Search & category filters within tabs
  const [searchPermission, setSearchPermission] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Toast feedback state
  const [toast, setToast] = useState("");
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Modals state
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleType, setNewRoleType] = useState("Custom");
  const [newRoleColor, setNewRoleColor] = useState(PRESET_COLORS[0]);

  // Edit Role Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDescription, setEditRoleDescription] = useState("");
  const [editRoleColor, setEditRoleColor] = useState(PRESET_COLORS[0]);

  // Delete Role Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Active selected role object
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;

  // Active role permissions settings helper
  const currentRoleSetting = useMemo(() => {
    if (!selectedRoleId || !roleSettings[selectedRoleId]) {
      return {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
    }
    return roleSettings[selectedRoleId];
  }, [selectedRoleId, roleSettings]);

  // Backwards-compatible getters
  const pageAccess = currentRoleSetting.pageAccess;
  const permissions = currentRoleSetting.permissions;
  const roleStatus = currentRoleSetting.status;

  // Filtered Roles on the Left Panel
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchRole.toLowerCase()) ||
        role.description.toLowerCase().includes(searchRole.toLowerCase());
      const matchesType =
        roleTypeFilter === "All" || role.type === roleTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [roles, searchRole, roleTypeFilter]);

  // Filtered Modules on the Pages Tab
  const filteredModules = useMemo(() => {
    const value = searchPermission.toLowerCase().trim();
    return moduleData.filter((module) => {
      const matchesSearch =
        !value ||
        module.title.toLowerCase().includes(value) ||
        module.description.toLowerCase().includes(value) ||
        module.category.toLowerCase().includes(value);

      const matchesCat =
        selectedCategory === "All" || module.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchPermission, selectedCategory]);

  // Grouped Modules for Display
  const groupedModules = useMemo(() => {
    return filteredModules.reduce((acc, module) => {
      const cat = module.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(module);
      return acc;
    }, {});
  }, [filteredModules]);

  // All distinct categories
  const categories = useMemo(() => {
    return ["All", ...new Set(moduleData.map((m) => m.category))];
  }, []);

  // Filtered Permissions Actions
  const filteredActions = useMemo(() => {
    const value = searchPermission.toLowerCase().trim();
    if (!value) return permissionActions;
    return permissionActions.filter((action) => {
      const meta = actionMeta[action];
      return (
        action.toLowerCase().includes(value) ||
        meta.description.toLowerCase().includes(value) ||
        meta.badge.toLowerCase().includes(value) ||
        meta.risk.toLowerCase().includes(value)
      );
    });
  }, [searchPermission]);

  // Metric Calculations
  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const systemRoles = roles.filter((r) => r.type === "System").length;
    const customRoles = roles.filter((r) => r.type === "Custom").length;
    const totalUsers = roles.reduce((sum, r) => sum + (r.users || 0), 0);
    const enabledModulesCount = Object.values(pageAccess).filter(Boolean).length;
    const enabledActionsCount = Object.values(permissions).filter(Boolean).length;

    return {
      totalRoles,
      systemRoles,
      customRoles,
      totalUsers,
      enabledModulesCount,
      enabledActionsCount,
      totalModulesCount: moduleData.length,
      totalActionsCount: permissionActions.length,
    };
  }, [roles, pageAccess, permissions]);

  // Handlers for Permission & Access Changes
  const togglePage = (moduleId) => {
    if (!selectedRoleId) return;
    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          pageAccess: {
            ...current.pageAccess,
            [moduleId]: !current.pageAccess[moduleId],
          },
        },
      };
    });
  };

  const setAllPages = (value) => {
    if (!selectedRoleId) return;
    const updated = {};
    moduleData.forEach((module) => {
      updated[module.id] = value;
    });

    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          pageAccess: updated,
        },
      };
    });
    showToast(value ? "All modules enabled for this role" : "All modules disabled for this role");
  };

  const toggleCategoryPages = (category, value) => {
    if (!selectedRoleId) return;
    const catModules = moduleData.filter((m) => m.category === category);
    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
      const updatedAccess = { ...current.pageAccess };
      catModules.forEach((m) => {
        updatedAccess[m.id] = value;
      });
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          pageAccess: updatedAccess,
        },
      };
    });
    showToast(`${value ? "Enabled" : "Disabled"} all ${category} modules`);
  };

  const togglePermission = (action) => {
    if (!selectedRoleId) return;
    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          permissions: {
            ...current.permissions,
            [action]: !current.permissions[action],
          },
        },
      };
    });
  };

  const setAllPermissions = (value) => {
    if (!selectedRoleId) return;
    const updated = {};
    permissionActions.forEach((action) => {
      updated[action] = value;
    });

    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          permissions: updated,
        },
      };
    });
    showToast(value ? "All actions granted for this role" : "All actions restricted for this role");
  };

  const toggleRoleStatus = () => {
    if (!selectedRoleId) return;
    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      };
      const newStatus = !current.status;
      showToast(`Role status set to ${newStatus ? "Active" : "Inactive"}`);
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          status: newStatus,
        },
      };
    });
  };

  // Reset Role to Default Template
  const handleResetDefaults = () => {
    if (!selectedRoleId) return;
    const defaultTemplate = INITIAL_ROLE_SETTINGS[selectedRoleId] || {
      pageAccess: { ...defaultPageAccess },
      permissions: { ...defaultPermissions },
      status: true,
    };

    setRoleSettings((prev) => ({
      ...prev,
      [selectedRoleId]: {
        pageAccess: { ...defaultTemplate.pageAccess },
        permissions: { ...defaultTemplate.permissions },
        status: defaultTemplate.status ?? true,
      },
    }));
    showToast("Role permissions reset to default configuration");
  };

  // Save changes handler
  const handleSaveChanges = () => {
    showToast(`Role privileges for "${selectedRole?.name}" saved successfully!`);
  };

  // Create Role handlers
  const openNewRoleModal = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRoleType("Custom");
    setNewRoleColor(PRESET_COLORS[roles.length % PRESET_COLORS.length]);
    setShowNewRoleModal(true);
  };

  const createRole = (e) => {
    e.preventDefault();
    const name = newRoleName.trim();
    if (!name) return;

    const shortName = name
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const nextId = roles.reduce((max, role) => Math.max(max, role.id), 0) + 1;

    const newRole = {
      id: nextId,
      name,
      shortName,
      icon: UserCog,
      color: newRoleColor,
      users: 0,
      type: newRoleType,
      description:
        newRoleDescription.trim() ||
        "Custom role configured with customized module access and operation rights",
    };

    setRoles((prev) => [...prev, newRole]);
    setRoleSettings((prev) => ({
      ...prev,
      [nextId]: {
        pageAccess: { ...defaultPageAccess },
        permissions: { ...defaultPermissions },
        status: true,
      },
    }));

    setSelectedRoleId(nextId);
    setActiveTab("Pages");
    setShowNewRoleModal(false);
    showToast(`Role "${name}" created successfully`);
  };

  // Edit Role handlers
  const openEditModal = () => {
    if (!selectedRole) return;
    setEditRoleName(selectedRole.name);
    setEditRoleDescription(selectedRole.description);
    setEditRoleColor(selectedRole.color || PRESET_COLORS[0]);
    setShowEditModal(true);
  };

  const handleUpdateRole = (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    const name = editRoleName.trim();
    if (!name) return;

    const shortName = name
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setRoles((prev) =>
      prev.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              name,
              shortName,
              description: editRoleDescription.trim() || role.description,
              color: editRoleColor,
            }
          : role
      )
    );

    setShowEditModal(false);
    showToast(`Role "${name}" updated successfully`);
  };

  // Delete Role handlers
  const openDeleteModal = () => {
    if (!selectedRole || selectedRole.type === "System") return;
    setShowDeleteModal(true);
  };

  const handleDeleteRole = () => {
    if (!selectedRole || selectedRole.type === "System") return;
    const deletedName = selectedRole.name;
    const remaining = roles.filter((r) => r.id !== selectedRole.id);
    setRoles(remaining);
    setShowDeleteModal(false);
    if (remaining.length > 0) {
      setSelectedRoleId(remaining[0].id);
    } else {
      setSelectedRoleId(null);
    }
    showToast(`Role "${deletedName}" deleted successfully`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5] text-[#0f172a]">
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

      {/* MAIN VIEWPORT */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* NAVBAR */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e2edf2] shadow-xs">
          <Navbar setMobileOpen={setMobileOpen} activeMenu={activeMenu} />
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 scrollbar-thin">
          <div className="mx-auto max-w-[1600px] space-y-5">
            {/* TOP HEADER & BREADCRUMBS */}
            <div className="rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/90 backdrop-blur-md p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-all">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  {/* Breadcrumb */}
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#64748b]">
                    <span>LMS</span>
                    <span className="text-[#cbd5e1]">/</span>
                    <span>Access Management</span>
                    <span className="text-[#cbd5e1]">/</span>
                    <span className="text-[#0d9488]">Roles & Permissions</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] sm:text-2xl">
                      Roles & Access Control
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#0d9488]/25 bg-[#e6f7f5] px-2.5 py-0.5 text-[11px] font-semibold text-[#0d9488]">
                      <ShieldCheck size={13} className="text-[#0d9488]" />
                      RBAC Security
                    </span>
                  </div>

                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#64748b] leading-relaxed">
                    Configure organizational role hierarchies, fine-grained module access rights, and action privileges across the platform.
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={openNewRoleModal}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-4 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition-all duration-200 hover:from-[#0f766e] hover:to-[#0d9488] hover:shadow-md hover:shadow-[#0d9488]/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Create New Role</span>
                  </button>
                </div>
              </div>

              {/* KPI QUICK STATS STRIP */}
              <div className="mt-5 grid grid-cols-2 gap-3 pt-5 border-t border-[#f1f5f9] sm:grid-cols-2 lg:grid-cols-4">
                {/* Stat 1 */}
                <div className="group rounded-xl border border-[#e2edf2] bg-[#f8fafc]/80 p-3.5 transition-all duration-200 hover:border-[#0d9488]/30 hover:bg-white hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#64748b]">Total Roles</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f7f5] text-[#0d9488]">
                      <ShieldCheck size={15} />
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#0f172a]">{metrics.totalRoles}</span>
                    <span className="text-[11px] text-[#64748b]">defined profiles</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="group rounded-xl border border-[#e2edf2] bg-[#f8fafc]/80 p-3.5 transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#64748b]">Assigned Users</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Users size={15} />
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#0f172a]">{metrics.totalUsers}</span>
                    <span className="text-[11px] text-[#64748b]">active personnel</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="group rounded-xl border border-[#e2edf2] bg-[#f8fafc]/80 p-3.5 transition-all duration-200 hover:border-amber-300 hover:bg-white hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#64748b]">Role Composition</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Lock size={15} />
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#0f172a]">{metrics.systemRoles} System</span>
                    <span className="text-[11px] text-[#64748b]">/ {metrics.customRoles} Custom</span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="group rounded-xl border border-[#e2edf2] bg-[#f8fafc]/80 p-3.5 transition-all duration-200 hover:border-purple-300 hover:bg-white hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#64748b]">System Modules</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <LayoutDashboard size={15} />
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#0f172a]">{metrics.totalModulesCount}</span>
                    <span className="text-[11px] text-[#64748b]">securable resources</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN WORKSPACE */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
              {/* ========================================================= */}
              {/* LEFT COLUMN: ROLES DIRECTORY PANEL */}
              {/* ========================================================= */}
              <div className="flex flex-col rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
                {/* Panel Header */}
                <div className="border-b border-[#f1f5f9] p-4 sm:p-5 bg-gradient-to-b from-[#f8fafc] to-white">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f7f5] text-[#0d9488]">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0f172a]">Role Profiles</h2>
                        <p className="text-[11px] text-[#64748b]">Select a role to inspect</p>
                      </div>
                    </div>

                    <button
                      onClick={openNewRoleModal}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#e2edf2] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0d9488] shadow-xs transition hover:border-[#0d9488]/40 hover:bg-[#e6f7f5]/40"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>New</span>
                    </button>
                  </div>

                  {/* Search Roles Input */}
                  <div className="relative mb-3">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />
                    <input
                      type="text"
                      value={searchRole}
                      onChange={(e) => setSearchRole(e.target.value)}
                      placeholder="Search roles by title..."
                      className="h-9 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] pl-9 pr-8 text-xs text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                    />
                    {searchRole && (
                      <button
                        onClick={() => setSearchRole("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Role Type Filter Tabs */}
                  <div className="flex items-center gap-1 rounded-xl bg-[#f1f5f9] p-1 text-[11px] font-semibold text-[#64748b]">
                    {["All", "System", "Custom"].map((type) => {
                      const isActive = roleTypeFilter === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setRoleTypeFilter(type)}
                          className={`flex-1 rounded-lg py-1 transition-all ${
                            isActive
                              ? "bg-white text-[#0f172a] font-bold shadow-xs"
                              : "hover:text-[#0f172a]"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role Cards List */}
                <div className="flex-1 space-y-2 overflow-y-auto p-3 max-h-[560px] lg:max-h-none scrollbar-thin">
                  {filteredRoles.map((role) => {
                    const isSelected = role.id === selectedRoleId;
                    const RoleIcon = role.icon || ShieldCheck;
                    const rSetting = roleSettings[role.id] || { status: true };
                    const isRoleActive = rSetting.status !== false;

                    return (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                          isSelected
                            ? "border-[#0d9488]/50 bg-gradient-to-r from-[#e6f7f5]/70 to-white shadow-sm ring-1 ring-[#0d9488]/20"
                            : "border-[#e2edf2] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]/70 hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Active Accent Bar */}
                        {isSelected && (
                          <div
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                            style={{ backgroundColor: role.color || "#0d9488" }}
                          />
                        )}

                        {/* Role Icon Avatar */}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-xs"
                          style={{
                            backgroundColor: `${role.color || "#0d9488"}1a`,
                            color: role.color || "#0d9488",
                            border: `1px solid ${role.color || "#0d9488"}33`,
                          }}
                        >
                          <RoleIcon size={19} strokeWidth={2.3} />
                        </div>

                        {/* Role Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-bold text-[#0f172a]">
                              {role.name}
                            </span>

                            {role.type === "System" ? (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-700 border border-amber-200/60">
                                <Lock size={9} />
                                System
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 border border-blue-200/60">
                                Custom
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-[11px] text-[#64748b]">
                            <span className="inline-flex items-center gap-1">
                              <Users size={11} className="text-[#94a3b8]" />
                              <span>{role.users || 0} users</span>
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isRoleActive ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              />
                              <span>{isRoleActive ? "Active" : "Inactive"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Chevron Indicator */}
                        <ChevronRight
                          size={15}
                          className={`transition-transform duration-200 ${
                            isSelected
                              ? "text-[#0d9488] translate-x-0.5"
                              : "text-[#cbd5e1] group-hover:text-[#64748b]"
                          }`}
                        />
                      </div>
                    );
                  })}

                  {filteredRoles.length === 0 && (
                    <div className="py-12 px-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#94a3b8]">
                        <Search size={18} />
                      </div>
                      <p className="text-xs font-bold text-[#0f172a]">No matching roles</p>
                      <p className="mt-0.5 text-[11px] text-[#64748b]">
                        Try searching with a different term
                      </p>
                    </div>
                  )}
                </div>

                {/* Panel Footer */}
                <div className="border-t border-[#f1f5f9] bg-[#f8fafc]/80 px-4 py-2.5 text-center sm:text-left">
                  <p className="text-[11px] text-[#64748b]">
                    Showing <span className="font-bold text-[#0f172a]">{filteredRoles.length}</span> of{" "}
                    <span className="font-bold text-[#0f172a]">{roles.length}</span> roles
                  </p>
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT COLUMN: ROLE PRIVILEGE CONFIGURATION WORKSPACE */}
              {/* ========================================================= */}
              <div className="flex flex-col rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
                {!selectedRole ? (
                  // EMPTY STATE (when no role is chosen)
                  <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e2edf2] bg-[#f8fafc] text-[#94a3b8] shadow-xs">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Select a role to configure
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-[#64748b] leading-relaxed">
                      Choose any role profile from the left directory to inspect its module access permissions, functional authorizations, and assigned users.
                    </p>
                    {roles.length > 0 && (
                      <button
                        onClick={() => setSelectedRoleId(roles[0].id)}
                        className="mt-4 rounded-xl bg-[#e6f7f5] px-4 py-2 text-xs font-semibold text-[#0d9488] hover:bg-[#0d9488] hover:text-white transition"
                      >
                        Select {roles[0].name}
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* ROLE HERO HEADER */}
                    <div className="border-b border-[#f1f5f9] p-5 lg:p-6 bg-gradient-to-b from-[#f8fafc]/90 via-white to-white">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        {/* Role Identity */}
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform"
                            style={{
                              background: `linear-gradient(135deg, ${selectedRole.color || "#0d9488"}, ${selectedRole.color || "#0d9488"}dd)`,
                              boxShadow: `0 8px 20px -4px ${selectedRole.color || "#0d9488"}40`,
                            }}
                          >
                            {(() => {
                              const HeaderIcon = selectedRole.icon || ShieldCheck;
                              return <HeaderIcon size={26} strokeWidth={2.4} />;
                            })()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-lg sm:text-xl font-extrabold text-[#0f172a]">
                                {selectedRole.name}
                              </h2>

                              {selectedRole.type === "System" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 shadow-xs">
                                  <Lock size={10} />
                                  System Protected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 shadow-xs">
                                  <SlidersHorizontal size={10} />
                                  Custom Configurable
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                  roleStatus
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    roleStatus ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                                />
                                {roleStatus ? "Active Status" : "Inactive"}
                              </span>
                            </div>

                            <p className="mt-1 text-xs sm:text-[13px] text-[#64748b] leading-relaxed">
                              {selectedRole.description}
                            </p>
                          </div>
                        </div>

                        {/* Role Header Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 self-start">
                          <button
                            onClick={openEditModal}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 text-xs font-semibold text-[#0f172a] shadow-xs transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                          >
                            <Edit3 size={13} className="text-[#64748b]" />
                            <span>Edit Role</span>
                          </button>

                          {selectedRole.type !== "System" && (
                            <button
                              onClick={openDeleteModal}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 hover:border-rose-300"
                              title="Delete this custom role"
                            >
                              <Trash2 size={13} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ROLE STATS TILES */}
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-[#e2edf2] bg-white p-3 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                            Role Class
                          </span>
                          <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#0f172a]">
                            {selectedRole.type} Entity
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#e2edf2] bg-white p-3 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                            Assigned Staff
                          </span>
                          <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#0f172a]">
                            {selectedRole.users} Active Users
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#e2edf2] bg-white p-3 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                            Modules Granted
                          </span>
                          <div className="mt-0.5 flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-bold text-[#0d9488]">
                              {metrics.enabledModulesCount} / {metrics.totalModulesCount}
                            </p>
                            <span className="text-[10px] text-[#64748b]">
                              {Math.round((metrics.enabledModulesCount / metrics.totalModulesCount) * 100)}%
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#e2edf2] bg-white p-3 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                            Operational Rights
                          </span>
                          <div className="mt-0.5 flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-bold text-blue-600">
                              {metrics.enabledActionsCount} / {metrics.totalActionsCount}
                            </p>
                            <span className="text-[10px] text-[#64748b]">
                              {metrics.enabledActionsCount === metrics.totalActionsCount
                                ? "Full Control"
                                : "Restricted"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEGMENTED TAB NAVIGATION */}
                    <div className="border-b border-[#f1f5f9] px-5 bg-white">
                      <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-thin">
                        <button
                          onClick={() => setActiveTab("Pages")}
                          className={`relative flex items-center gap-2 py-3.5 text-xs font-bold transition ${
                            activeTab === "Pages"
                              ? "text-[#0d9488]"
                              : "text-[#64748b] hover:text-[#0f172a]"
                          }`}
                        >
                          <LayoutDashboard size={15} />
                          <span>Module & Page Access</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              activeTab === "Pages"
                                ? "bg-[#e6f7f5] text-[#0d9488]"
                                : "bg-slate-100 text-[#64748b]"
                            }`}
                          >
                            {metrics.enabledModulesCount} Active
                          </span>
                          {activeTab === "Pages" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#0d9488]" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveTab("Permissions")}
                          className={`relative flex items-center gap-2 py-3.5 text-xs font-bold transition ${
                            activeTab === "Permissions"
                              ? "text-[#0d9488]"
                              : "text-[#64748b] hover:text-[#0f172a]"
                          }`}
                        >
                          <ShieldCheck size={15} />
                          <span>Action Privileges</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              activeTab === "Permissions"
                                ? "bg-[#e6f7f5] text-[#0d9488]"
                                : "bg-slate-100 text-[#64748b]"
                            }`}
                          >
                            {metrics.enabledActionsCount} Allowed
                          </span>
                          {activeTab === "Permissions" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#0d9488]" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveTab("Matrix")}
                          className={`relative flex items-center gap-2 py-3.5 text-xs font-bold transition ${
                            activeTab === "Matrix"
                              ? "text-[#0d9488]"
                              : "text-[#64748b] hover:text-[#0f172a]"
                          }`}
                        >
                          <CheckSquare size={15} />
                          <span>Security Matrix</span>
                          {activeTab === "Matrix" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#0d9488]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* =================================================== */}
                    {/* TAB CONTENT: MODULE & PAGE ACCESS */}
                    {/* =================================================== */}
                    {activeTab === "Pages" && (
                      <div className="p-5 lg:p-6 space-y-6">
                        {/* Control Toolbar */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          {/* Search & Category Filter */}
                          <div className="flex flex-1 flex-wrap items-center gap-2 md:max-w-xl">
                            <div className="relative min-w-[220px] flex-1">
                              <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                              />
                              <input
                                type="text"
                                value={searchPermission}
                                onChange={(e) => setSearchPermission(e.target.value)}
                                placeholder="Search modules..."
                                className="h-9 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] pl-9 pr-8 text-xs text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                              />
                              {searchPermission && (
                                <button
                                  onClick={() => setSearchPermission("")}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1 overflow-x-auto">
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                    selectedCategory === cat
                                      ? "bg-[#0d9488] text-white shadow-xs"
                                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2edf2] hover:text-[#0f172a]"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick Batch Actions */}
                          <div className="flex items-center gap-2 self-start md:self-auto">
                            <button
                              onClick={() => setAllPages(true)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0d9488] shadow-xs transition hover:border-[#0d9488]/40 hover:bg-[#e6f7f5]/40"
                            >
                              <Check size={13} strokeWidth={2.5} />
                              <span>Enable All</span>
                            </button>

                            <button
                              onClick={() => setAllPages(false)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-xs transition hover:border-rose-300 hover:bg-rose-50"
                            >
                              <X size={13} strokeWidth={2.5} />
                              <span>Disable All</span>
                            </button>
                          </div>
                        </div>

                        {/* Modules Grouped Display */}
                        {Object.entries(groupedModules).map(([category, modules]) => (
                          <div key={category} className="space-y-3">
                            {/* Category Banner */}
                            <div className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] pb-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-[#e6f7f5] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0d9488] border border-[#0d9488]/20">
                                  {category}
                                </span>
                                <span className="text-xs font-semibold text-[#64748b]">
                                  ({modules.length} {modules.length === 1 ? "module" : "modules"})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleCategoryPages(category, true)}
                                  className="text-[11px] font-semibold text-[#0d9488] hover:underline"
                                >
                                  Enable Group
                                </button>
                                <span className="text-[#cbd5e1]">•</span>
                                <button
                                  onClick={() => toggleCategoryPages(category, false)}
                                  className="text-[11px] font-semibold text-[#64748b] hover:text-rose-600 hover:underline"
                                >
                                  Disable Group
                                </button>
                              </div>
                            </div>

                            {/* Module Cards Grid */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {modules.map((module) => {
                                const ModuleIcon = module.icon || LayoutDashboard;
                                const isEnabled = !!pageAccess[module.id];

                                return (
                                  <div
                                    key={module.id}
                                    className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${
                                      isEnabled
                                        ? "border-[#e2edf2] bg-white hover:border-[#0d9488]/40"
                                        : "border-[#e2edf2] bg-[#f8fafc]/70 opacity-75 hover:opacity-100"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3 min-w-0">
                                        <div
                                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-xs"
                                          style={{
                                            backgroundColor: `${module.color || "#0d9488"}1a`,
                                            color: module.color || "#0d9488",
                                            border: `1px solid ${module.color || "#0d9488"}33`,
                                          }}
                                        >
                                          <ModuleIcon size={18} strokeWidth={2.2} />
                                        </div>

                                        <div className="min-w-0">
                                          <h4 className="truncate text-xs sm:text-[13px] font-bold text-[#0f172a]">
                                            {module.title}
                                          </h4>
                                          <p className="mt-0.5 text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">
                                            {module.description}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Custom Toggle Switch */}
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isEnabled}
                                        onClick={() => togglePage(module.id)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 ${
                                          isEnabled ? "bg-[#0d9488]" : "bg-slate-300"
                                        }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                            isEnabled ? "translate-x-5" : "translate-x-0"
                                          }`}
                                        />
                                      </button>
                                    </div>

                                    {/* Bottom Status Pill */}
                                    <div className="mt-3 flex items-center justify-between border-t border-[#f1f5f9] pt-2.5">
                                      <span className="text-[10px] font-medium text-[#94a3b8]">
                                        Route: /{module.id}
                                      </span>

                                      <span
                                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                          isEnabled
                                            ? "bg-[#e6f7f5] text-[#0d9488]"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        {isEnabled ? (
                                          <>
                                            <Check size={10} strokeWidth={2.5} />
                                            <span>Access Granted</span>
                                          </>
                                        ) : (
                                          <span>Restricted</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {filteredModules.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center">
                            <Search size={30} className="mx-auto mb-2 text-[#94a3b8]" />
                            <h4 className="text-sm font-bold text-[#0f172a]">No modules found</h4>
                            <p className="mt-1 text-xs text-[#64748b]">
                              No modules matched your search criteria. Try a different query.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* =================================================== */}
                    {/* TAB CONTENT: ACTION PRIVILEGES */}
                    {/* =================================================== */}
                    {activeTab === "Permissions" && (
                      <div className="p-5 lg:p-6 space-y-6">
                        {/* Control Toolbar */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-[#0f172a]">
                              Functional Authorizations
                            </h3>
                            <p className="text-xs text-[#64748b]">
                              Define operational permissions for data manipulation, file imports, and deletion.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAllPermissions(true)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0d9488] shadow-xs transition hover:border-[#0d9488]/40 hover:bg-[#e6f7f5]/40"
                            >
                              <Check size={13} strokeWidth={2.5} />
                              <span>Grant All</span>
                            </button>

                            <button
                              onClick={() => setAllPermissions(false)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-xs transition hover:border-rose-300 hover:bg-rose-50"
                            >
                              <X size={13} strokeWidth={2.5} />
                              <span>Revoke All</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Privileges Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {filteredActions.map((action) => {
                            const meta = actionMeta[action] || {};
                            const ActionIcon = meta.icon || ShieldCheck;
                            const isAllowed = !!permissions[action];

                            return (
                              <div
                                key={action}
                                className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${
                                  isAllowed
                                    ? "border-[#e2edf2] bg-white hover:border-[#0d9488]/40"
                                    : "border-dashed border-[#cbd5e1] bg-[#f8fafc]/80 opacity-80 hover:opacity-100"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105"
                                        style={{
                                          backgroundColor: `${meta.color || "#0d9488"}1a`,
                                          color: meta.color || "#0d9488",
                                          border: `1px solid ${meta.color || "#0d9488"}33`,
                                        }}
                                      >
                                        <ActionIcon size={20} strokeWidth={2.4} />
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-sm font-bold text-[#0f172a]">
                                            {action}
                                          </h4>
                                          <span
                                            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${meta.badgeBg}`}
                                          >
                                            {meta.badge}
                                          </span>
                                        </div>

                                        <span
                                          className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${meta.riskColor}`}
                                        >
                                          {meta.risk}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Toggle Switch */}
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={isAllowed}
                                      onClick={() => togglePermission(action)}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 ${
                                        isAllowed ? "bg-[#0d9488]" : "bg-slate-300"
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                          isAllowed ? "translate-x-5" : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                  </div>

                                  <p className="mt-3 text-xs text-[#64748b] leading-relaxed">
                                    {meta.description}
                                  </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-2.5">
                                  <span className="text-[11px] font-medium text-[#94a3b8]">
                                    Privilege status:
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                      isAllowed
                                        ? "bg-[#e6f7f5] text-[#0d9488]"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {isAllowed ? "Authorized" : "Denied"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* =================================================== */}
                    {/* TAB CONTENT: SECURITY MATRIX (AUDIT OVERVIEW) */}
                    {/* =================================================== */}
                    {activeTab === "Matrix" && (
                      <div className="p-5 lg:p-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#0f172a]">
                            Permission Audit Matrix
                          </h3>
                          <p className="text-xs text-[#64748b]">
                            Complete overview of functional privileges across every system module for role:{" "}
                            <span className="font-bold text-[#0f172a]">{selectedRole.name}</span>
                          </p>
                        </div>

                        {/* Matrix Table */}
                        <div className="overflow-x-auto rounded-xl border border-[#e2edf2] bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-[#e2edf2] bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Module Resource</th>
                                <th className="px-3 py-3">Category</th>
                                <th className="px-3 py-3 text-center">Module Access</th>
                                {permissionActions.map((action) => (
                                  <th key={action} className="px-3 py-3 text-center">
                                    {action}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                              {moduleData.map((module) => {
                                const isPageOn = !!pageAccess[module.id];
                                return (
                                  <tr key={module.id} className="hover:bg-[#f8fafc]/80 transition">
                                    <td className="px-4 py-3 font-semibold text-[#0f172a]">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: module.color }}
                                        />
                                        <span>{module.title}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-3 text-[#64748b]">
                                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                                        {module.category}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                      {isPageOn ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f7f5] px-2 py-0.5 text-[10px] font-bold text-[#0d9488]">
                                          <Check size={11} strokeWidth={2.5} />
                                          Granted
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                          Restricted
                                        </span>
                                      )}
                                    </td>

                                    {permissionActions.map((act) => {
                                      const isActOn = isPageOn && !!permissions[act];
                                      return (
                                        <td key={act} className="px-3 py-3 text-center">
                                          {isActOn ? (
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                                              <Check size={11} strokeWidth={2.5} />
                                            </span>
                                          ) : (
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
                                              <X size={11} strokeWidth={2.5} />
                                            </span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ROLE CONFIGURATION FOOTER */}
                    <div className="flex flex-col gap-3 border-t border-[#f1f5f9] bg-[#f8fafc]/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f7f5] text-[#0d9488]">
                          <Info size={14} />
                        </div>
                        <p className="text-xs text-[#64748b]">
                          Modifications apply to{" "}
                          <span className="font-semibold text-[#0f172a]">
                            {selectedRole.users} users
                          </span>{" "}
                          currently assigned to this role profile.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetDefaults}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3.5 py-2 text-xs font-semibold text-[#64748b] shadow-xs transition hover:border-[#cbd5e1] hover:bg-slate-50 hover:text-[#0f172a]"
                        >
                          <RotateCcw size={13} />
                          <span>Reset Defaults</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488] hover:shadow-md hover:shadow-[#0d9488]/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>Save & Apply Changes</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW ROLE */}
      {/* ========================================================= */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-[#f8fafc] to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7f5] text-[#0d9488] border border-[#0d9488]/20 shadow-xs">
                  <Plus size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Create New Role Profile
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Define a role with customized access privileges
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNewRoleModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={createRole} className="p-5 space-y-4">
              {/* Role Title */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Quality Assurance Manager"
                  autoFocus
                  required
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              {/* Role Classification & Color Picker */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                    Role Type
                  </label>
                  <select
                    value={newRoleType}
                    onChange={(e) => setNewRoleType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                  >
                    <option value="Custom">Custom Role</option>
                    <option value="System">System Role</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                    Accent Theme Color
                  </label>
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewRoleColor(color)}
                        className={`h-5 w-5 rounded-full transition-transform ${
                          newRoleColor === color
                            ? "scale-125 ring-2 ring-[#0f172a] shadow-xs"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Role Description */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Description
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Outline responsibilities and operational scope for this role..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewRoleModal(false)}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488]"
                >
                  Create Role Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT ROLE */}
      {/* ========================================================= */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-[#f8fafc] to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Edit Role Profile
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Update details for {selectedRole.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Accent Color
                </label>
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditRoleColor(color)}
                      className={`h-5 w-5 rounded-full transition-transform ${
                        editRoleColor === color
                          ? "scale-125 ring-2 ring-[#0f172a] shadow-xs"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Description
                </label>
                <textarea
                  value={editRoleDescription}
                  onChange={(e) => setEditRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE ROLE CONFIRMATION */}
      {/* ========================================================= */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl md:rounded-3xl border border-rose-200 bg-white shadow-2xl overflow-hidden p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertCircle size={28} />
            </div>

            <h3 className="text-base font-bold text-[#0f172a]">
              Delete "{selectedRole.name}"?
            </h3>

            <p className="mt-2 text-xs text-[#64748b] leading-relaxed">
              Are you sure you want to permanently delete this custom role? Any users currently assigned to this role will need to be reallocated.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/30 transition hover:bg-rose-700"
              >
                Yes, Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
      {/* ========================================================= */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[1000] flex max-w-md items-center gap-3 rounded-2xl border border-[#0d9488]/30 bg-[#0f172a] px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0d9488] text-white">
            <CheckCircle2 size={15} />
          </div>
          <span className="flex-1">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default Roles;
