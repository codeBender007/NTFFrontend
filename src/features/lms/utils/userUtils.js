import { unique } from "./operatorUtils";
import { SEED_EMPLOYEES, USER_COLUMNS, hasUserShape } from "./userSchema";

export { createId } from "./operatorUtils";

export {
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  YES_NO_OPTIONS,
  USER_DATE_KEYS,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  hasUserShape,
} from "./userSchema";

export { SEED_EMPLOYEES, USER_COLUMNS };

export const USERS_STORAGE_KEY = "lms_users_v2";

export const SEED_USERS = SEED_EMPLOYEES;

export const loadUsers = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));

    if (hasUserShape(stored)) return stored;

    localStorage.removeItem("lms_users");

    return SEED_USERS;
  } catch {
    return SEED_USERS;
  }
};

export const getUserDepartmentOptions = (users) =>
  unique([
    ...users.map((user) => user.department),
    "Production",
    "Quality",
    "HR",
    "Admin",
  ]);

export const filterUsers = (users, { search = "", department = "" } = {}) => {
  const query = search.toLowerCase();

  return users.filter((user) => {
    const text = USER_COLUMNS.map((column) => user[column.key])
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesText = !query || text.includes(query);
    const matchesDepartment = !department || user.department === department;

    return matchesText && matchesDepartment;
  });
};