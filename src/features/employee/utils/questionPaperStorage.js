import UserApi from "@/features/lms/services/UserApi.js";
import { SEED_EMPLOYEES } from "@/features/lms/utils/userSchema.js";
import {
  getUserLocalOverrides,
  applyUserLocalOverrides,
} from "@/features/lms/utils/userUtils.js";

const SUBMISSIONS_KEY = "ntf_employee_paper_submissions";
const JOINING_DATE_KEY = "ntf_employee_joining_date";

/**
 * Returns a stable, isolated storage key for any given employee object or identifier.
 * Ensures data isolation across different logged-in employees.
 */
export function getEmployeeStorageKey(userOrIdentifier) {
  if (!userOrIdentifier) return "default_employee";

  if (typeof userOrIdentifier === "object") {
    // 1. PayCode is the primary unique identifier for employees in the Users table
    const payCode = String(
      userOrIdentifier.payCode ||
      userOrIdentifier.paycode ||
      userOrIdentifier.employeeId ||
      ""
    ).trim();
    if (payCode) return `paycode_${payCode.toLowerCase()}`;

    // 2. Database User ID
    const id = userOrIdentifier.id != null ? String(userOrIdentifier.id).trim() : "";
    if (id && id !== "undefined" && id !== "null") return `id_${id.toLowerCase()}`;

    // 3. Email (if present and not generic fallback)
    const email = String(userOrIdentifier.email || "").trim().toLowerCase();
    if (email && email !== "emp123@gmail.com") return `email_${email}`;

    // 4. Username / Employee Name
    const name = String(
      userOrIdentifier.username ||
      userOrIdentifier.empName ||
      userOrIdentifier.name ||
      ""
    ).trim().toLowerCase();
    if (name) return `name_${name.replace(/\s+/g, "_")}`;

    if (email) return `email_${email}`;
    return "default_employee";
  }

  const str = String(userOrIdentifier).trim();
  if (!str) return "default_employee";
  if (
    str.startsWith("paycode_") ||
    str.startsWith("id_") ||
    str.startsWith("email_") ||
    str.startsWith("name_")
  ) {
    return str.toLowerCase();
  }
  if (str.includes("@")) {
    return `email_${str.toLowerCase()}`;
  }
  return `paycode_${str.toLowerCase()}`;
}

/**
 * Parse various date formats (DD/MM/YYYY, YYYY-MM-DD, ISO string) into a Date object
 */
export function parseDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput)) return dateInput;

  const str = String(dateInput).trim();
  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  // Format YYYY-MM-DD
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
 * Returns the exact difference in calendar days:
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
 * Day 1 = Today is the joining date (diff = 0)
 * Day 2 = Today is 1 day after joining date (diff = 1)
 */
export function getTrainingDayNumber(joiningDateInput) {
  const diff = getCalendarDayDifference(joiningDateInput);
  if (diff === null) return null;
  return diff + 1;
}

/**
 * Format date for clean display
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
 * Retrieve the logged-in employee's joining date strictly for that specific employee:
 * 1. Check local user overrides for edited joining dates
 * 2. Admin Users API (matching paycode / id / email / name)
 * 3. User profile from session / localStorage
 * 4. SEED_EMPLOYEES fallback
 * 5. Default fallback to today's date
 */
