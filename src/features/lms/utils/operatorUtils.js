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

export const filterOperators = (
  operators,
  { search = "", department = "" } = {},
) => {
  const query = search.toLowerCase();

  return operators.filter((operator) => {
    const text = USER_COLUMNS.map((column) => operator[column.key])
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesText = !query || text.includes(query);
    const matchesDepartment = !department || operator.department === department;

    return matchesText && matchesDepartment;
  });
};