import {
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  YES_NO_OPTIONS,
  USER_COLUMNS,
  USER_DATE_KEYS,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  hasUserShape,
  SEED_EMPLOYEES,
} from "./userSchema";

export {
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  YES_NO_OPTIONS,
  USER_COLUMNS,
  USER_DATE_KEYS,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  hasUserShape,
};

export const OPERATORS_STORAGE_KEY = "lms_operators_v2";

export const SEED_OPERATORS = SEED_EMPLOYEES;

export const loadOperators = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(OPERATORS_STORAGE_KEY));

    if (hasUserShape(stored)) return stored;

    localStorage.removeItem("lms_operators");

    return SEED_OPERATORS;
  } catch {
    return SEED_OPERATORS;
  }
};

export const createId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

export const unique = (list) => [...new Set(list.filter(Boolean))];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDate = (value) => {
  if (!value) return "-";

  const cleanStr = String(value).trim().split("T")[0];

  const partsDash = cleanStr.split("-");
  if (partsDash.length === 3 && partsDash[0].length === 4) {
    const [year, month, day] = partsDash;
    const monthName = MONTHS[Number(month) - 1];
    if (monthName && !isNaN(Number(day))) {
      return `${Number(day)} ${monthName} ${year}`;
    }
  }

  const partsSlash = cleanStr.split(/[-/]/);
  if (partsSlash.length === 3 && partsSlash[2].length === 4) {
    const [day, month, year] = partsSlash;
    const monthName = MONTHS[Number(month) - 1];
    if (monthName && !isNaN(Number(day))) {
      return `${Number(day)} ${monthName} ${year}`;
    }
  }

  return cleanStr;
};

export const getOperatorDepartmentOptions = (operators) =>
  unique([
    ...operators.map((operator) => operator.department),
    "Production",
    "Quality",
    "HR",
    "Admin",
  ]);

const toIsoDateString = (val) => {
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

export const filterOperators = (
  operators,
  {
    search = "",
    department = "",
    subDepartment = "",
    line = "",
    machine = "",
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

  return operators.filter((operator) => {
    const text = USER_COLUMNS.map((column) => operator[column.key])
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesText = !query || text.includes(query);
    const matchesDepartment =
      !department ||
      operator.department === department ||
      operator.departmentName === department ||
      String(operator.departmentId) === String(department);
    const matchesSubDepartment =
      !subDepartment ||
      operator.subDepartment === subDepartment ||
      operator.subDepartmentName === subDepartment ||
      String(operator.subDepartmentId) === String(subDepartment);
    const matchesLine =
      !line ||
      operator.line === line ||
      operator.lineName === line ||
      String(operator.lineId) === String(line);
    const matchesMachine =
      !machine ||
      operator.machine === machine ||
      operator.machineName === machine ||
      String(operator.machineId) === String(machine);

    let matchesDate = true;
    if (effectiveStart || effectiveEnd) {
      const opDateStr = toIsoDateString(
        operator.joiningDate || operator.dateOfJoin || operator.date || operator.createdAt
      );
      if (opDateStr) {
        if (effectiveStart && opDateStr < effectiveStart) matchesDate = false;
        if (effectiveEnd && opDateStr > effectiveEnd) matchesDate = false;
      }
    }

    return (
      matchesText &&
      matchesDepartment &&
      matchesSubDepartment &&
      matchesLine &&
      matchesMachine &&
      matchesDate
    );
  });
};