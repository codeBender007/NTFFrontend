import { unique } from "./operatorUtils";
import { SEED_EMPLOYEES, USER_COLUMNS } from "./userSchema";

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
    const text = [
      ...USER_COLUMNS.map((column) => user[column.key]),
      user.status,
      user.active === false ? "inactive deactivated" : "active",
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