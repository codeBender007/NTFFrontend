import UserApi from "@/features/lms/services/UserApi.js";
import { SEED_EMPLOYEES } from "@/features/lms/utils/userSchema.js";

/**
 * Returns a stable identifier for any given employee object or string.
 */
export function getEmployeeStorageKey(userOrIdentifier) {
  if (!userOrIdentifier) return "default_employee";

  if (typeof userOrIdentifier === "object") {
    const payCode = String(
      userOrIdentifier.payCode ||
        userOrIdentifier.paycode ||
        userOrIdentifier.employeeId ||
        ""
    ).trim();
    if (payCode) return `paycode_${payCode.toLowerCase()}`;

    const id = userOrIdentifier.id != null ? String(userOrIdentifier.id).trim() : "";
    if (id && id !== "undefined" && id !== "null") return `id_${id.toLowerCase()}`;

    const email = String(userOrIdentifier.email || "").trim().toLowerCase();
    if (email && email !== "emp123@gmail.com") return `email_${email}`;

    const name = String(
      userOrIdentifier.username ||
        userOrIdentifier.empName ||
        userOrIdentifier.name ||
        ""
    )
      .trim()
      .toLowerCase();
    if (name) return `name_${name.replace(/\s+/g, "_")}`;

    if (email) return `email_${email}`;
    return "default_employee";
  }

  const str = String(userOrIdentifier).trim();
  if (!str) return "default_employee";
  return str.toLowerCase();
}

/**
 * Checks whether a backend QuestionPaperSubmission belongs to the logged-in employee.
 */
export function doesSubmissionBelongToEmployee(submission, user) {
  if (!submission || !user) return false;

  const userId =
    user.id != null && !Number.isNaN(Number(user.id)) ? Number(user.id) : null;
  if (userId !== null && submission.userId != null) {
    return Number(submission.userId) === userId;
  }

  const userPayCode = String(user.payCode || user.paycode || "").trim().toLowerCase();
  const subPayCode = String(submission.userPayCode || "").trim().toLowerCase();
  if (userPayCode && subPayCode) {
    return userPayCode === subPayCode;
  }

  const userEmail = String(user.email || "").trim().toLowerCase();
  const subEmail = String(submission.userEmail || "").trim().toLowerCase();
  if (userEmail && subEmail) {
    return userEmail === subEmail;
  }

  return true;
}

/**
 * Parse various date formats (DD/MM/YYYY, YYYY-MM-DD, ISO string) into a Date object.
 */
export function parseDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput)) return dateInput;

  const str = String(dateInput).trim();
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Normalizes a date into local midnight (year, month, date) ignoring time/timezones.
 */
export function normalizeCalendarDate(dateInput) {
  const d = parseDate(dateInput);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Compare calendar days between today's system date and the employee's joining date:
 * - 0 : Today is the EXACT same calendar day as joiningDate (Case 1: Day 1)
 * - 1 : Today is EXACTLY 1 day after joiningDate (Case 2: Day 2)
 * - > 1 : Joining date was earlier/in the past (Case 3: Day 3 or beyond)
 * - < 0 : Joining date is in the future
 */
export function getCalendarDayDifference(joiningDateInput) {
  const dJoining = normalizeCalendarDate(joiningDateInput);
  if (!dJoining) return null;

  const now = new Date();
  const dToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = dToday.getTime() - dJoining.getTime();
  return Math.round(diffTime / msPerDay);
}

/**
 * Calculate the employee's current training day relative to their joining date.
 */
export function getTrainingDayNumber(joiningDateInput) {
  const diff = getCalendarDayDifference(joiningDateInput);
  if (diff === null) return null;
  return diff + 1;
}

/**
 * Format date for clean display.
 */
export function formatDisplayDate(dateInput) {
  const d = parseDate(dateInput);
  if (!d) return "Not specified";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Retrieve the logged-in employee's joining date from backend Users API or active session
 * without using localStorage caching.
 */
export async function fetchEmployeeJoiningDate(user) {
  const userPayCode = String(
    user?.payCode || user?.paycode || user?.employeeId || ""
  ).trim();
  const userId = user?.id != null ? String(user.id).trim() : "";
  const userEmail = (user?.email || "").toLowerCase();
  const userName = String(
    user?.empName || user?.name || user?.username || ""
  )
    .trim()
    .toLowerCase();

  // 1. Try fetching latest user record from Admin Users API
  try {
    const res = await UserApi.getUsers({ limit: 1000 });
    const usersList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

    const matched = usersList.find(
      (u) =>
        (userPayCode &&
          String(u.payCode || u.paycode).trim().toLowerCase() ===
            userPayCode.toLowerCase()) ||
        (userId && String(u.id).trim() === userId) ||
        (userEmail && u.email && u.email.toLowerCase() === userEmail) ||
        (userName &&
          String(u.empName || u.name).trim().toLowerCase() === userName)
    );
    if (matched && (matched.dateOfJoining || matched.joiningDate)) {
      return matched.dateOfJoining || matched.joiningDate;
    }
  } catch (err) {
    console.warn("Could not query UserApi for joining date", err?.message);
  }

  // 2. Check current session user object
  if (user?.joiningDate || user?.dateOfJoining) {
    return user.joiningDate || user.dateOfJoining;
  }

  // 3. Check SEED_EMPLOYEES fallback
  const seedMatched = SEED_EMPLOYEES.find(
    (u) =>
      (userPayCode &&
        String(u.payCode).trim().toLowerCase() === userPayCode.toLowerCase()) ||
      (userId && String(u.id).trim() === userId) ||
      (userEmail && u.email && u.email.toLowerCase() === userEmail) ||
      (userName && String(u.empName || u.name).trim().toLowerCase() === userName)
  );
  if (seedMatched && (seedMatched.joiningDate || seedMatched.dateOfJoining)) {
    return seedMatched.joiningDate || seedMatched.dateOfJoining;
  }

  // 4. Default fallback to today's date
  return new Date().toISOString().slice(0, 10);
}
