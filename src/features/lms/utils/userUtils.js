import { unique } from "./operatorUtils";
import { SEED_EMPLOYEES, USER_COLUMNS } from "./userSchema";

export { createId } from "./operatorUtils";

export {
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  YES_NO_OPTIONS,
  STATUS_OPTIONS,
  USER_DATE_KEYS,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  hasUserShape,
} from "./userSchema";

export { SEED_EMPLOYEES, USER_COLUMNS };

export const toDateInputValue = (val) => {
  if (!val) return "";
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
  const parts = str.split(/[-/]/);
  if (parts.length === 3 && parts[2].length === 4) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return str;
};

export const getUserDepartmentOptions = (users) =>
  unique([
    ...users.map((user) => user.department),
    "Production",
    "Quality",
    "HR",
    "Admin",
  ]);

export const getUserMachineOptions = (users) =>
  unique([
    ...users.map((user) => user.machine),
    "M/C 01",
    "M/C 02",
    "M/C 03",
    "M/C 04",
  ]);

const REMOVED_SHIFTS = new Set([
  "shifta",
  "shift a",
  "shiftb",
  "shift b",
  "shiftc",
  "shift c",
  "general",
]);

export const normalizeShiftValue = (s) => {
  if (!s) return "";
  const trimmed = String(s).trim().toLowerCase();
  if (trimmed === "shift a" || trimmed === "shifta" || trimmed === "a") return "a";
  if (trimmed === "shift b" || trimmed === "shiftb" || trimmed === "b") return "b";
  if (trimmed === "shift c" || trimmed === "shiftc" || trimmed === "c") return "c";
  if (trimmed === "general" || trimmed === "gen") return "gen";
  return trimmed;
};

export const getUserShiftOptions = (users) => {
  const fromUsers = (users || [])
    .map((user) => user.shift)
    .filter((s) => s && !REMOVED_SHIFTS.has(String(s).trim().toLowerCase()));
  return unique(["A", "B", "GEN", ...fromUsers]);
};

export const isUserInactive = (user) => {
  if (!user) return false;
  if (
    user.active === false ||
    user.is_active === false ||
    user.active === 0 ||
    user.is_active === 0
  ) {
    return true;
  }
  const statusStr = String(user.status || "").trim().toLowerCase();
  return statusStr === "inactive" || statusStr === "deactivated";
};

export const getUserDisplayStatus = (user) => {
  if (isUserInactive(user)) return "Inactive";
  const statusStr = String(user.status || "").trim().toLowerCase();
  if (statusStr === "active") return "Active";
  if (user.status === "Left" || (user.leavingDate && !user.status)) return "Left";
  return "Active";
};

