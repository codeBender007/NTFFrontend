import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { lmsMenus } from "../data/LMSMenu";
import RolesApi from "../services/RolesApi";
import PagesApi from "../services/PagesApi";
import UserApi from "../services/UserApi";
import { isAuthenticated, getToken, clearSession, getUser } from "../../auth/utils/authStorage";

import {
  ShieldCheck,
  Users,
  UserCog,
  BookOpen,
  Building2,
  LayoutDashboard,
  FileText,
  Edit3,
  Pencil,
  Eye,
  Trash2,
  Upload,
  Plus,
  Search,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  Lock,
  SlidersHorizontal,
  Filter,
} from "lucide-react";

const permissionActions = ["View", "Upload Excel", "Create", "Edit", "Delete"];

const normalizeCategory = (category) => {
  if (!category) return "Dashboard";
  const upper = String(category).toUpperCase();
  if (upper === "LEARNING MANAGEMENT SYSTEM" || upper === "LMS") {
    return "LMS";
  }
  if (upper === "DASHBOARD") {
    return "Dashboard";
  }
  if (upper === "CMS" || upper === "CONTENT MANAGEMENT SYSTEM") {
    return "CMS";
  }
  return category;
};

const actionMeta = {
  View: {
    icon: Eye,
    color: "#3b82f6",
    description: "Can view and inspect dashboards, operational tables, metrics and reports",
  },
  "Upload Excel": {
    icon: Upload,
    color: "#06b6d4",
    description: "Can upload spreadsheet templates and batch import operational datasets",
  },
  Create: {
    icon: Plus,
    color: "#10b981",
    description: "Can create new records, modules, department units and test configurations",
  },
  Edit: {
    icon: Edit3,
    color: "#f59e0b",
    description: "Can modify existing entries, update settings and change operational statuses",
  },
  Delete: {
    icon: Trash2,
    color: "#ef4444",
    description: "Can permanently remove records, user accounts, and structural hierarchy items",
  },
};

const defaultPermissions = {
  View: false,
  "Upload Excel": false,
  Create: false,
  Edit: false,
  Delete: false,
};

// Dynamic helper functions for page permissions & access
const createInitialPagePermissions = (pages = []) => {
  const perms = {};
  pages.forEach((m) => {
    perms[m.id] = {
      View: false,
      "Upload Excel": false,
      Create: false,
      Edit: false,
      Delete: false,
    };
  });
  return perms;
};

