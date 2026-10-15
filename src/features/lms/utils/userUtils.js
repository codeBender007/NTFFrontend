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

export const getUserShiftOptions = (users) =>
  unique([
    ...users.map((user) => user.shift),
    "Shift A",
    "Shift B",
    "Shift C",
  ]);

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
  } = {},
) => {
  const query = search.toLowerCase();

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
    const matchesDepartment = !department || user.department === department;
    const matchesSubDepartment =
      !subDepartment || user.subDepartment === subDepartment;
    const matchesLine = !line || user.line === line;
    const matchesMachine = !machine || user.machine === machine;
    const matchesShift = !shift || user.shift === shift;

    return (
      matchesText &&
      matchesDepartment &&
      matchesSubDepartment &&
      matchesLine &&
      matchesMachine &&
      matchesShift
    );
  });
};