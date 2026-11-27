import UserApi from "@/features/lms/services/UserApi.js";
import { SEED_EMPLOYEES } from "@/features/lms/utils/userSchema.js";

const SUBMISSIONS_KEY = "ntf_employee_paper_submissions";
const JOINING_DATE_KEY = "ntf_employee_joining_date";
const STORAGE_RESET_VERSION_KEY = "ntf_submissions_reset_version";
const CURRENT_RESET_VERSION = "demo_reset_v3";

// One-time automatic reset of previous submissions for demo
if (typeof window !== "undefined") {
  try {
    const appliedVer = localStorage.getItem(STORAGE_RESET_VERSION_KEY);
    if (appliedVer !== CURRENT_RESET_VERSION) {
      Object.keys(localStorage).forEach((k) => {
        if (
          k.startsWith("ntf_employee_paper_submissions") ||
          k.startsWith("ntf_training_schedule_")
        ) {
          localStorage.removeItem(k);
        }
      });
      // Ensure joining date is set to today so Day 1 is active on demo start
      const todayIso = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`${JOINING_DATE_KEY}_emp123@gmail.com`, todayIso);
      localStorage.setItem(STORAGE_RESET_VERSION_KEY, CURRENT_RESET_VERSION);
    }
  } catch (err) {
    console.warn("Storage reset check warning:", err);
  }
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
 * Calculate the employee's current training day relative to their joining date.
 * Day 1 = Today is the joining date (diff = 0 days)
 * Day 2 = Today is 1 day after joining date (diff = 1 day)
 */
export function getTrainingDayNumber(joiningDateInput) {
  const joiningDate = parseDate(joiningDateInput);
  if (!joiningDate) return null;

  const today = new Date();
  const d1 = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1;
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
 * Retrieve the logged-in employee's joining date from:
 * 1. Admin Users API (if matching email/paycode found)
 * 2. User profile from session / localStorage
 * 3. Fallback / testing default (today's date)
 */
export async function fetchEmployeeJoiningDate(user) {
  const userEmail = (user?.email || "").toLowerCase();
  const userPayCode = String(user?.payCode || user?.paycode || user?.employeeId || "").trim();
  const userName = String(user?.empName || user?.name || user?.username || "").trim().toLowerCase();

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
        (userPayCode && String(u.payCode || u.paycode).trim() === userPayCode) ||
        (userName && String(u.empName || u.name).trim().toLowerCase() === userName) ||
        (userEmail && u.email && u.email.toLowerCase() === userEmail)
    );
    if (matched && (matched.dateOfJoining || matched.joiningDate)) {
      const d = matched.dateOfJoining || matched.joiningDate;
      if (userEmail) localStorage.setItem(`${JOINING_DATE_KEY}_${userEmail}`, d);
      return d;
    }
  } catch (err) {
    console.warn("Could not query UserApi for joining date", err?.message);
  }

  // 2. Check current session user object
  if (user?.joiningDate || user?.dateOfJoining) {
    const d = user.joiningDate || user.dateOfJoining;
    if (userEmail) localStorage.setItem(`${JOINING_DATE_KEY}_${userEmail}`, d);
    return d;
  }

  // 3. Check local override/cache
  if (userEmail) {
    const cachedDate = localStorage.getItem(`${JOINING_DATE_KEY}_${userEmail}`);
    if (cachedDate) {
      return cachedDate;
    }
  }

  // 4. Check SEED_EMPLOYEES from userSchema
  const seedMatched = SEED_EMPLOYEES.find(
    (u) =>
      (userPayCode && String(u.payCode).trim() === userPayCode) ||
      (userName && String(u.empName).trim().toLowerCase() === userName) ||
      (userEmail && u.email && u.email.toLowerCase() === userEmail)
  );
  if (seedMatched && (seedMatched.joiningDate || seedMatched.dateOfJoining)) {
    const d = seedMatched.joiningDate || seedMatched.dateOfJoining;
    if (userEmail) localStorage.setItem(`${JOINING_DATE_KEY}_${userEmail}`, d);
    return d;
  }

  // 5. Default fallback to today's date so Day 1 is active on initial test
  const todayIso = new Date().toISOString().slice(0, 10);
  if (userEmail) localStorage.setItem(`${JOINING_DATE_KEY}_${userEmail}`, todayIso);
  return todayIso;
}

/**
 * Manually update joining date for testing Day 1 / Day 2 transitions
 */
export function setEmployeeJoiningDate(userEmail, dateStr) {
  const email = (userEmail || "emp123@gmail.com").toLowerCase();
  localStorage.setItem(`${JOINING_DATE_KEY}_${email}`, dateStr);
}

/**
 * Get all submitted question papers for the employee
 */
export function getSubmittedPapers(userEmail = "emp123@gmail.com") {
  try {
    const email = (userEmail || "emp123@gmail.com").toLowerCase();
    const raw = localStorage.getItem(`${SUBMISSIONS_KEY}_${email}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save a question paper submission (moves paper from Upcoming to Past)
 */
export function savePaperSubmission(paperKey, answers, userEmail = "emp123@gmail.com") {
  try {
    const email = (userEmail || "emp123@gmail.com").toLowerCase();
    const current = getSubmittedPapers(email);
    current[paperKey] = {
      submitted: true,
      submittedAt: new Date().toLocaleString(),
      answers,
      paperKey,
      title: paperKey === "day1" ? "Day 1 Question Paper" : "Day 2 Question Paper",
    };
    localStorage.setItem(`${SUBMISSIONS_KEY}_${email}`, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error("Failed to save submission", err);
    return {};
  }
}

/**
 * Check if a paper has already been submitted
 */
export function isPaperSubmitted(paperKey, userEmail = "emp123@gmail.com") {
  const current = getSubmittedPapers(userEmail);
  return Boolean(current[paperKey]?.submitted);
}

/**
 * Reset all paper submissions and restore pre-submission state for demo
 */
export function resetPaperSubmissions(userEmail = "emp123@gmail.com") {
  try {
    const email = (userEmail || "emp123@gmail.com").toLowerCase();
    localStorage.removeItem(`${SUBMISSIONS_KEY}_${email}`);
    localStorage.removeItem(SUBMISSIONS_KEY);
    Object.keys(localStorage).forEach((k) => {
      if (
        k.startsWith(`${SUBMISSIONS_KEY}_${email}`) ||
        k.startsWith(`ntf_training_schedule_${email}`) ||
        k === `${SUBMISSIONS_KEY}_${email}`
      ) {
        localStorage.removeItem(k);
      }
    });
    // Reset joining date to today so Day 1 is active on demo start
    const todayIso = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`${JOINING_DATE_KEY}_${email}`, todayIso);
    return true;
  } catch (err) {
    console.error("Failed to reset submissions", err);
    return false;
  }
}