export async function fetchEmployeeJoiningDate(user) {
  const userKey = getEmployeeStorageKey(user);
  const userPayCode = String(user?.payCode || user?.paycode || user?.employeeId || "").trim();
  const userId = user?.id != null ? String(user.id).trim() : "";
  const userEmail = (user?.email || "").toLowerCase();
  const userName = String(user?.empName || user?.name || user?.username || "").trim().toLowerCase();

  // 1. Check persistent user local overrides first
  try {
    const localOverrides = getUserLocalOverrides();
    const matchOverride =
      (userPayCode && (localOverrides[`payCode_${userPayCode}`] || localOverrides[userPayCode])) ||
      (userId && (localOverrides[`id_${userId}`] || localOverrides[userId])) ||
      (userEmail && localOverrides[`email_${userEmail}`]) ||
      (userName && localOverrides[`name_${userName}`]);

    if (matchOverride && (matchOverride.dateOfJoining || matchOverride.joiningDate)) {
      const d = matchOverride.dateOfJoining || matchOverride.joiningDate;
      localStorage.setItem(`${JOINING_DATE_KEY}_${userKey}`, d);
      return d;
    }
  } catch (overrideErr) {
    console.warn("Could not inspect localOverrides for joiningDate:", overrideErr);
  }

  // 2. Try fetching latest user record from Admin Users API
  try {
    const res = await UserApi.getUsers({ limit: 1000 });
    const rawList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
    const usersList = applyUserLocalOverrides(rawList);

    const matched = usersList.find(
      (u) =>
        (userPayCode && String(u.payCode || u.paycode).trim().toLowerCase() === userPayCode.toLowerCase()) ||
        (userId && String(u.id).trim() === userId) ||
        (userEmail && u.email && u.email.toLowerCase() === userEmail) ||
        (userName && String(u.empName || u.name).trim().toLowerCase() === userName)
    );
    if (matched && (matched.dateOfJoining || matched.joiningDate)) {
      const d = matched.dateOfJoining || matched.joiningDate;
      localStorage.setItem(`${JOINING_DATE_KEY}_${userKey}`, d);
      return d;
    }
  } catch (err) {
    console.warn("Could not query UserApi for joining date", err?.message);
  }

  // 3. Check current session user object
  if (user?.joiningDate || user?.dateOfJoining) {
    const d = user.joiningDate || user.dateOfJoining;
    localStorage.setItem(`${JOINING_DATE_KEY}_${userKey}`, d);
    return d;
  }

  // 4. Check cached date under isolated key
  const cachedDate = localStorage.getItem(`${JOINING_DATE_KEY}_${userKey}`);
  if (cachedDate) {
    return cachedDate;
  }

  // 5. Check SEED_EMPLOYEES from userSchema
  const seedMatched = SEED_EMPLOYEES.find(
    (u) =>
      (userPayCode && String(u.payCode).trim().toLowerCase() === userPayCode.toLowerCase()) ||
      (userId && String(u.id).trim() === userId) ||
      (userEmail && u.email && u.email.toLowerCase() === userEmail) ||
      (userName && String(u.empName).trim().toLowerCase() === userName)
  );
  if (seedMatched && (seedMatched.joiningDate || seedMatched.dateOfJoining)) {
    const d = seedMatched.joiningDate || seedMatched.dateOfJoining;
    localStorage.setItem(`${JOINING_DATE_KEY}_${userKey}`, d);
    return d;
  }

  // 6. Default fallback to today's date
  const todayIso = new Date().toISOString().slice(0, 10);
  localStorage.setItem(`${JOINING_DATE_KEY}_${userKey}`, todayIso);
  return todayIso;
}

/**
 * Get all submitted question papers strictly for this specific employee
 */
export function getSubmittedPapers(userOrKey) {
  try {
    const userKey = getEmployeeStorageKey(userOrKey);
    const isolatedRaw = localStorage.getItem(`${SUBMISSIONS_KEY}_${userKey}`);
    if (isolatedRaw) {
      return JSON.parse(isolatedRaw);
    }

    // Fallback checks for legacy stored submissions
    if (typeof userOrKey === "object" && userOrKey) {
      if (userOrKey.email) {
        const legacyEmail = localStorage.getItem(`${SUBMISSIONS_KEY}_${userOrKey.email.toLowerCase()}`);
        if (legacyEmail) return JSON.parse(legacyEmail);
      }
      if (userOrKey.payCode) {
        const legacyPay = localStorage.getItem(`${SUBMISSIONS_KEY}_${userOrKey.payCode.toLowerCase()}`);
        if (legacyPay) return JSON.parse(legacyPay);
      }
    } else if (typeof userOrKey === "string" && userOrKey) {
      const direct = localStorage.getItem(`${SUBMISSIONS_KEY}_${userOrKey.toLowerCase()}`);
      if (direct) return JSON.parse(direct);
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * Save a question paper submission strictly for this specific employee
 */
export function savePaperSubmission(paperKey, answers, userOrKey) {
  try {
    const userKey = getEmployeeStorageKey(userOrKey);
    const current = getSubmittedPapers(userOrKey);
    current[paperKey] = {
      submitted: true,
      submittedAt: new Date().toLocaleString(),
      answers,
      paperKey,
      title: paperKey === "day1" ? "Day 1 Question Paper" : "Day 2 Question Paper",
    };

    localStorage.setItem(`${SUBMISSIONS_KEY}_${userKey}`, JSON.stringify(current));

    // Also sync to email key if user object has email for seamless dual lookup
    if (typeof userOrKey === "object" && userOrKey?.email) {
      localStorage.setItem(`${SUBMISSIONS_KEY}_${userOrKey.email.toLowerCase()}`, JSON.stringify(current));
    }

    return current;
  } catch (err) {
    console.error("Failed to save submission", err);
    return {};
  }
}

/**
 * Check if a paper has already been submitted by this employee
 */
export function isPaperSubmitted(paperKey, userOrKey) {
  const current = getSubmittedPapers(userOrKey);
  return Boolean(current[paperKey]?.submitted);
}