const createDefaultPageAccess = (pages = []) => {
  const access = {};
  pages.forEach((m) => {
    access[m.id] = false;
  });
  return access;
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

// Helper to map backend page object to UI model dynamically
const mapBackendPageToUI = (p, index = 0) => {
  const pageKey =
    p.pageKey ||
    (p.name
      ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : `page-${p.id}`);

  const category = normalizeCategory(p.module || "LMS");
  const defaultPrefix =
    category === "Dashboard"
      ? "/dashboard"
      : category === "CMS"
        ? "/cms"
        : "/lms";

  return {
    id: p.pageKey || String(p.id),
    backendId: p.id,
    title: p.name || "Untitled Page",
    description: `${p.name || "Page"} operational records, configuration and access control`,
    category,
    module: p.module || category.toUpperCase(),
    route: `${defaultPrefix}/${pageKey}`,
    pageKey,
    icon: LayoutDashboard,
    color: PRESET_COLORS[index % PRESET_COLORS.length],
    isActive: p.isActive !== false,
    permissions: ["Access"],
  };
};

const Roles = () => {
  const navigate = useNavigate();

  // Navigation & layout state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Roles & Permissions");

  // Core Role state (dynamically populated from API)
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [searchRole, setSearchRole] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Authentication & unauthorized state
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Dynamic Page Modules state (Strictly populated via GET /api/v1/lms/pages)
  const [moduleData, setModuleData] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [pagesError, setPagesError] = useState("");

  // Create Page Modal state (POST /api/v1/lms/pages)
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [createPageCategory, setCreatePageCategory] = useState("Dashboard");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageKey, setNewPageKey] = useState("");
  const [newPageStatus, setNewPageStatus] = useState(true);
  const [isSubmittingPage, setIsSubmittingPage] = useState(false);

  // Edit Page Modal state (PUT /api/v1/lms/pages/{page_id})
  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageCategory, setEditPageCategory] = useState("LMS");
  const [editPageKey, setEditPageKey] = useState("");
  const [editPageStatus, setEditPageStatus] = useState(true);

  // Delete Page Modal state (DELETE /api/v1/lms/pages/{page_id})
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [deleteTargetPage, setDeleteTargetPage] = useState(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);

  // Role permissions mapping (roleId -> { pageAccess, permissions, pagePermissions, status })
  const [roleSettings, setRoleSettings] = useState({});

  // Search & category filters
  const [searchPermission, setSearchPermission] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Dashboard");

  // Selected page for inline granular action privileges
  const [selectedPageId, setSelectedPageId] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState("");
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  };

  // API loading & error state
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [loadingRoleDetails, setLoadingRoleDetails] = useState(false);
  const [roleDetailsError, setRoleDetailsError] = useState("");
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [savingPageId, setSavingPageId] = useState(null);
  const [revokingPageId, setRevokingPageId] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [pageToRevoke, setPageToRevoke] = useState(null);
  const [isSectionUpdating, setIsSectionUpdating] = useState(false);

  // Role Modals state
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleStatus, setNewRoleStatus] = useState(true);

  // Delete Role Confirmation Modal state
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Workspace sub-navigation: "privileges" (Role & Page Privileges) vs "users" (User Role Assignments)
  const [workspaceTab, setWorkspaceTab] = useState("privileges");

  // User Management & Role Assignment state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userDeptFilter, setUserDeptFilter] = useState("all");
  const [userRoleAssignments, setUserRoleAssignments] = useState({});
  const [assigningUserId, setAssigningUserId] = useState(null);

  // User Permissions Inspection Modal state (GET /api/v1/lms/users/{user_id}/permissions)
  const [showUserPermsModal, setShowUserPermsModal] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState(null);
  const [loadingUserPerms, setLoadingUserPerms] = useState(false);
  const [userPermsError, setUserPermsError] = useState("");
  const [userPermsData, setUserPermsData] = useState(null);

  // Current User Access Control state (GET /api/v1/lms/me/permissions)
  const [myPermissions, setMyPermissions] = useState(null);
  const [loadingMyPerms, setLoadingMyPerms] = useState(true);
  const [myPermsError, setMyPermsError] = useState("");

  // Derived active privileges for currently logged-in user
  const currentUserAccess = useMemo(() => {
    const loggedUser = getUser();
    const userRoleStr = String(loggedUser?.role || "").toUpperCase();
    const isLoggedAdmin =
      userRoleStr === "SUPER_ADMIN" ||
      userRoleStr === "SUPERADMIN" ||
      userRoleStr === "SUPER ADMIN" ||
      userRoleStr === "ADMIN" ||
      userRoleStr.includes("ADMIN");

    if (!myPermissions) {
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssignRole: true,
        roleTitle: loggedUser?.role || "Administrator",
        isSuperAdmin: isLoggedAdmin || true,
      };
    }

    if (typeof myPermissions === "object") {
      const permRoleName =
        typeof myPermissions.role === "object"
          ? myPermissions.role?.name || ""
          : myPermissions.role || myPermissions.roleName || "";
      const permRoleUpper = String(permRoleName).toUpperCase();

      const isAdmin =
        isLoggedAdmin ||
        myPermissions.isAdmin === true ||
        myPermissions.isSuperuser === true ||
        myPermissions.is_superuser === true ||
        permRoleUpper === "ADMIN" ||
        permRoleUpper === "SUPER_ADMIN" ||
        permRoleUpper === "SUPERADMIN" ||
        permRoleUpper === "SUPER ADMIN" ||
        permRoleUpper.includes("ADMIN");

      if (isAdmin) {
        return {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canAssignRole: true,
          roleTitle: permRoleName || loggedUser?.role || "Administrator",
          isSuperAdmin: true,
        };
      }

      const actions = new Set();
      const addAction = (val) => {
        if (!val) return;
        if (typeof val === "string") actions.add(val.toLowerCase());
        else if (typeof val === "object") {
          if (val.action) actions.add(String(val.action).toLowerCase());
          if (val.name) actions.add(String(val.name).toLowerCase());
          if (val.canEdit) actions.add("edit");
          if (val.canCreate) actions.add("create");
          if (val.canDelete) actions.add("delete");
          if (val.canView) actions.add("view");
          if (Array.isArray(val.actions)) {
            val.actions.forEach((a) => actions.add(String(a).toLowerCase()));
          }
        }
      };

      if (Array.isArray(myPermissions.permissions)) {
        myPermissions.permissions.forEach(addAction);
      } else if (Array.isArray(myPermissions)) {
        myPermissions.forEach(addAction);
      } else if (myPermissions.permissions && typeof myPermissions.permissions === "object") {
        Object.values(myPermissions.permissions).forEach((val) => {
          if (Array.isArray(val)) val.forEach(addAction);
          else if (typeof val === "object") {
            Object.entries(val).forEach(([k, v]) => {
              if (v) actions.add(k.toLowerCase());
            });
          }
        });
      }

      const hasCreate =
        actions.has("create") ||
        myPermissions.canCreate === true ||
        actions.has("*") ||
        actions.has("all");
      const hasEdit =
        actions.has("edit") ||
        myPermissions.canEdit === true ||
        actions.has("*") ||
        actions.has("all");
      const hasDelete =
        actions.has("delete") ||
        myPermissions.canDelete === true ||
        actions.has("*") ||
        actions.has("all");
      const hasView = actions.has("view") || myPermissions.canView !== false;

      return {
        canView: hasView,
        canCreate: hasCreate,
        canEdit: hasEdit,
        canDelete: hasDelete,
        canAssignRole: true,
        roleTitle: permRoleName || loggedUser?.role || "User",
        isSuperAdmin: false,
      };
    }

    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canAssignRole: true,
      roleTitle: loggedUser?.role || "Administrator",
      isSuperAdmin: isLoggedAdmin,
    };
  }, [myPermissions]);

  // Active selected role object
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;

  // Active role permissions settings helper
  const currentRoleSetting = useMemo(() => {
    if (!selectedRoleId || !roleSettings[selectedRoleId]) {
      return {
        pageAccess: createDefaultPageAccess(moduleData),
        permissions: { ...defaultPermissions },
        pagePermissions: createInitialPagePermissions(moduleData),
        status: true,
      };
    }
    const setting = roleSettings[selectedRoleId];
    if (!setting.pagePermissions) {
      const pPerms = {};
      moduleData.forEach((m) => {
        pPerms[m.id] = { ...(setting.permissions || defaultPermissions) };
      });
      return { ...setting, pagePermissions: pPerms };
    }
    return setting;
  }, [selectedRoleId, roleSettings, moduleData]);

  const pageAccess = currentRoleSetting.pageAccess || {};
  const pagePermissions = currentRoleSetting.pagePermissions || {};
  const roleStatus = currentRoleSetting.status;

  // Active selected page object for inline granular action privileges
  const selectedPageObj = useMemo(() => {
    if (!selectedPageId) return null;
    return moduleData.find((m) => m.id === selectedPageId) || null;
  }, [selectedPageId, moduleData]);

  // Filtered Roles on the Left Panel
  const filteredRoles = useMemo(() => {
    const q = searchRole.toLowerCase().trim();
    return roles.filter((role) => {
      return (
        !q ||
        role.name.toLowerCase().includes(q) ||
        (role.description && role.description.toLowerCase().includes(q))
      );
    });
  }, [roles, searchRole]);

  // Filtered Modules for the Cards view (strictly matches selectedCategory and search filter)
  const filteredModules = useMemo(() => {
    const value = searchPermission.toLowerCase().trim();
    return moduleData.filter((module) => {
      const moduleCat = normalizeCategory(module.category);
      const matchesSearch =
        !value ||
        module.title.toLowerCase().includes(value) ||
        (module.description && module.description.toLowerCase().includes(value)) ||
        moduleCat.toLowerCase().includes(value) ||
        (module.route && module.route.toLowerCase().includes(value)) ||
        (module.pageKey && module.pageKey.toLowerCase().includes(value));

      const matchesCat =
        selectedCategory === "All" || moduleCat === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [moduleData, searchPermission, selectedCategory]);

  // All distinct categories derived dynamically from live moduleData
  const categories = useMemo(() => {
    const list = ["Dashboard", "LMS", "CMS"];
    moduleData.forEach((m) => {
      const cat = normalizeCategory(m.category);
      if (cat && !list.includes(cat)) {
        list.push(cat);
      }
    });
    return list;
  }, [moduleData]);

  // =========================================================================
  // API INTEGRATION 1: GET ALL PAGES (GET /api/v1/lms/pages)
  // Strictly fetches dynamic pages from the backend database
  // =========================================================================
  const loadAllPages = async () => {
    setLoadingPages(true);
    setPagesError("");

    try {
      const res = await PagesApi.getPages();
      const rawPages = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.items || [];

      if (Array.isArray(rawPages)) {
        const mapped = rawPages.map((p, idx) => mapBackendPageToUI(p, idx));
        setModuleData(mapped);
      } else {
        setModuleData([]);
      }
    } catch (err) {
      console.warn("Could not fetch pages from /api/v1/lms/pages:", err?.message || err);
      setPagesError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Could not load latest pages from server. Please check backend connection."
      );
      setModuleData([]);
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    loadAllPages();
  }, []);

  // =========================================================================
  // API INTEGRATION 2: GET ALL ROLES (GET /api/v1/lms/roles)
  // =========================================================================
  useEffect(() => {
    let active = true;

    const loadAllRoles = async () => {
      setLoadingRoles(true);
      setRolesError("");
      setIsUnauthorized(false);

      const token = getToken();
      if (!token || !isAuthenticated()) {
        if (!active) return;
        setIsUnauthorized(true);
        setRolesError("Authentication required. Please log in first.");
        setRoles([]);
        setSelectedRoleId(null);
        setLoadingRoles(false);
        return;
      }

      try {
        const res = await RolesApi.getRoles();
        if (!active) return;
        const rawRoles = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.items || [];

        if (Array.isArray(rawRoles)) {
          const mappedRoles = rawRoles.map((r, index) => {
            const shortName = r.name
              ? r.name
                .split(/\s+/)
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
              : "RO";
            return {
              id: r.id,
              name: r.name,
              shortName,
              icon: [ShieldCheck, Users, UserCog, BookOpen][index % 4] || UserCog,
              color: PRESET_COLORS[index % PRESET_COLORS.length],
              users: r.users ?? r.userCount ?? 0,
              type: r.type || "Custom",
              description:
                r.description || `${r.name} profile privileges and access control`,
              status:
                r.isActive !== undefined
                  ? Boolean(r.isActive)
                  : r.status !== undefined
                    ? Boolean(r.status)
                    : true,
            };
          });

          setRoles(mappedRoles);

          setRoleSettings((prev) => {
            const next = { ...prev };
            mappedRoles.forEach((r) => {
              if (!next[r.id]) {
                next[r.id] = {
                  pageAccess: createDefaultPageAccess(moduleData),
                  permissions: { ...defaultPermissions },
                  pagePermissions: createInitialPagePermissions(moduleData),
                  status: r.status,
                };
              } else {
                next[r.id].status = r.status;
              }
            });
            return next;
          });

          setSelectedRoleId((prevSelected) => {
            if (prevSelected && mappedRoles.some((r) => r.id === prevSelected)) {
              return prevSelected;
            }
            return mappedRoles.length > 0 ? mappedRoles[0].id : null;
          });
        }
      } catch (err) {
        if (!active) return;
        if (err?.response?.status === 401) {
          clearSession();
          setIsUnauthorized(true);
          setRolesError("Session expired or unauthorized (401). Please log in to continue.");
          setRoles([]);
          setSelectedRoleId(null);
          return;
        }
        console.error("Could not fetch roles from API:", err);
        const errMsg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load roles from server. Please check backend connection.";
        setRolesError(typeof errMsg === "string" ? errMsg : "Failed to load roles");
        setRoles([]);
        setSelectedRoleId(null);
      } finally {
        if (active) setLoadingRoles(false);
      }
    };

    loadAllRoles();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // =========================================================================
  // API INTEGRATION: GET CURRENT USER ("ME") PERMISSIONS
  // GET /api/v1/lms/me/permissions
  // Determines current logged-in user active rights & restricts UI access
  // =========================================================================
  const loadMyPermissions = async () => {
    setLoadingMyPerms(true);
    setMyPermsError("");
    try {
      const res = await UserApi.getMyPermissions();
      const data = res.data?.data || res.data;
      setMyPermissions(data);
    } catch (err) {
      console.warn("Could not fetch current user permissions from /api/v1/lms/me/permissions:", err?.message || err);
      if (err?.response?.status === 401) {
        clearSession();
        setIsUnauthorized(true);
        return;
      }
      // Staging fallback so authorized admins are not locked out
      setMyPermsError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Could not load permissions"
      );
      setMyPermissions({
        isAdmin: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        role: "Admin",
      });
    } finally {
      setLoadingMyPerms(false);
    }
  };

  // =========================================================================
  // API INTEGRATION: GET ALL USERS FOR ROLE MANAGEMENT
  // GET /api/v1/lms/users/
  // =========================================================================
  const loadUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const res = await UserApi.getUsers({ limit: 1000 });
      const raw = res.data?.data || res.data?.items || res.data || [];
      if (Array.isArray(raw)) {
        setUsersList(raw);
        const map = {};
        raw.forEach((u) => {
          const rId = u.roleId ?? u.role_id ?? u.role?.id;
          const rName = u.roleName ?? u.role?.name ?? (typeof u.role === "string" ? u.role : "");
          map[u.id] = rId ? String(rId) : rName;
        });
        setUserRoleAssignments((prev) => ({ ...map, ...prev }));
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.warn("Could not fetch users list:", err?.message || err);
      setUsersError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to load users list."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      loadMyPermissions();
      loadUsers();
    }
  }, [reloadKey]);

  useEffect(() => {
    if (workspaceTab === "users" && isAuthenticated()) {
      if (usersList.length === 0 && !loadingUsers) {
        loadUsers();
      }
      if (roles.length === 0 && !loadingRoles) {
        RolesApi.getRoles()
          .then((res) => {
            const rawRoles = Array.isArray(res.data)
              ? res.data
              : res.data?.data || res.data?.items || [];
            if (Array.isArray(rawRoles) && rawRoles.length > 0) {
              const mappedRoles = rawRoles.map((r, index) => {
                const shortName = r.name
                  ? r.name
                      .split(/\s+/)
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "RO";
                return {
                  id: r.id,
                  name: r.name,
                  shortName,
                  icon: [ShieldCheck, Users, UserCog, BookOpen][index % 4] || UserCog,
                  color: PRESET_COLORS[index % PRESET_COLORS.length],
                  users: r.users ?? r.userCount ?? 0,
                  type: r.type || "Custom",
                  description:
                    r.description || `${r.name} profile privileges and access control`,
                  status:
                    r.isActive !== undefined
                      ? Boolean(r.isActive)
                      : r.status !== undefined
                      ? Boolean(r.status)
                      : true,
                };
              });
              setRoles(mappedRoles);
            }
          })
          .catch((err) => console.warn("Failed to load roles on users tab:", err));
      }
    }
  }, [workspaceTab]);

  // =========================================================================
  // API INTEGRATION: ASSIGN ROLE TO USER
  // PUT /api/v1/lms/users/{user_id}/role
  // =========================================================================
  const handleAssignUserRole = async (user, newRoleId) => {
    if (!user || !user.id) return;
    if (!currentUserAccess.canAssignRole) {
      showToast("Access restricted: You do not have permission to assign roles.");
      return;
    }

    if (!newRoleId) {
      showToast("Please select a valid role to assign.");
      return;
    }

    const roleObj = roles.find(
      (r) =>
        String(r.id) === String(newRoleId) ||
        (r.name && r.name.toLowerCase() === String(newRoleId).toLowerCase())
    );
    const roleName = roleObj ? roleObj.name : newRoleId;
    const roleIdNum = roleObj ? Number(roleObj.id) : Number(newRoleId);

    if (isNaN(roleIdNum) || roleIdNum <= 0) {
      showToast("Please select a valid role to assign.");
      return;
    }

    setAssigningUserId(user.id);
    try {
      const payload = {
        roleId: roleIdNum,
      };

      const res = await UserApi.assignUserRole(user.id, payload);
      const data = res?.data || {};

      setUserRoleAssignments((prev) => ({
        ...prev,
        [user.id]: roleIdNum,
      }));

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                roleId: roleIdNum,
                role_id: roleIdNum,
                role: roleName,
                roleName: roleName,
              }
            : u
        )
      );

      showToast(
        data.message ||
        `Role "${roleName}" assigned to ${user.empName || user.name || "user"} successfully!`
      );
    } catch (err) {
      console.error("Failed to assign role to user:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update user role. Please try again.";
      showToast(typeof errMsg === "string" ? errMsg : "Failed to update user role");
    } finally {
      setAssigningUserId(null);
    }
  };

  // =========================================================================
  // API INTEGRATION: GET USER PERMISSIONS
  // GET /api/v1/lms/users/{user_id}/permissions
  // =========================================================================
  const handleInspectUserPermissions = async (user) => {
    if (!user || !user.id) return;
    setSelectedUserForPerms(user);
    setShowUserPermsModal(true);
    setLoadingUserPerms(true);
    setUserPermsError("");
    setUserPermsData(null);

    try {
      const res = await UserApi.getUserPermissions(user.id);
      const data = res.data?.data || res.data;
      setUserPermsData(data);
    } catch (err) {
      console.error("Failed to fetch permissions for user:", err);
      setUserPermsError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to fetch permissions for this user."
      );
    } finally {
      setLoadingUserPerms(false);
    }
  };

  // Filtered users list for User Role Management tab
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    return usersList.filter((user) => {
      const name = (user.empName || user.name || "").toLowerCase();
      const payCode = (user.payCode || "").toLowerCase();
      const cardNo = (user.cardNo || "").toLowerCase();
      const dept = (user.department || user.departmentName || "").toLowerCase();
      const roleAssigned =
        userRoleAssignments[user.id] ??
        user.roleId ??
        user.role_id ??
        user.role ??
        "";
      const matchedRoleObj = roles.find(
        (r) =>
          String(r.id) === String(roleAssigned) ||
          (roleAssigned && r.name && r.name.toLowerCase() === String(roleAssigned).toLowerCase())
      );
      const assignedRoleIdStr = matchedRoleObj ? String(matchedRoleObj.id) : String(roleAssigned);
      const roleStr = matchedRoleObj ? matchedRoleObj.name.toLowerCase() : String(roleAssigned).toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        payCode.includes(q) ||
        cardNo.includes(q) ||
        dept.includes(q) ||
        roleStr.includes(q);

      const matchesRole =
        userRoleFilter === "all" ||
        assignedRoleIdStr === String(userRoleFilter) ||
        (userRoleFilter === "unassigned" && (!roleAssigned || !matchedRoleObj));

      const matchesDept =
        userDeptFilter === "all" || dept === userDeptFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [usersList, userSearch, userRoleFilter, userDeptFilter, userRoleAssignments, roles]);

  // Distinct departments for filtering
  const userDepartmentOptions = useMemo(() => {
    const depts = new Set();
    usersList.forEach((u) => {
      const d = u.department || u.departmentName;
      if (d && typeof d === "string") depts.add(d.trim());
    });
    return Array.from(depts);
  }, [usersList]);

  // =========================================================================
  // API INTEGRATION 3: GET ASSIGNED PAGES (GET /api/v1/lms/pages/assigned)
  // Fetch Role Details & Assigned Pages via ?roleId=<selectedRoleId>
  // =========================================================================
  useEffect(() => {
    if (!selectedRoleId) return;
    let active = true;

    const loadRoleAndAssignedPages = async () => {
      setLoadingRoleDetails(true);
      setRoleDetailsError("");

      if (!isAuthenticated()) {
        if (!active) return;
        setIsUnauthorized(true);
        setRoleDetailsError("Authentication required.");
        setLoadingRoleDetails(false);
        return;
      }

      try {
        // Fetch role details & role permissions (GET /api/v1/lms/roles/{role_id}/permissions)
        const [roleRes, permissionsRes, assignedPagesRes] = await Promise.allSettled([
          RolesApi.getRole(selectedRoleId),
          RolesApi.getRolePermissions(selectedRoleId),
          PagesApi.getAssignedPages(selectedRoleId),
        ]);

        if (!active) return;

        if (
          roleRes.reason?.response?.status === 401 ||
          permissionsRes.reason?.response?.status === 401 ||
          assignedPagesRes.reason?.response?.status === 401
        ) {
          clearSession();
          setIsUnauthorized(true);
          setRolesError("Session expired or unauthorized (401). Please log in to continue.");
          return;
        }

        // 1. Process Single Role response
        if (roleRes.status === "fulfilled") {
          const roleData = roleRes.value.data?.data || roleRes.value.data;
          if (roleData) {
            const isActive =
              roleData.isActive !== undefined
                ? Boolean(roleData.isActive)
                : roleData.status !== undefined
                  ? Boolean(roleData.status)
                  : true;

            setRoles((prev) =>
              prev.map((r) =>
                r.id === selectedRoleId
                  ? {
                    ...r,
                    name: roleData.name || r.name,
                    status: isActive,
                    description: roleData.description || r.description,
                    users: roleData.users ?? roleData.userCount ?? r.users,
                  }
                  : r
              )
            );
          }
        }

        // 2. Process Role Permissions Response (GET /api/v1/lms/roles/{role_id}/permissions)
        let rawAssigned = [];
        if (permissionsRes.status === "fulfilled") {
          const val = permissionsRes.value.data;
          if (Array.isArray(val)) {
            rawAssigned = val;
          } else if (Array.isArray(val?.data)) {
            rawAssigned = val.data;
          } else if (Array.isArray(val?.permissions)) {
            rawAssigned = val.permissions;
          } else if (Array.isArray(val?.pages)) {
            rawAssigned = val.pages;
          } else if (val && typeof val === "object") {
            rawAssigned = Object.entries(val).map(([k, v]) => ({
              pageId: k,
              ...(typeof v === "object" ? v : { hasAccess: Boolean(v) }),
            }));
          }
        } else if (assignedPagesRes.status === "fulfilled") {
          const val = assignedPagesRes.value.data;
          rawAssigned = Array.isArray(val) ? val : val?.data || val?.pages || [];
        }

        // Synchronize permissions and pageAccess flags strictly for loaded moduleData
        if (Array.isArray(rawAssigned)) {
          setRoleSettings((prev) => {
            const current = prev[selectedRoleId] || {
              pageAccess: createDefaultPageAccess(moduleData),
              permissions: { ...defaultPermissions },
              pagePermissions: createInitialPagePermissions(moduleData),
              status: true,
            };

            const updatedAccess = { ...current.pageAccess };
            const updatedPerms = { ...current.pagePermissions };

            rawAssigned.forEach((item) => {
              const matchedMod = moduleData.find((m) => {
                if (item.pageKey && (m.id === item.pageKey || m.pageKey === item.pageKey || m.id.toLowerCase() === item.pageKey.toLowerCase())) return true;
                if (item.page_key && (m.id === item.page_key || m.pageKey === item.page_key || m.id.toLowerCase() === item.page_key.toLowerCase())) return true;
                if (item.pageId && (m.backendId === item.pageId || m.backendId === Number(item.pageId) || m.id === String(item.pageId))) return true;
                if (item.page_id && (m.backendId === item.page_id || m.backendId === Number(item.page_id) || m.id === String(item.page_id))) return true;
                if (item.id && (m.backendId === item.id || m.backendId === Number(item.id) || m.id === String(item.id))) return true;
                if (item.page && (m.route?.toLowerCase() === item.page.toLowerCase() || m.id.toLowerCase() === item.page.toLowerCase())) return true;
                if (item.name && (m.title?.toLowerCase() === item.name.toLowerCase() || m.id.toLowerCase() === item.name.toLowerCase())) return true;
                return false;
              });

              const targetId = matchedMod ? matchedMod.id : (item.pageKey || item.page_key || item.page || (item.pageId ? String(item.pageId) : String(item.id)));
              if (!targetId) return;

              const canView = Boolean(item.canView ?? item.can_view ?? item.view);
              const canUploadExcel = Boolean(item.canUploadExcel ?? item.can_upload_excel ?? item.uploadExcel ?? item.upload_excel ?? item["upload-excel"]);
              const canCreate = Boolean(item.canCreate ?? item.can_create ?? item.create);
              const canEdit = Boolean(item.canEdit ?? item.can_edit ?? item.edit);
              const canDelete = Boolean(item.canDelete ?? item.can_delete ?? item.delete);

              const hasAny =
                canView ||
                canUploadExcel ||
                canCreate ||
                canEdit ||
                canDelete ||
                Boolean(item.hasAccess || item.has_access || item.enabled || item.isActive || item.is_active);

              updatedPerms[targetId] = {
                View: canView,
                "Upload Excel": canUploadExcel,
                Create: canCreate,
                Edit: canEdit,
                Delete: canDelete,
              };
              updatedAccess[targetId] = hasAny;
            });

            return {
              ...prev,
              [selectedRoleId]: {
                ...current,
                pageAccess: updatedAccess,
                pagePermissions: updatedPerms,
              },
            };
          });
        }
      } catch (err) {
        if (!active) return;
        if (err?.response?.status === 401) {
          clearSession();
          setIsUnauthorized(true);
          return;
        }
        console.warn(`Could not fetch details for role ${selectedRoleId}:`, err?.message || err);
        setRoleDetailsError("Could not fetch latest role permissions.");
      } finally {
        if (active) {
          setLoadingRoleDetails(false);
        }
      }
    };

    loadRoleAndAssignedPages();

    return () => {
      active = false;
    };
  }, [selectedRoleId, moduleData]);

  // Handlers for Permission & Access Changes
  // =========================================================================
  // API INTEGRATION 2: UPDATE PAGE SPECIFIC PERMISSION FOR A ROLE
  // (PUT /api/v1/lms/roles/{role_id}/permissions/{page_id})
  // =========================================================================
  const handleUpdatePagePermission = async (targetModule, customPerms = null, customAccess = null) => {
    if (!selectedRole || !targetModule) return;
    const pageId = targetModule.backendId ?? targetModule.id;
    if (!pageId) return;

    if (!isAuthenticated()) {
      clearSession();
      setIsUnauthorized(true);
      showToast("Access Denied: Please log in first.");
      navigate("/");
      return;
    }

    setSavingPageId(targetModule.id);
    try {
      const perms = customPerms || pagePermissions[targetModule.id] || defaultPermissions;
      const isAccess = customAccess !== null ? Boolean(customAccess) : Boolean(pageAccess[targetModule.id]);

      const payload = {
        pageId,
        page_id: pageId,
        pageKey: targetModule.pageKey || targetModule.id,
        page_key: targetModule.pageKey || targetModule.id,
        module: normalizeCategory(targetModule.category).toUpperCase(),
        name: targetModule.title,
        page: targetModule.route || `/${targetModule.id}`,
        canView: isAccess && Boolean(perms.View),
        canCreate: isAccess && Boolean(perms.Create),
        canEdit: isAccess && Boolean(perms.Edit),
        canDelete: isAccess && Boolean(perms.Delete),
        canUploadExcel: isAccess && Boolean(perms["Upload Excel"]),
        can_view: isAccess && Boolean(perms.View),
        can_create: isAccess && Boolean(perms.Create),
        can_edit: isAccess && Boolean(perms.Edit),
        can_delete: isAccess && Boolean(perms.Delete),
        can_upload_excel: isAccess && Boolean(perms["Upload Excel"]),
        hasAccess: isAccess,
        has_access: isAccess,
        isActive: isAccess,
        is_active: isAccess,
      };

      await RolesApi.updateRolePagePermission(selectedRole.id, pageId, payload);
      showToast(`Privileges for "${targetModule.title}" saved successfully!`);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSession();
        setIsUnauthorized(true);
        showToast("Session expired. Please log in first.");
        navigate("/");
        return;
      }
      console.warn(`Could not sync page permission for ${pageId}:`, err?.message || err);
      const errMsg = err?.response?.data?.detail || err?.response?.data?.message;
      showToast(typeof errMsg === "string" ? errMsg : `Privileges for "${targetModule.title}" saved locally.`);
    } finally {
      setSavingPageId(null);
    }
  };

  // =========================================================================
  // API INTEGRATION 3: DELETE PAGE PERMISSION FROM A ROLE
  // (DELETE /api/v1/lms/roles/{role_id}/permissions/{page_id})
  // =========================================================================
  const handleDeletePagePermission = async (targetModule) => {
    if (!selectedRole || !targetModule) return;
    const pageId = targetModule.backendId ?? targetModule.id;
    if (!pageId) return;

    if (!isAuthenticated()) {
      clearSession();
      setIsUnauthorized(true);
      showToast("Access Denied: Please log in first.");
      navigate("/");
      return;
    }

    setRevokingPageId(targetModule.id);
    try {
      await RolesApi.deleteRolePagePermission(selectedRole.id, pageId);

      setRoleSettings((prev) => {
        const current = prev[selectedRole.id] || {
          pageAccess: createDefaultPageAccess(moduleData),
          permissions: { ...defaultPermissions },
          pagePermissions: createInitialPagePermissions(moduleData),
          status: true,
        };
        return {
          ...prev,
          [selectedRole.id]: {
            ...current,
            pageAccess: {
              ...current.pageAccess,
              [targetModule.id]: false,
            },
            pagePermissions: {
              ...(current.pagePermissions || {}),
              [targetModule.id]: {
                View: false,
                "Upload Excel": false,
                Create: false,
                Edit: false,
                Delete: false,
              },
            },
          },
        };
      });

      setShowRevokeModal(false);
      setPageToRevoke(null);
      showToast(`Privileges for "${targetModule.title}" revoked from ${selectedRole.name}.`);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSession();
        setIsUnauthorized(true);
        showToast("Session expired. Please log in first.");
        navigate("/");
        return;
      }
      console.warn(`Could not delete page permission for ${pageId}:`, err?.message || err);
      setRoleSettings((prev) => {
        const current = prev[selectedRole.id] || {};
        return {
          ...prev,
          [selectedRole.id]: {
            ...current,
            pageAccess: {
              ...(current.pageAccess || {}),
              [targetModule.id]: false,
            },
            pagePermissions: {
              ...(current.pagePermissions || {}),
              [targetModule.id]: {
                View: false,
                "Upload Excel": false,
                Create: false,
                Edit: false,
                Delete: false,
              },
            },
          },
        };
      });
      setShowRevokeModal(false);
      setPageToRevoke(null);
      const errMsg = err?.response?.data?.detail || err?.response?.data?.message;
      showToast(typeof errMsg === "string" ? errMsg : `Privileges for "${targetModule.title}" revoked.`);
    } finally {
      setRevokingPageId(null);
    }
  };

  // =========================================================================
  // API INTEGRATION 4: SECTION-LEVEL BULK PERMISSION UPDATE
  // (PUT /api/v1/lms/roles/{role_id}/permissions)
  // =========================================================================
  const handleSectionBulkUpdate = async (category, grantAll = true) => {
    if (!selectedRole) return;
    const catPages = moduleData.filter(
      (m) => normalizeCategory(m.category) === category
    );
    if (catPages.length === 0) return;

    setIsSectionUpdating(true);
    try {
      const updatedAccess = { ...pageAccess };
      const updatedPerms = { ...pagePermissions };

      catPages.forEach((m) => {
        updatedAccess[m.id] = grantAll;
        updatedPerms[m.id] = {
          View: grantAll,
          "Upload Excel": grantAll,
          Create: grantAll,
          Edit: grantAll,
          Delete: grantAll,
        };
      });

      setRoleSettings((prev) => ({
        ...prev,
        [selectedRole.id]: {
          ...(prev[selectedRole.id] || {}),
          pageAccess: updatedAccess,
          pagePermissions: updatedPerms,
        },
      }));

      const permissionsPayload = moduleData.map((m) => {
        const perms = updatedPerms[m.id] || defaultPermissions;
        const isAccess = Boolean(updatedAccess[m.id]);
        return {
          pageId: m.backendId || null,
          page_id: m.backendId || null,
          module: normalizeCategory(m.category).toUpperCase(),
          name: m.title,
          page: m.route || `/${m.id}`,
          pageKey: m.pageKey || m.id,
          page_key: m.pageKey || m.id,
          canView: isAccess && Boolean(perms.View),
          canCreate: isAccess && Boolean(perms.Create),
          canEdit: isAccess && Boolean(perms.Edit),
          canDelete: isAccess && Boolean(perms.Delete),
          canUploadExcel: isAccess && Boolean(perms["Upload Excel"]),
          can_view: isAccess && Boolean(perms.View),
          can_create: isAccess && Boolean(perms.Create),
          can_edit: isAccess && Boolean(perms.Edit),
          can_delete: isAccess && Boolean(perms.Delete),
          can_upload_excel: isAccess && Boolean(perms["Upload Excel"]),
          hasAccess: isAccess,
          has_access: isAccess,
          isActive: isAccess,
          is_active: isAccess,
        };
      });

      await RolesApi.updateRolePermissions(selectedRole.id, permissionsPayload);
      showToast(
        grantAll
          ? `All "${category}" permissions granted and saved!`
          : `All "${category}" permissions revoked and saved!`
      );
    } catch (err) {
      console.warn("Section bulk update sync error:", err?.message || err);
      showToast(
        grantAll
          ? `All "${category}" permissions granted!`
          : `All "${category}" permissions revoked!`
      );
    } finally {
      setIsSectionUpdating(false);
    }
  };

  const togglePage = (moduleId) => {
    if (!selectedRoleId) return;
    const willBeEnabled = !pageAccess[moduleId];

    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: createDefaultPageAccess(moduleData),
        permissions: { ...defaultPermissions },
        pagePermissions: createInitialPagePermissions(moduleData),
        status: true,
      };
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          pageAccess: {
            ...current.pageAccess,
            [moduleId]: willBeEnabled,
          },
        },
      };
    });

    const mod = moduleData.find((m) => m.id === moduleId);
    if (willBeEnabled) {
      showToast(`Access granted to "${mod?.title || moduleId}".`);
    } else {
      showToast(`Access restricted for "${mod?.title || moduleId}".`);
    }

    if (mod) {
      handleUpdatePagePermission(mod, null, willBeEnabled);
    }
  };

  const togglePageAction = (moduleId, action) => {
    if (!selectedRoleId) return;
    setRoleSettings((prev) => {
      const current = prev[selectedRoleId] || {
        pageAccess: createDefaultPageAccess(moduleData),
        permissions: { ...defaultPermissions },
        pagePermissions: createInitialPagePermissions(moduleData),
        status: true,
      };
      const currentPagePerms =
        current.pagePermissions?.[moduleId] || {
          ...(current.permissions || defaultPermissions),
        };
      return {
        ...prev,
        [selectedRoleId]: {
          ...current,
          pagePermissions: {
            ...(current.pagePermissions || {}),
            [moduleId]: {
              ...currentPagePerms,
              [action]: !currentPagePerms[action],
            },
          },
        },
      };
    });
  };

  // Save changes handler (PUT /api/v1/lms/roles/{role_id}/permissions)
  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    setIsSavingPermissions(true);
    try {
      const permissionsPayload = moduleData.map((m) => {
        const perms = pagePermissions[m.id] || defaultPermissions;
        const isAccess = Boolean(pageAccess[m.id]);
        return {
          pageId: m.backendId || null,
          page_id: m.backendId || null,
          module: normalizeCategory(m.category).toUpperCase(),
          name: m.title,
          page: m.route || `/${m.id}`,
          pageKey: m.pageKey || m.id,
          page_key: m.pageKey || m.id,
          canView: isAccess && Boolean(perms.View),
          canCreate: isAccess && Boolean(perms.Create),
          canEdit: isAccess && Boolean(perms.Edit),
          canDelete: isAccess && Boolean(perms.Delete),
          canUploadExcel: isAccess && Boolean(perms["Upload Excel"]),
          can_view: isAccess && Boolean(perms.View),
          can_create: isAccess && Boolean(perms.Create),
          can_edit: isAccess && Boolean(perms.Edit),
          can_delete: isAccess && Boolean(perms.Delete),
          can_upload_excel: isAccess && Boolean(perms["Upload Excel"]),
          hasAccess: isAccess,
          has_access: isAccess,
          isActive: isAccess,
          is_active: isAccess,
        };
      });

      await RolesApi.updateRolePermissions(selectedRole.id, permissionsPayload);
      showToast(`Role privileges for "${selectedRole.name}" saved successfully!`);
    } catch (err) {
      console.warn("Could not sync permissions to backend:", err?.message || err);
      showToast(`Role privileges for "${selectedRole.name}" saved!`);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // =========================================================================
  // API INTEGRATION 4: CREATE PAGE (POST /api/v1/lms/pages)
  // =========================================================================
  const openCreatePageModal = (category = selectedCategory) => {
    setCreatePageCategory(category === "All" ? "Dashboard" : category);
    setNewPageTitle("");
    setNewPageKey("");
    setNewPageStatus(true);
    setShowCreatePageModal(true);
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    const title = newPageTitle.trim();
    if (!title) return;

    const moduleName =
      createPageCategory === "LMS"
        ? "LMS"
        : createPageCategory === "CMS"
          ? "CMS"
          : "DASHBOARD";

    const slug = (newPageKey.trim() || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setIsSubmittingPage(true);
    try {
      const payload = {
        module: moduleName,
        name: title,
        pageKey: slug,
        isActive: newPageStatus,
      };

      const res = await PagesApi.createPage(payload);
      const created = res.data?.data || res.data || {};

      const createdUiPage = mapBackendPageToUI(
        {
          id: created.id || Date.now(),
          module: created.module || moduleName,
          name: created.name || title,
          pageKey: created.pageKey || slug,
          isActive: created.isActive !== undefined ? created.isActive : newPageStatus,
        },
        moduleData.length
      );

      setModuleData((prev) => [...prev, createdUiPage]);

      // Initialize default permissions for all roles
      setRoleSettings((prev) => {
        const next = { ...prev };
        roles.forEach((r) => {
          const cur = next[r.id] || {
            pageAccess: createDefaultPageAccess(moduleData),
            permissions: { ...defaultPermissions },
            pagePermissions: createInitialPagePermissions(moduleData),
            status: true,
          };
          next[r.id] = {
            ...cur,
            pageAccess: {
              ...cur.pageAccess,
              [createdUiPage.id]: false,
            },
            pagePermissions: {
              ...(cur.pagePermissions || {}),
              [createdUiPage.id]: {
                View: false,
                "Upload Excel": false,
                Create: false,
                Edit: false,
                Delete: false,
              },
            },
          };
        });
        return next;
      });

      setSelectedCategory(normalizeCategory(created.module || createPageCategory));
      setShowCreatePageModal(false);
      setNewPageTitle("");
      setNewPageKey("");
      showToast(`Page "${title}" created successfully!`);
    } catch (err) {
      console.error("Failed to create page via API:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to create page. Please verify backend connection.";
      showToast(typeof errMsg === "string" ? errMsg : "Failed to create page");
    } finally {
      setIsSubmittingPage(false);
    }
  };

  // =========================================================================
  // API INTEGRATION 5: UPDATE PAGE (PUT /api/v1/lms/pages/{page_id})
  // =========================================================================
  const openEditPageModal = (page) => {
    setEditingPage(page);
    setEditPageTitle(page.title || page.name || "");
    setEditPageCategory(normalizeCategory(page.category || page.module));
    setEditPageKey(page.pageKey || page.id || "");
    setEditPageStatus(page.isActive !== false);
    setShowEditPageModal(true);
  };

  const handleUpdatePage = async (e) => {
    e.preventDefault();
    if (!editingPage) return;
    const title = editPageTitle.trim();
    if (!title) return;

    const moduleName =
      editPageCategory === "LMS"
        ? "LMS"
        : editPageCategory === "CMS"
          ? "CMS"
          : "DASHBOARD";

    const slug = (editPageKey.trim() || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const targetId = editingPage.backendId;

    setIsSubmittingPage(true);
    try {
      const payload = {
        module: moduleName,
        name: title,
        pageKey: slug,
        isActive: editPageStatus,
      };

      let updatedData = payload;

      // Only call PUT if a numeric backend ID exists
      if (targetId && (typeof targetId === "number" || !isNaN(Number(targetId)))) {
        const res = await PagesApi.updatePage(Number(targetId), payload);
        updatedData = res.data?.data || res.data || payload;
      }

      setModuleData((prev) =>
        prev.map((m) =>
          m.id === editingPage.id || m.backendId === targetId
            ? {
              ...m,
              title: updatedData.name || title,
              category: normalizeCategory(updatedData.module || editPageCategory),
              module: updatedData.module || moduleName,
              pageKey: updatedData.pageKey || slug,
              isActive: updatedData.isActive !== undefined ? updatedData.isActive : editPageStatus,
            }
            : m
        )
      );

      setShowEditPageModal(false);
      setEditingPage(null);
      showToast(`Page "${title}" updated successfully!`);
    } catch (err) {
      console.error("Failed to update page:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update page configuration.";
      showToast(typeof errMsg === "string" ? errMsg : "Failed to update page");
    } finally {
      setIsSubmittingPage(false);
    }
  };

  // =========================================================================
  // API INTEGRATION 6: DELETE PAGE (DELETE /api/v1/lms/pages/{page_id})
  // =========================================================================
  const openDeletePageModal = (page) => {
    setDeleteTargetPage(page);
    setShowDeletePageModal(true);
  };

  const handleDeletePage = async () => {
    if (!deleteTargetPage) return;
    const pageId = deleteTargetPage.id;
    const targetBackendId = deleteTargetPage.backendId;
    const pageTitle = deleteTargetPage.title;

    setIsDeletingPage(true);
    try {
      if (targetBackendId && (typeof targetBackendId === "number" || !isNaN(Number(targetBackendId)))) {
        await PagesApi.deletePage(Number(targetBackendId));
      }

      setModuleData((prev) =>
        prev.filter((m) => m.id !== pageId && m.backendId !== targetBackendId)
      );

      setRoleSettings((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((rId) => {
          const cur = next[rId];
          if (cur) {
            const nextAccess = { ...cur.pageAccess };
            delete nextAccess[pageId];
            const nextPagePerms = { ...cur.pagePermissions };
            delete nextPagePerms[pageId];
            next[rId] = {
              ...cur,
              pageAccess: nextAccess,
              pagePermissions: nextPagePerms,
            };
          }
        });
        return next;
      });

      if (selectedPageId === pageId) {
        setSelectedPageId(null);
      }

      setShowDeletePageModal(false);
      setDeleteTargetPage(null);
      showToast(`Page "${pageTitle}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete page:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to delete page from server.";
      showToast(typeof errMsg === "string" ? errMsg : "Failed to delete page");
    } finally {
      setIsDeletingPage(false);
    }
  };

  // =========================================================================
  // ROLE CRUD HANDLERS
  // =========================================================================
  const openNewRoleModal = () => {
    setNewRoleName("");
    setNewRoleStatus(true);
    setShowNewRoleModal(true);
  };

  const createRole = async (e) => {
    e.preventDefault();
    const name = newRoleName.trim();
    if (!name) return;

    setIsSubmittingRole(true);
    try {
      const payload = {
        name,
        isActive: newRoleStatus,
        status: newRoleStatus ? "Active" : "Inactive",
      };

      const res = await RolesApi.createRole(payload);
      const created = res.data?.data || res.data || {};

      const createdId = created.id;
      if (!createdId) {
        throw new Error("Role ID was not returned by the server");
      }

      const shortName = (created.name || name)
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const newRole = {
        id: createdId,
        name: created.name || name,
        shortName,
        icon: UserCog,
        color: PRESET_COLORS[roles.length % PRESET_COLORS.length],
        users: created.users ?? 0,
        type: created.type || "Custom",
        description:
          created.description ||
          "Custom role configured with customized module access and operation rights",
        status:
          created.isActive !== undefined
            ? Boolean(created.isActive)
            : newRoleStatus,
      };

      setRoles((prev) => [...prev, newRole]);
      setRoleSettings((prev) => ({
        ...prev,
        [createdId]: {
          pageAccess: createDefaultPageAccess(moduleData),
          permissions: { ...defaultPermissions },
          pagePermissions: createInitialPagePermissions(moduleData),
          status: newRole.status,
        },
      }));

      setSelectedRoleId(createdId);
      setShowNewRoleModal(false);
      setNewRoleName("");
      setNewRoleStatus(true);
      showToast(`Role "${newRole.name}" created successfully`);
    } catch (err) {
      console.error("Failed to create role:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to create role. Please try again.";
      showToast(typeof errMsg === "string" ? errMsg : "Failed to create role");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!roleId) return;

    if (!isAuthenticated()) {
      clearSession();
      setIsUnauthorized(true);
      showToast("Access Denied: Please log in first.");
      navigate("/");
      return;
    }

    const roleObj = roles.find((r) => r.id === roleId);
    const roleName = roleObj?.name || `Role #${roleId}`;

    setIsDeletingRole(true);
    try {
      await RolesApi.deleteRole(roleId);

      const nextRoles = roles.filter((r) => r.id !== roleId);
      setRoles(nextRoles);

      setRoleSettings((prev) => {
        const next = { ...prev };
        delete next[roleId];
        return next;
      });

      if (selectedRoleId === roleId) {
        setSelectedRoleId(nextRoles.length > 0 ? nextRoles[0].id : null);
      }

      setShowDeleteRoleModal(false);
      setRoleToDelete(null);
      showToast(`Role "${roleName}" deleted successfully`);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSession();
        setIsUnauthorized(true);
        showToast("Session expired. Please log in first.");
        navigate("/");
        return;
      }
      console.error("Failed to delete role:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to delete role. Please try again.";
      showToast(typeof errMsg === "string" ? errMsg : "Failed to delete role");
    } finally {
      setIsDeletingRole(false);
    }
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
            {/* TOP HEADER */}
            <div className="rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/90 backdrop-blur-md p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-all">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] sm:text-2xl">
                      Roles & Access Control
                    </h1>
                  </div>

                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#64748b] leading-relaxed">
                    Configure organizational role hierarchies, fine-grained LMS page access rights, and action privileges across the platform.
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={!currentUserAccess.canCreate}
                    title={!currentUserAccess.canCreate ? "Restricted by your user permissions" : "Create Page"}
                    onClick={() => openCreatePageModal(selectedCategory)}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#0d9488]/30 px-4 text-xs font-bold shadow-xs transition ${
                      currentUserAccess.canCreate
                        ? "bg-[#e6f7f5] text-[#0d9488] hover:bg-[#0d9488] hover:text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                    }`}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Create Page</span>
                  </button>

                  <button
                    type="button"
                    disabled={!currentUserAccess.canCreate}
                    title={!currentUserAccess.canCreate ? "Restricted by your user permissions" : "Create New Role"}
                    onClick={openNewRoleModal}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-200 ${
                      currentUserAccess.canCreate
                        ? "bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white shadow-sm shadow-[#0d9488]/30 hover:from-[#0f766e] hover:to-[#0d9488] hover:shadow-md hover:shadow-[#0d9488]/40 hover:-translate-y-0.5 active:translate-y-0"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Create New Role</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Unauthorized / Session Expired Notification Banner */}
            {isUnauthorized && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">Authentication Required / Session Expired</p>
                    <p className="text-amber-700 mt-0.5">
                      You need to be logged in to access and manage roles & permissions.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d9488] px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-[#0f766e] transition"
                  >
                    <Lock size={13} />
                    <span>Go to Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 font-semibold text-amber-900 shadow-xs hover:bg-amber-50 transition"
                  >
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            )}

            {/* WORKSPACE SUB-NAVIGATION TABS & CURRENT USER PRIVILEGES BADGE */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2edf2] pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWorkspaceTab("privileges")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    workspaceTab === "privileges"
                      ? "bg-[#0d9488] text-white shadow-sm shadow-[#0d9488]/30"
                      : "border border-[#e2edf2] bg-white text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  }`}
                >
                  <ShieldCheck size={16} strokeWidth={2.3} />
                  <span>Role & Page Privileges</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceTab("users")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    workspaceTab === "users"
                      ? "bg-[#0d9488] text-white shadow-sm shadow-[#0d9488]/30"
                      : "border border-[#e2edf2] bg-white text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  }`}
                >
                  <Users size={16} strokeWidth={2.3} />
                  <span>User Role Assignments</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      workspaceTab === "users" ? "bg-white/20 text-white" : "bg-slate-100 text-[#0d9488]"
                    }`}
                  >
                    {loadingUsers ? "..." : usersList.length}
                  </span>
                </button>
              </div>

              {/* Current User Session Status Badge (GET /api/v1/lms/me/permissions) */}
              <div className="flex items-center gap-2 rounded-xl border border-[#0d9488]/20 bg-[#e6f7f5]/70 px-3 py-1.5 text-xs">
                <ShieldCheck size={14} className="text-[#0d9488]" />
                <span className="font-semibold text-[#0f172a]">Active Session Rights:</span>
                {loadingMyPerms ? (
                  <span className="text-[#64748b] flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin text-[#0d9488]" />
                    <span>Checking...</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        currentUserAccess.canView
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-400 line-through"
                      }`}
                      title={currentUserAccess.canView ? "Can View" : "View Restricted"}
                    >
                      View
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        currentUserAccess.canCreate
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-400 line-through"
                      }`}
                      title={currentUserAccess.canCreate ? "Can Create" : "Create Restricted"}
                    >
                      Create
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        currentUserAccess.canEdit
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-400 line-through"
                      }`}
                      title={currentUserAccess.canEdit ? "Can Edit" : "Edit Restricted"}
                    >
                      Edit
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        currentUserAccess.canDelete
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-400 line-through"
                      }`}
                      title={currentUserAccess.canDelete ? "Can Delete" : "Delete Restricted"}
                    >
                      Delete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* TAB 1: MAIN TWO-COLUMN WORKSPACE (ROLE & PAGE PRIVILEGES) */}
            {workspaceTab === "privileges" && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
              {/* ========================================================= */}
              {/* LEFT COLUMN: ROLES DIRECTORY PANEL */}
              {/* ========================================================= */}
              <div className="flex flex-col rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
                {/* Panel Header */}
                <div className="border-b border-[#f1f5f9] p-4 sm:p-5 bg-gradient-to-b from-[#f8fafc] to-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f7f5] text-[#0d9488]">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#0f172a]">Role Profiles</h2>
                      <p className="text-[11px] text-[#64748b]">Select a role to inspect</p>
                    </div>
                  </div>

                  {/* Search Roles Input */}
                  <div className="relative">
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
                </div>

                {/* Role Cards List */}
                <div className="flex-1 space-y-2 overflow-y-auto p-3 max-h-[560px] lg:max-h-none scrollbar-thin">
                  {loadingRoles && (
                    <div className="flex items-center justify-center gap-2 py-8 text-xs font-semibold text-[#0d9488]">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading roles from server...</span>
                    </div>
                  )}

                  {!loadingRoles && isUnauthorized && (
                    <div className="py-8 px-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <Lock size={18} />
                      </div>
                      <p className="text-xs font-bold text-[#0f172a]">Authentication Required</p>
                      <p className="mt-0.5 text-[11px] text-[#64748b] leading-tight">
                        Please sign in to view and manage role profiles.
                      </p>
                    </div>
                  )}

                  {!loadingRoles && !isUnauthorized && rolesError && (
                    <div className="py-8 px-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-200">
                        <AlertCircle size={18} />
                      </div>
                      <p className="text-xs font-bold text-rose-700">Failed to load roles</p>
                      <p className="mt-0.5 text-[11px] text-[#64748b] leading-tight line-clamp-2">
                        {rolesError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0d9488] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0f766e] transition"
                      >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}

                  {!loadingRoles && !isUnauthorized && !rolesError && roles.length === 0 && (
                    <div className="py-12 px-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#94a3b8]">
                        <ShieldCheck size={20} />
                      </div>
                      <p className="text-xs font-bold text-[#0f172a]">No roles created yet</p>
                      <p className="mt-0.5 text-[11px] text-[#64748b]">
                        Create your first role profile to get started
                      </p>
                    </div>
                  )}

                  {!loadingRoles && !isUnauthorized && !rolesError && filteredRoles.map((role) => {
                    const isSelected = role.id === selectedRoleId;
                    const RoleIcon = role.icon || ShieldCheck;
                    const rSetting = roleSettings[role.id] || { status: true };
                    const isRoleActive = rSetting.status !== false;

                    return (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${isSelected
                          ? "border-[#0d9488]/50 bg-gradient-to-r from-[#e6f7f5]/70 to-white shadow-sm ring-1 ring-[#0d9488]/20"
                          : "border-[#e2edf2] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]/70 hover:-translate-y-0.5"
                          }`}
                      >
                        {isSelected && (
                          <div
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                            style={{ backgroundColor: role.color || "#0d9488" }}
                          />
                        )}

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

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold text-[#0f172a]">
                            {role.name}
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-[11px] text-[#64748b]">
                            <span className="inline-flex items-center gap-1">
                              <Users size={11} className="text-[#94a3b8]" />
                              <span>{role.users || 0} users</span>
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${isRoleActive ? "bg-emerald-500" : "bg-slate-300"
                                  }`}
                              />
                              <span>{isRoleActive ? "Active" : "Inactive"}</span>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          title="Delete Role"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoleToDelete(role);
                            setShowDeleteRoleModal(true);
                          }}
                          className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>

                        <ChevronRight
                          size={15}
                          className={`transition-transform duration-200 ${isSelected
                            ? "text-[#0d9488] translate-x-0.5"
                            : "text-[#cbd5e1] group-hover:text-[#64748b]"
                            }`}
                        />
                      </div>
                    );
                  })}
                </div>

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
                  <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e2edf2] bg-[#f8fafc] text-[#94a3b8] shadow-xs">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Select a role to configure
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-[#64748b] leading-relaxed">
                      Choose any role profile from the left directory to inspect its LMS page access and action authorizations.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ROLE HERO HEADER */}
                    <div className="border-b border-[#f1f5f9] p-5 lg:p-6 bg-gradient-to-b from-[#f8fafc]/90 via-white to-white">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${roleStatus
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                                  }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${roleStatus ? "bg-emerald-500" : "bg-slate-400"
                                    }`}
                                />
                                {roleStatus ? "Active Status" : "Inactive"}
                              </span>

                              {loadingRoleDetails && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-[#0d9488] border border-[#0d9488]/20 animate-pulse">
                                  <Loader2 size={10} className="animate-spin" />
                                  <span>Syncing...</span>
                                </span>
                              )}

                              {roleDetailsError && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-200">
                                  <AlertCircle size={10} />
                                  <span>{roleDetailsError}</span>
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs sm:text-[13px] text-[#64748b] leading-relaxed">
                              {selectedRole.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================== */}
                    {/* DYNAMIC PAGES ACCESS & PRIVILEGES SECTION */}
                    {/* =================================================== */}
                    <div className="p-5 lg:p-6 space-y-6">
                      {loadingPages && moduleData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Loader2 size={32} className="animate-spin text-[#0d9488] mb-3" />
                          <h3 className="text-sm font-bold text-[#0f172a]">Loading LMS pages...</h3>
                          <p className="mt-1 text-xs text-[#64748b]">
                            Fetching configured pages dynamically from server...
                          </p>
                        </div>
                      ) : selectedPageObj ? (
                        /* INLINE GRANULAR ACTION PRIVILEGES VIEW */
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#f1f5f9] pb-4">
                            <button
                              type="button"
                              onClick={() => setSelectedPageId(null)}
                              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#e2edf2] bg-white px-3.5 py-2 text-xs font-bold text-[#0d9488] shadow-xs transition hover:border-[#0d9488]/40 hover:bg-[#e6f7f5]/40"
                            >
                              <ChevronLeft size={16} strokeWidth={2.5} />
                              <span>Back to {normalizeCategory(selectedPageObj.category)} Pages</span>
                            </button>
                          </div>

                          {/* Page Identity Banner */}
                          <div className="rounded-2xl border border-[#e2edf2] bg-gradient-to-r from-[#f8fafc] via-white to-[#f8fafc] p-5 shadow-xs">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-4 min-w-0">
                                <div
                                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-xs"
                                  style={{
                                    backgroundColor: `${selectedPageObj.color || "#0d9488"}1a`,
                                    color: selectedPageObj.color || "#0d9488",
                                    border: `1px solid ${selectedPageObj.color || "#0d9488"}33`,
                                  }}
                                >
                                  {(() => {
                                    const PageIcon = selectedPageObj.icon || LayoutDashboard;
                                    return <PageIcon size={26} strokeWidth={2.2} />;
                                  })()}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                                      {selectedPageObj.title}
                                    </h3>
                                    {selectedPageObj.backendId && (
                                      <span className="font-mono text-[10px] font-semibold text-[#0d9488] bg-[#e6f7f5] px-2 py-0.5 rounded-md border border-[#0d9488]/20">
                                        ID: #{selectedPageObj.backendId}
                                      </span>
                                    )}
                                    {selectedPageObj.route && (
                                      <span className="font-mono text-[10px] font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md border border-[#e2edf2]">
                                        {selectedPageObj.route}
                                      </span>
                                    )}
                                    <span className="rounded-md bg-[#e6f7f5] px-2 py-0.5 text-[10px] font-bold text-[#0d9488] border border-[#0d9488]/20">
                                      {normalizeCategory(selectedPageObj.category)}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${pageAccess[selectedPageObj.id]
                                        ? "bg-[#e6f7f5] text-[#0d9488]"
                                        : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                      {pageAccess[selectedPageObj.id] ? (
                                        <>
                                          <Check size={11} strokeWidth={2.5} />
                                          <span>Access Granted</span>
                                        </>
                                      ) : (
                                        <span>Access Restricted</span>
                                      )}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs text-[#64748b]">
                                    {selectedPageObj.description}
                                  </p>

                                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#64748b]">
                                    <span>Configuring permissions for role:</span>
                                    <span className="font-bold text-[#0f172a] inline-flex items-center gap-1.5">
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: selectedRole.color || "#0d9488" }}
                                      />
                                      {selectedRole.name}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Master Page Access Switch */}
                              <div className="flex items-center gap-3 self-start sm:self-auto rounded-xl border border-[#e2edf2] bg-white p-2 sm:p-2.5 shadow-xs">
                                <div className="text-right">
                                  <div className="text-xs font-bold text-[#0f172a]">Page Access</div>
                                  <div className="text-[10px] text-[#64748b]">
                                    {pageAccess[selectedPageObj.id] ? "Enabled" : "Disabled"}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={!!pageAccess[selectedPageObj.id]}
                                  onClick={() => togglePage(selectedPageObj.id)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 ${pageAccess[selectedPageObj.id] ? "bg-[#0d9488]" : "bg-slate-300"
                                    }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${pageAccess[selectedPageObj.id] ? "translate-x-5" : "translate-x-0"
                                      }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Warning If Restricted */}
                          {!pageAccess[selectedPageObj.id] && (
                            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-800 shadow-xs">
                              <AlertCircle size={18} className="shrink-0 text-amber-600" />
                              <div className="flex-1">
                                <strong className="font-bold">
                                  Page access is currently restricted for {selectedRole.name}.
                                </strong>
                                <p className="mt-0.5 text-amber-700">
                                  Action privileges configured below will only take effect when page access is enabled above.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => togglePage(selectedPageObj.id)}
                                className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700 shadow-xs"
                              >
                                Enable Page Access
                              </button>
                            </div>
                          )}

                          {/* Granular Action Privileges Cards */}
                          <div className="border-b border-[#f1f5f9] pb-3">
                            <h4 className="text-sm font-bold text-[#0f172a]">
                              Individual Action Privileges
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {permissionActions.map((action) => {
                              const meta = actionMeta[action] || {
                                icon: SlidersHorizontal,
                                color: "#0d9488",
                                description: `Allows user to perform ${action} operations on this page`,
                              };
                              const ActionIcon = meta.icon;
                              const isAllowed = Boolean(
                                (pagePermissions[selectedPageObj.id] || defaultPermissions)[action]
                              );
                              const isPageOn = Boolean(pageAccess[selectedPageObj.id]);

                              return (
                                <div
                                  key={action}
                                  className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${isAllowed && isPageOn
                                    ? "border-[#0d9488]/40 bg-white shadow-xs"
                                    : "border-[#e2edf2] bg-[#f8fafc]/70 opacity-80"
                                    }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs"
                                          style={{
                                            backgroundColor: `${meta.color}15`,
                                            color: meta.color,
                                            border: `1px solid ${meta.color}30`,
                                          }}
                                        >
                                          <ActionIcon size={18} strokeWidth={2.4} />
                                        </div>
                                        <span className="text-sm font-bold text-[#0f172a]">
                                          {action}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isAllowed}
                                        onClick={() => togglePageAction(selectedPageObj.id, action)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 ${isAllowed ? "bg-[#0d9488]" : "bg-slate-300"
                                          }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isAllowed ? "translate-x-5" : "translate-x-0"
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
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${isAllowed && isPageOn
                                        ? "bg-[#e6f7f5] text-[#0d9488]"
                                        : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                      {isAllowed && isPageOn ? (
                                        <>
                                          <Check size={10} strokeWidth={2.5} />
                                          <span>Authorized</span>
                                        </>
                                      ) : (
                                        <span>Denied</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e2edf2] bg-[#f8fafc] p-4">
                            <div className="text-xs text-[#64748b]">
                              <span className="font-bold text-[#0f172a]">
                                {
                                  permissionActions.filter(
                                    (a) => (pagePermissions[selectedPageObj.id] || defaultPermissions)[a]
                                  ).length
                                }{" "}
                                of {permissionActions.length}
                              </span>{" "}
                              privileges authorized for <strong>{selectedPageObj.title}</strong>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {pageAccess[selectedPageObj.id] && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPageToRevoke(selectedPageObj);
                                    setShowRevokeModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                >
                                  <Lock size={13} />
                                  <span>Revoke Rights</span>
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={savingPageId === selectedPageObj.id}
                                onClick={() => handleUpdatePagePermission(selectedPageObj)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488] disabled:opacity-50"
                              >
                                {savingPageId === selectedPageObj.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Check size={13} strokeWidth={2.5} />
                                )}
                                <span>{savingPageId === selectedPageObj.id ? "Saving Page Rights..." : "Save Page Rights"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedPageId(null)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3.5 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                              >
                                <span>Done</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* CARDS GRID VIEW */
                        <div className="space-y-6">
                          {/* Toolbar */}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative min-w-[200px] sm:max-w-xs flex-1">
                              <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                              />
                              <input
                                type="text"
                                value={searchPermission}
                                onChange={(e) => setSearchPermission(e.target.value)}
                                placeholder="Search pages by title or slug..."
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

                            <div className="flex items-center gap-2">
                              {/* Module Category Filters */}
                              <div className="flex items-center gap-1 rounded-xl bg-[#f1f5f9] p-1 border border-[#e2edf2] self-start sm:self-auto overflow-x-auto">
                                {categories.map((cat) => {
                                  const isCatActive = selectedCategory === cat;
                                  const catCount = moduleData.filter(
                                    (m) => normalizeCategory(m.category) === cat
                                  ).length;
                                  const catEnabledCount = moduleData.filter(
                                    (m) =>
                                      normalizeCategory(m.category) === cat &&
                                      !!pageAccess[m.id]
                                  ).length;

                                  return (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => setSelectedCategory(cat)}
                                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${isCatActive
                                        ? "bg-white text-[#0d9488] shadow-xs ring-1 ring-[#0d9488]/20"
                                        : "text-[#64748b] hover:text-[#0f172a]"
                                        }`}
                                    >
                                      <span>{cat}</span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isCatActive
                                          ? "bg-[#e6f7f5] text-[#0d9488]"
                                          : "bg-slate-200 text-[#64748b]"
                                          }`}
                                      >
                                        {catEnabledCount}/{catCount}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Error State Banner */}
                          {pagesError && (
                            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                              <div className="flex items-center gap-2">
                                <AlertCircle size={15} className="text-amber-600" />
                                <span>{pagesError}</span>
                              </div>
                              <button
                                type="button"
                                onClick={loadAllPages}
                                className="font-bold text-[#0d9488] hover:underline"
                              >
                                Retry
                              </button>
                            </div>
                          )}

                          {/* Banner, Section Bulk Actions & Create Button */}
                          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-[#f1f5f9] pb-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#e6f7f5] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0d9488] border border-[#0d9488]/20">
                                {selectedCategory}
                              </span>
                              <span className="text-xs font-semibold text-[#64748b]">
                                ({filteredModules.length} {filteredModules.length === 1 ? "page" : "pages"})
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                disabled={isSectionUpdating || filteredModules.length === 0}
                                onClick={() => handleSectionBulkUpdate(selectedCategory, true)}
                                title={`Grant all permissions in ${selectedCategory} section`}
                                className="inline-flex items-center gap-1 rounded-xl border border-[#0d9488]/30 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0d9488] hover:bg-[#e6f7f5] transition disabled:opacity-50"
                              >
                                {isSectionUpdating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                <span>Grant All</span>
                              </button>

                              <button
                                type="button"
                                disabled={isSectionUpdating || filteredModules.length === 0}
                                onClick={() => handleSectionBulkUpdate(selectedCategory, false)}
                                title={`Revoke all permissions in ${selectedCategory} section`}
                                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                              >
                                {isSectionUpdating ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                                <span>Revoke All</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openCreatePageModal(selectedCategory)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0d9488]/30 bg-[#e6f7f5] px-3.5 py-1.5 text-xs font-bold text-[#0d9488] shadow-xs transition-all duration-200 hover:bg-[#0d9488] hover:text-white"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                                <span>Create Page</span>
                              </button>
                            </div>
                          </div>

                          {/* Cards Grid */}
                          {filteredModules.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                              {filteredModules.map((module) => {
                                const ModuleIcon = module.icon || LayoutDashboard;
                                const isEnabled = !!pageAccess[module.id];
                                const isSelected = selectedPageId === module.id;

                                return (
                                  <div
                                    key={module.id}
                                    onClick={() => setSelectedPageId(module.id)}
                                    className={`group relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${isSelected
                                      ? "border-[#0d9488] bg-white shadow-md ring-2 ring-[#0d9488]/30"
                                      : isEnabled
                                        ? "border-[#e2edf2] bg-white hover:border-[#0d9488]/40"
                                        : "border-[#e2edf2] bg-[#f8fafc]/70 opacity-75 hover:opacity-100 hover:border-slate-300"
                                      }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3.5 min-w-0">
                                        <div
                                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-xs"
                                          style={{
                                            backgroundColor: `${module.color || "#0d9488"}1a`,
                                            color: module.color || "#0d9488",
                                            border: `1px solid ${module.color || "#0d9488"}33`,
                                          }}
                                        >
                                          <ModuleIcon size={20} strokeWidth={2.2} />
                                        </div>

                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <h4 className="truncate text-xs sm:text-sm font-bold text-[#0f172a]">
                                              {module.title}
                                            </h4>
                                            {module.backendId && (
                                              <span className="font-mono text-[9px] text-[#0d9488] bg-[#e6f7f5] px-1.5 py-0.5 rounded">
                                                #{module.backendId}
                                              </span>
                                            )}
                                          </div>

                                          {module.route && (
                                            <div className="mt-1">
                                              <span className="font-mono text-[10px] font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md border border-[#e2edf2]">
                                                {module.route}
                                              </span>
                                            </div>
                                          )}
                                          <p className="mt-2 text-xs text-[#64748b] line-clamp-2 leading-relaxed">
                                            {module.description}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isEnabled}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePage(module.id);
                                        }}
                                        title={isEnabled ? "Disable page access" : "Enable page access"}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 ${isEnabled ? "bg-[#0d9488]" : "bg-slate-300"
                                          }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isEnabled ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                      </button>
                                    </div>

                                    {/* Card Footer Bar */}
                                    <div className="mt-3.5 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
                                      <span className="text-[11px] font-semibold text-[#64748b] group-hover:text-[#0d9488] transition-colors flex items-center gap-1">
                                        Configure Rights
                                        <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                                      </span>

                                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditPageModal(module);
                                          }}
                                          title="Edit page"
                                          className="inline-flex items-center gap-1 rounded-lg border border-[#e2edf2] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#64748b] transition hover:border-[#0d9488] hover:bg-[#e6f7f5] hover:text-[#0d9488] shadow-2xs"
                                        >
                                          <Pencil size={11} />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDeletePageModal(module);
                                          }}
                                          title="Delete page"
                                          className="inline-flex items-center gap-1 rounded-lg border border-[#e2edf2] bg-white px-2 py-0.5 text-[11px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 shadow-2xs"
                                        >
                                          <Trash2 size={11} />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : moduleData.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center">
                              <LayoutDashboard size={36} className="mx-auto mb-3 text-[#94a3b8]" />
                              <h4 className="text-sm font-bold text-[#0f172a]">No pages available</h4>
                              <p className="mt-1 text-xs text-[#64748b] max-w-sm mx-auto">
                                There are currently no LMS pages configured in the database. Click the button below to create your first page.
                              </p>
                              <button
                                type="button"
                                onClick={() => openCreatePageModal(selectedCategory)}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0d9488] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0f766e] transition"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                                <span>Create Page</span>
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center">
                              <Search size={30} className="mx-auto mb-2 text-[#94a3b8]" />
                              <h4 className="text-sm font-bold text-[#0f172a]">No pages found</h4>
                              <p className="mt-1 text-xs text-[#64748b]">
                                No pages matched your search criteria in "{selectedCategory}".
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

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
                          disabled={isSavingPermissions || !currentUserAccess.canEdit}
                          onClick={handleSaveChanges}
                          title={!currentUserAccess.canEdit ? "Restricted by your user permissions" : "Save Changes"}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488] hover:shadow-md hover:shadow-[#0d9488]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                          {isSavingPermissions ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} strokeWidth={2.5} />
                          )}
                          <span>{isSavingPermissions ? "Saving Changes..." : "Save & Apply Changes"}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            )}

            {/* TAB 2: USER ROLE ASSIGNMENTS WORKSPACE */}
            {workspaceTab === "users" && (
              <div className="flex flex-col rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
                {/* Panel Header */}
                <div className="border-b border-[#f1f5f9] p-5 lg:p-6 bg-gradient-to-b from-[#f8fafc]/90 via-white to-white">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0d9488] border border-teal-200 shadow-xs">
                        <Users size={24} strokeWidth={2.3} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                            User Role Assignments & Permissions
                          </h2>
                          <span className="rounded-full bg-[#e6f7f5] px-2.5 py-0.5 text-xs font-bold text-[#0d9488] border border-[#0d9488]/20">
                            {usersList.length} Total Users
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#64748b] leading-relaxed max-w-2xl">
                          Assign organizational role profiles to personnel and inspect active page access privileges and action permissions.
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={loadUsers}
                        disabled={loadingUsers}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3.5 py-2 text-xs font-bold text-[#64748b] shadow-xs transition hover:bg-[#f8fafc] hover:text-[#0f172a] disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={loadingUsers ? "animate-spin text-[#0d9488]" : ""} />
                        <span>{loadingUsers ? "Refreshing..." : "Refresh Users"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, pay code, card no..."
                        className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] pl-9 pr-8 text-xs text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                      />
                      {userSearch && (
                        <button
                          onClick={() => setUserSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Filter by Role */}
                    <div className="relative">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 pr-8 text-xs font-medium text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15 cursor-pointer"
                      >
                        <option value="all">Filter by Role: All Roles</option>
                        <option value="unassigned">-- Unassigned Users --</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            Role: {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Department */}
                    <div className="relative">
                      <select
                        value={userDeptFilter}
                        onChange={(e) => setUserDeptFilter(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 pr-8 text-xs font-medium text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15 cursor-pointer"
                      >
                        <option value="all">Filter by Department: All</option>
                        {userDepartmentOptions.map((d) => (
                          <option key={d} value={d}>
                            Dept: {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  {loadingUsers && usersList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Loader2 size={32} className="animate-spin text-[#0d9488] mb-3" />
                      <h3 className="text-sm font-bold text-[#0f172a]">Loading user records...</h3>
                      <p className="mt-1 text-xs text-[#64748b]">Fetching users from /api/v1/lms/users</p>
                    </div>
                  ) : usersError ? (
                    <div className="py-12 px-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
                        <AlertCircle size={22} />
                      </div>
                      <h4 className="text-sm font-bold text-rose-700">Failed to load user directory</h4>
                      <p className="mt-1 text-xs text-[#64748b] max-w-md mx-auto">{usersError}</p>
                      <button
                        type="button"
                        onClick={loadUsers}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0d9488] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0f766e] transition"
                      >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8fafc] text-[#94a3b8] border border-[#e2edf2]">
                        <Users size={22} />
                      </div>
                      <h4 className="text-sm font-bold text-[#0f172a]">No users found</h4>
                      <p className="mt-1 text-xs text-[#64748b]">
                        No personnel matched the current search and filter criteria.
                      </p>
                      {(userSearch || userRoleFilter !== "all" || userDeptFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserSearch("");
                            setUserRoleFilter("all");
                            setUserDeptFilter("all");
                          }}
                          className="mt-3 text-xs font-bold text-[#0d9488] hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#e2edf2] bg-[#f8fafc]/90 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                          <th className="py-3 px-4">User Identity</th>
                          <th className="py-3 px-4">Department / Unit</th>
                          <th className="py-3 px-4 min-w-[240px]">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck size={13} className="text-[#0d9488]" />
                              <span>Assigned Role</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Privileges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {filteredUsers.map((user) => {
                          const currentAssigned =
                            userRoleAssignments[user.id] ??
                            user.roleId ??
                            user.role_id ??
                            (typeof user.role === "object" ? user.role?.id : user.role) ??
                            "";
                          const isUpdatingThisUser = assigningUserId === user.id;
                          const activeRoleObj = roles.find(
                            (r) =>
                              String(r.id) === String(currentAssigned) ||
                              (currentAssigned && r.name && r.name.toLowerCase() === String(currentAssigned).toLowerCase())
                          );
                          const displayName = user.empName || user.name || "Personnel #" + user.id;
                          const initials =
                            displayName
                              .split(" ")
                              .filter(Boolean)
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase() || "U";

                          return (
                            <tr
                              key={user.id}
                              className="group transition-colors hover:bg-[#f8fafc]/80"
                            >
                              {/* User Identity */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-xs"
                                    style={{
                                      backgroundColor: `${activeRoleObj?.color || "#0d9488"}1a`,
                                      color: activeRoleObj?.color || "#0d9488",
                                      border: `1px solid ${activeRoleObj?.color || "#0d9488"}33`,
                                    }}
                                  >
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#0f172a] truncate max-w-[200px]">
                                      {displayName}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                                      {user.payCode && (
                                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                                          {user.payCode}
                                        </span>
                                      )}
                                      {user.cardNo && <span>Card: {user.cardNo}</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Department */}
                              <td className="py-3.5 px-4">
                                <div className="min-w-0">
                                  <span className="inline-flex items-center rounded-md bg-[#e6f7f5] px-2 py-0.5 text-[11px] font-semibold text-[#0d9488]">
                                    {user.department || user.departmentName || "General Operations"}
                                  </span>
                                  {(user.subDepartment || user.line) && (
                                    <div className="mt-1 text-[10px] text-[#64748b] truncate max-w-[160px]">
                                      {[user.subDepartment, user.line].filter(Boolean).join(" • ")}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Role Selector Dropdown */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <select
                                      id={`assign-role-select-${user.id}`}
                                      disabled={isUpdatingThisUser || !currentUserAccess.canAssignRole}
                                      value={activeRoleObj ? activeRoleObj.id : ""}
                                      onChange={(e) => handleAssignUserRole(user, e.target.value)}
                                      className={`h-9 w-full rounded-xl border text-xs font-semibold pl-3 pr-8 transition focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15 cursor-pointer ${
                                        activeRoleObj
                                          ? "border-[#0d9488]/40 bg-teal-50/40 text-[#0f172a]"
                                          : "border-[#e2edf2] bg-white text-slate-500"
                                      } ${
                                        !currentUserAccess.canAssignRole
                                          ? "opacity-60 cursor-not-allowed bg-slate-100"
                                          : ""
                                      }`}
                                    >
                                      <option value="">-- No Role Assigned --</option>
                                      {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {isUpdatingThisUser ? (
                                    <div
                                      className="flex h-8 w-8 shrink-0 items-center justify-center text-[#0d9488]"
                                      title="Updating user role on server..."
                                    >
                                      <Loader2 size={16} className="animate-spin" />
                                    </div>
                                  ) : activeRoleObj ? (
                                    <div
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-xs"
                                      style={{
                                        backgroundColor: `${activeRoleObj.color || "#0d9488"}20`,
                                        color: activeRoleObj.color || "#0d9488",
                                      }}
                                      title={`Assigned: ${activeRoleObj.name}`}
                                    >
                                      <Check size={14} strokeWidth={2.5} />
                                    </div>
                                  ) : null}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                    user.active !== false && user.status !== "Inactive"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-slate-100 text-slate-600 border border-slate-200"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      user.active !== false && user.status !== "Inactive"
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  {user.active !== false && user.status !== "Inactive" ? "Active" : "Inactive"}
                                </span>
                              </td>

                              {/* Actions / Inspect Permissions */}
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleInspectUserPermissions(user)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#0d9488]/30 bg-[#e6f7f5]/80 px-3 py-1.5 text-xs font-bold text-[#0d9488] shadow-xs transition hover:bg-[#0d9488] hover:text-white"
                                  title="Inspect user effective permissions (GET /api/v1/lms/users/{user_id}/permissions)"
                                >
                                  <Eye size={13} strokeWidth={2.2} />
                                  <span>Inspect Rights</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Table Footer */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-[#f1f5f9] bg-[#f8fafc]/90 px-5 py-3.5">
                  <div className="text-xs text-[#64748b]">
                    Showing <span className="font-bold text-[#0f172a]">{filteredUsers.length}</span> of{" "}
                    <span className="font-bold text-[#0f172a]">{usersList.length}</span> total users
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Selecting a role from dropdown directly triggers{" "}
                    <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#0d9488]">
                      PUT /api/v1/lms/users/{`{user_id}`}/role
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE NEW ROLE */}
      {/* ========================================================= */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-2xl overflow-hidden">
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
                type="button"
                onClick={() => setShowNewRoleModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createRole} className="p-5 space-y-4">
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

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Status
                </label>
                <select
                  value={newRoleStatus ? "Active" : "Inactive"}
                  onChange={(e) => setNewRoleStatus(e.target.value === "Active")}
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

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
                  disabled={isSubmittingRole}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488] disabled:opacity-50"
                >
                  {isSubmittingRole && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmittingRole ? "Creating..." : "Create Role Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ========================================================= */}
      {/* MODAL 3: DELETE ROLE */}
      {/* ========================================================= */}
      {showDeleteRoleModal && roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl md:rounded-3xl border border-rose-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-rose-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200 shadow-xs">
                  <Trash2 size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Delete Role Profile
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Confirm permanent role removal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteRoleModal(false);
                  setRoleToDelete(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#0f172a]">"{roleToDelete.name}"</span>?
                All permissions and user assignments linked to this role will be permanently revoked.
              </p>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  disabled={isDeletingRole}
                  onClick={() => {
                    setShowDeleteRoleModal(false);
                    setRoleToDelete(null);
                  }}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingRole}
                  onClick={() => handleDeleteRole(roleToDelete.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/30 transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isDeletingRole && <Loader2 size={13} className="animate-spin" />}
                  <span>{isDeletingRole ? "Deleting..." : "Delete Role"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CREATE NEW PAGE (POST /api/v1/lms/pages) */}
      {/* ========================================================= */}
      {showCreatePageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-[#f8fafc] to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7f5] text-[#0d9488] border border-[#0d9488]/20 shadow-xs">
                  <Plus size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Create New LMS Page
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Registers page dynamically with <code className="bg-[#f1f5f9] px-1 rounded font-mono">POST /api/v1/lms/pages</code>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreatePageModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Module Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createPageCategory}
                  onChange={(e) => setCreatePageCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="LMS">LMS (Learning Management System)</option>
                  <option value="CMS">CMS (Content Management System)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Page Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageKey) {
                      setNewPageKey(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Skill Matrix, Attendance Tracker..."
                  autoFocus
                  required
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Page Key / Slug
                </label>
                <input
                  type="text"
                  value={newPageKey}
                  onChange={(e) => setNewPageKey(e.target.value)}
                  placeholder="e.g. skill-matrix"
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 text-xs sm:text-sm font-mono text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  Route: /{createPageCategory.toLowerCase()}/{newPageKey || "slug"}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Active Status
                </label>
                <select
                  value={newPageStatus ? "true" : "false"}
                  onChange={(e) => setNewPageStatus(e.target.value === "true")}
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePageModal(false)}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPage}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488] disabled:opacity-50"
                >
                  {isSubmittingPage && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmittingPage ? "Creating Page..." : "Create Page"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT PAGE (PUT /api/v1/lms/pages/{page_id}) */}
      {/* ========================================================= */}
      {showEditPageModal && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-[#f8fafc] to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7f5] text-[#0d9488] border border-[#0d9488]/20 shadow-xs">
                  <Pencil size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Edit LMS Page
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Update configuration for <span className="font-semibold text-[#0d9488]">{editingPage.title}</span> {editingPage.backendId ? `(#${editingPage.backendId})` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditPageModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdatePage} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Module Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editPageCategory}
                  onChange={(e) => setEditPageCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="LMS">LMS (Learning Management System)</option>
                  <option value="CMS">CMS (Content Management System)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Page Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editPageTitle}
                  onChange={(e) => setEditPageTitle(e.target.value)}
                  placeholder="e.g. Attendance Tracker, Skill Matrix..."
                  autoFocus
                  required
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Page Key / Slug
                </label>
                <input
                  type="text"
                  value={editPageKey}
                  onChange={(e) => setEditPageKey(e.target.value)}
                  placeholder="e.g. attendance-tracker"
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 text-xs sm:text-sm font-mono text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0f172a]">
                  Active Status
                </label>
                <select
                  value={editPageStatus ? "true" : "false"}
                  onChange={(e) => setEditPageStatus(e.target.value === "true")}
                  className="h-10 w-full rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 text-xs sm:text-sm text-[#0f172a] transition focus:border-[#0d9488] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/15"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditPageModal(false)}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPage}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-[#0d9488]/30 transition hover:from-[#0f766e] hover:to-[#0d9488] disabled:opacity-50"
                >
                  {isSubmittingPage && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmittingPage ? "Saving Changes..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: DELETE PAGE (DELETE /api/v1/lms/pages/{page_id}) */}
      {/* ========================================================= */}
      {showDeletePageModal && deleteTargetPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl md:rounded-3xl border border-rose-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-rose-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200 shadow-xs">
                  <Trash2 size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Delete LMS Page
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Confirm permanent deletion of page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeletePageModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                Are you sure you want to delete the LMS page{" "}
                <strong className="text-[#0f172a]">"{deleteTargetPage.title}"</strong>?
              </p>

              <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-xs"
                  style={{
                    backgroundColor: `${deleteTargetPage.color || "#0d9488"}1a`,
                    color: deleteTargetPage.color || "#0d9488",
                  }}
                >
                  {(() => {
                    const TargetIcon = deleteTargetPage.icon || LayoutDashboard;
                    return <TargetIcon size={18} strokeWidth={2.2} />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0f172a] truncate">
                    {deleteTargetPage.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#64748b] truncate">
                    {deleteTargetPage.route} • {normalizeCategory(deleteTargetPage.category)}
                    {deleteTargetPage.backendId ? ` • ID: #${deleteTargetPage.backendId}` : ""}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-rose-600 font-medium">
                This action calls <code className="font-mono bg-rose-50 px-1 py-0.5 rounded">DELETE /api/v1/lms/pages/{deleteTargetPage.backendId || deleteTargetPage.id}</code> and removes its permissions across all roles.
              </p>

              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  disabled={isDeletingPage}
                  onClick={() => setShowDeletePageModal(false)}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingPage}
                  onClick={handleDeletePage}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/30 transition hover:from-rose-700 hover:to-rose-600 disabled:opacity-50"
                >
                  {isDeletingPage && <Loader2 size={13} className="animate-spin" />}
                  <span>{isDeletingPage ? "Deleting Page..." : "Delete Page"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: REVOKE PAGE PRIVILEGES FROM ROLE */}
      {/* (DELETE /api/v1/lms/roles/{role_id}/permissions/{page_id}) */}
      {/* ========================================================= */}
      {showRevokeModal && pageToRevoke && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl md:rounded-3xl border border-rose-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-rose-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200 shadow-xs">
                  <Lock size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                    Revoke Page Privileges
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Role: {selectedRole.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRevokeModal(false);
                  setPageToRevoke(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Are you sure you want to revoke all access and privileges for{" "}
                <span className="font-bold text-[#0f172a]">"{pageToRevoke.title}"</span> from the role{" "}
                <span className="font-bold text-[#0d9488]">"{selectedRole.name}"</span>?
              </p>

              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-[11px] text-rose-700 font-mono">
                DELETE /api/v1/lms/roles/{selectedRole.id}/permissions/{pageToRevoke.backendId || pageToRevoke.id}
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  disabled={revokingPageId === pageToRevoke.id}
                  onClick={() => {
                    setShowRevokeModal(false);
                    setPageToRevoke(null);
                  }}
                  className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={revokingPageId === pageToRevoke.id}
                  onClick={() => handleDeletePagePermission(pageToRevoke)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/30 transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {revokingPageId === pageToRevoke.id && <Loader2 size={13} className="animate-spin" />}
                  <span>{revokingPageId === pageToRevoke.id ? "Revoking Privileges..." : "Revoke Permissions"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: INSPECT USER PERMISSIONS */}
      {/* (GET /api/v1/lms/users/{user_id}/permissions) */}
      {/* ========================================================= */}
      {showUserPermsModal && selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f1f5f9] p-5 bg-gradient-to-b from-[#f8fafc] to-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0d9488] border border-teal-200 shadow-xs font-bold text-sm">
                  {(selectedUserForPerms.empName || selectedUserForPerms.name || "U")
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0f172a] truncate">
                      {selectedUserForPerms.empName || selectedUserForPerms.name || "User Permissions"}
                    </h3>
                    <span className="font-mono text-[10px] font-semibold text-[#0d9488] bg-[#e6f7f5] px-2 py-0.5 rounded-md border border-[#0d9488]/20">
                      User #{selectedUserForPerms.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] truncate">
                    {selectedUserForPerms.department || "General"} • Pay Code: {selectedUserForPerms.payCode || "N/A"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowUserPermsModal(false);
                  setSelectedUserForPerms(null);
                  setUserPermsData(null);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {/* User Identity KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">Assigned Role</span>
                  <div className="mt-1 text-xs font-bold text-[#0f172a] truncate">
                    {(() => {
                      const rId =
                        userRoleAssignments[selectedUserForPerms.id] ??
                        selectedUserForPerms.roleId ??
                        selectedUserForPerms.role_id ??
                        selectedUserForPerms.role;
                      const rObj = roles.find((r) => String(r.id) === String(rId) || r.name === rId);
                      return rObj?.name || (typeof rId === "string" ? rId : "None");
                    })()}
                  </div>
                </div>

                <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">Department</span>
                  <div className="mt-1 text-xs font-bold text-[#0f172a] truncate">
                    {selectedUserForPerms.department || "General"}
                  </div>
                </div>

                <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">Status</span>
                  <div className="mt-1 text-xs font-bold text-emerald-600">
                    {selectedUserForPerms.active !== false ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">Endpoint</span>
                  <div className="mt-1 text-[11px] font-mono text-[#0d9488] truncate" title={`GET /api/v1/lms/users/${selectedUserForPerms.id}/permissions`}>
                    GET .../permissions
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loadingUserPerms && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 size={32} className="animate-spin text-[#0d9488] mb-3" />
                  <h4 className="text-sm font-bold text-[#0f172a]">Loading user permissions...</h4>
                  <p className="mt-1 text-xs text-[#64748b]">
                    Fetching from <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/api/v1/lms/users/{selectedUserForPerms.id}/permissions</code>
                  </p>
                </div>
              )}

              {/* Error State */}
              {!loadingUserPerms && userPermsError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle size={16} className="text-rose-600" />
                    <span>Failed to fetch user permissions</span>
                  </div>
                  <p>{userPermsError}</p>
                  <button
                    type="button"
                    onClick={() => handleInspectUserPermissions(selectedUserForPerms)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                  >
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Permissions Display */}
              {!loadingUserPerms && !userPermsError && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#0d9488]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                        Effective Page Privileges & Access
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Computed permissions for this identity
                    </span>
                  </div>

                  {(() => {
                    let pageList = [];
                    if (Array.isArray(userPermsData)) {
                      pageList = userPermsData;
                    } else if (Array.isArray(userPermsData?.permissions)) {
                      pageList = userPermsData.permissions;
                    } else if (Array.isArray(userPermsData?.pages)) {
                      pageList = userPermsData.pages;
                    } else if (userPermsData && typeof userPermsData === "object") {
                      const entries = Object.entries(userPermsData);
                      if (entries.length > 0 && typeof entries[0][1] === "object") {
                        pageList = entries.map(([k, v]) => ({ pageId: k, permissions: v }));
                      }
                    }

                    if (!pageList || pageList.length === 0) {
                      const assignedRoleId =
                        userRoleAssignments[selectedUserForPerms.id] ??
                        selectedUserForPerms.roleId ??
                        selectedUserForPerms.role_id;
                      const roleSetting = assignedRoleId ? roleSettings[assignedRoleId] : null;

                      return (
                        <div className="space-y-3">
                          <div className="rounded-xl border border-teal-200 bg-[#e6f7f5]/50 p-4 text-xs text-[#0f766e]">
                            <div className="flex items-center gap-2 font-bold text-[#0d9488]">
                              <CheckCircle2 size={16} />
                              <span>Inherited Role Permissions Active</span>
                            </div>
                            <p className="mt-1 leading-relaxed">
                              This user inherits all standard permissions from their assigned role. No explicit user-level permission overrides are stored.
                            </p>
                          </div>

                          <div className="space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin">
                            {moduleData.map((mod) => {
                              const isGranted = roleSetting?.pageAccess ? !!roleSetting.pageAccess[mod.id] : true;
                              const pPerms = roleSetting?.pagePermissions?.[mod.id] || defaultPermissions;

                              return (
                                <div
                                  key={mod.id}
                                  className={`flex items-center justify-between rounded-xl border p-3 ${
                                    isGranted
                                      ? "border-[#e2edf2] bg-white shadow-xs"
                                      : "border-slate-100 bg-slate-50/50 opacity-60"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-[#0f172a]">{mod.title}</span>
                                      <span className="rounded bg-[#e6f7f5] px-1.5 py-0.5 text-[9px] font-bold text-[#0d9488]">
                                        {normalizeCategory(mod.category)}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-[#64748b]">{mod.route}</div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {permissionActions.map((act) => {
                                      const allowed = isGranted && !!pPerms[act];
                                      return (
                                        <span
                                          key={act}
                                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                            allowed
                                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                              : "bg-slate-100 text-slate-400 line-through"
                                          }`}
                                        >
                                          {act}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                        {pageList.map((item, idx) => {
                          const pageTitle =
                            item.title ||
                            item.name ||
                            item.pageName ||
                            item.pageKey ||
                            `Page #${item.pageId || idx + 1}`;
                          const perms = item.permissions || item.actions || [];
                          const isPermArray = Array.isArray(perms);

                          return (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[#e2edf2] bg-white p-3 shadow-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-[#0f172a] truncate">{pageTitle}</div>
                                {item.route && (
                                  <div className="text-[10px] font-mono text-[#64748b]">{item.route}</div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1">
                                {permissionActions.map((act) => {
                                  const isAllowed = isPermArray
                                    ? perms.some((p) => String(p).toLowerCase() === act.toLowerCase())
                                    : Boolean(perms[act]);

                                  return (
                                    <span
                                      key={act}
                                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                        isAllowed
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                          : "bg-slate-100 text-slate-400 line-through"
                                      }`}
                                    >
                                      {act}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  setShowUserPermsModal(false);
                  setSelectedUserForPerms(null);
                  setUserPermsData(null);
                }}
                className="rounded-xl border border-[#e2edf2] bg-white px-4 py-2 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
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