export const filterUsers = (
  users,
  {
    search = "",
    department = "",
    subDepartment = "",
    line = "",
    machine = "",
    shift = "",
    startDate = "",
    endDate = "",
    fromDate = "",
    toDate = "",
    date = "",
  } = {},
) => {
  const query = search.toLowerCase();
  const effectiveStart = startDate || fromDate || (date && date.includes(" to ") ? date.split(" to ")[0] : date);
  const effectiveEnd = endDate || toDate || (date && date.includes(" to ") ? date.split(" to ")[1] : date);

  return users.filter((user) => {
    const isInactive = isUserInactive(user);
    const text = [
      ...USER_COLUMNS.map((column) => user[column.key]),
      user.status,
      isInactive ? "inactive deactivated" : "active",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesText = !query || text.includes(query);
    const matchesDepartment =
      !department ||
      user.department === department ||
      user.departmentName === department ||
      String(user.departmentId) === String(department);
    const matchesSubDepartment =
      !subDepartment ||
      user.subDepartment === subDepartment ||
      user.subDepartmentName === subDepartment ||
      String(user.subDepartmentId) === String(subDepartment);
    const matchesLine =
      !line ||
      user.line === line ||
      user.lineName === line ||
      String(user.lineId) === String(line);
    const matchesMachine =
      !machine ||
      user.machine === machine ||
      user.machineName === machine ||
      String(user.machineId) === String(machine);
    const matchesShift =
      !shift ||
      user.shift === shift ||
      normalizeShiftValue(user.shift) === normalizeShiftValue(shift);

    let matchesDate = true;
    if (effectiveStart || effectiveEnd) {
      const userDateStr = toDateInputValue(
        user.joiningDate || user.dateOfJoin || user.date || user.createdAt
      );
      if (userDateStr) {
        if (effectiveStart && userDateStr < effectiveStart) matchesDate = false;
        if (effectiveEnd && userDateStr > effectiveEnd) matchesDate = false;
      }
    }

    return (
      matchesText &&
      matchesDepartment &&
      matchesSubDepartment &&
      matchesLine &&
      matchesMachine &&
      matchesShift &&
      matchesDate
    );
  });
};

/* =========================================================================
   ROLE ASSIGNMENT -> LMS USERS DESIGNATION SYNCHRONIZATION HELPERS
   ========================================================================= */

export const USER_ROLE_DESIGNATIONS_KEY = "ntf_user_role_designations";

export const getRoleDesignationOverrides = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USER_ROLE_DESIGNATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveRoleDesignationOverride = (user, roleName, roleId) => {
  if (typeof window === "undefined" || !user) return {};
  try {
    const overrides = getRoleDesignationOverrides();
    const cleanRoleName = String(roleName || "").trim();
    const entry = {
      userId: user.id != null ? String(user.id) : null,
      payCode: user.payCode ? String(user.payCode).trim() : null,
      email: user.email ? String(user.email).trim().toLowerCase() : null,
      name: (user.empName || user.name || "").trim(),
      roleId: roleId != null ? String(roleId) : null,
      roleName: cleanRoleName,
      designation: cleanRoleName,
      updatedAt: new Date().toISOString(),
    };

    if (entry.userId) {
      overrides[`id_${entry.userId}`] = entry;
      overrides[entry.userId] = entry;
    }
    if (entry.payCode) {
      overrides[`payCode_${entry.payCode}`] = entry;
      overrides[entry.payCode] = entry;
    }
    if (entry.email) {
      overrides[`email_${entry.email}`] = entry;
      overrides[entry.email] = entry;
    }
    if (entry.name) {
      overrides[`name_${entry.name.toLowerCase()}`] = entry;
    }

    localStorage.setItem(USER_ROLE_DESIGNATIONS_KEY, JSON.stringify(overrides));

    // Dispatch event for instant sync to LMS Users table without needing page reload
    window.dispatchEvent(
      new CustomEvent("ntf:user-role-updated", {
        detail: entry,
      })
    );

    return overrides;
  } catch (err) {
    console.warn("Could not save role designation override:", err);
    return {};
  }
};

/* =========================================================================
   GENERAL USER EDITS PERSISTENCE & SYNCHRONIZATION HELPERS
   ========================================================================= */

export const USER_LOCAL_OVERRIDES_KEY = "ntf_user_local_overrides";

export const getUserLocalOverrides = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USER_LOCAL_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveUserLocalOverride = (user) => {
  if (typeof window === "undefined" || !user) return {};
  try {
    const overrides = getUserLocalOverrides();
    const uId = user.id != null ? String(user.id) : null;
    const uPayCode = user.payCode ? String(user.payCode).trim() : null;
    const uEmail = user.email ? String(user.email).trim().toLowerCase() : null;
    const uName = (user.empName || user.name || "").trim().toLowerCase();

    const entry = {
      ...user,
      updatedAt: new Date().toISOString(),
    };

    if (uId) {
      overrides[`id_${uId}`] = entry;
      overrides[uId] = entry;
    }
    if (uPayCode) {
      overrides[`payCode_${uPayCode}`] = entry;
      overrides[uPayCode] = entry;
    }
    if (uEmail) {
      overrides[`email_${uEmail}`] = entry;
    }
    if (uName) {
      overrides[`name_${uName}`] = entry;
    }

    localStorage.setItem(USER_LOCAL_OVERRIDES_KEY, JSON.stringify(overrides));
    return overrides;
  } catch (err) {
    console.warn("Could not save user local override:", err);
    return {};
  }
};

export const applyUserLocalOverrides = (usersList = []) => {
  if (!Array.isArray(usersList) || usersList.length === 0) return usersList;
  const overrides = getUserLocalOverrides();
  if (!overrides || Object.keys(overrides).length === 0) return usersList;

  return usersList.map((user) => {
    const uId = user.id != null ? String(user.id) : "";
    const uPayCode = user.payCode ? String(user.payCode).trim() : "";
    const uEmail = user.email ? String(user.email).trim().toLowerCase() : "";
    const uName = (user.empName || user.name || "").trim().toLowerCase();

    const override =
      (uId && (overrides[`id_${uId}`] || overrides[uId])) ||
      (uPayCode && (overrides[`payCode_${uPayCode}`] || overrides[uPayCode])) ||
      (uEmail && overrides[`email_${uEmail}`]) ||
      (uName && overrides[`name_${uName}`]);

    if (!override) return user;

    return {
      ...user,
      ...override,
      id: user.id ?? override.id,
      sno: user.sno || override.sno,
    };
  });
};

export const applyRoleDesignationOverrides = (usersList = []) => {
  if (!Array.isArray(usersList) || usersList.length === 0) return usersList;
  
  // First apply general user local overrides (empName, payCode, joiningDate, etc.)
  const withUserOverrides = applyUserLocalOverrides(usersList);
  
  const overrides = getRoleDesignationOverrides();
  if (!overrides || Object.keys(overrides).length === 0) return withUserOverrides;

  return withUserOverrides.map((user) => {
    const uId = user.id != null ? String(user.id) : "";
    const uPayCode = user.payCode ? String(user.payCode).trim() : "";
    const uEmail = user.email ? String(user.email).trim().toLowerCase() : "";
    const uName = (user.empName || user.name || "").trim().toLowerCase();

    const match =
      (uId && (overrides[`id_${uId}`] || overrides[uId])) ||
      (uPayCode && (overrides[`payCode_${uPayCode}`] || overrides[uPayCode])) ||
      (uEmail && (overrides[`email_${uEmail}`] || overrides[uEmail])) ||
      (uName && overrides[`name_${uName}`]);

    if (!match) return user;

    const newDesignation = typeof match === "object" ? match.designation || match.roleName : match;
    const newRoleId = typeof match === "object" ? match.roleId : null;
    const newRoleName = typeof match === "object" ? match.roleName : match;

    if (!newDesignation) return user;

    return {
      ...user,
      designation: newDesignation,
      ...(newRoleId ? { roleId: newRoleId, role_id: newRoleId } : {}),
      ...(newRoleName ? { role: newRoleName, roleName: newRoleName } : {}),
    };
  });
};