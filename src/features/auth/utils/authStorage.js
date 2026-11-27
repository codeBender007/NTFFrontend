const TOKEN_KEY = "token";
const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";
const LOGGED_IN_KEY = "isLoggedIn";
const EMPLOYEE_SESSION_KEY = "employee_session";

const INVALID_TOKENS = new Set([
  "",
  "null",
  "undefined",
  "false",
  "true",
  "nan",
  "[object object]",
]);

/**
 * Persist the session returned by POST /api/auth/login
 */
export const saveSession = (authData = {}) => {
  if (!authData || typeof authData !== "object") return;
  const data = authData.data || authData;
  const jwt = data.access_token || data.token || data.accessToken || data.jwt;
  const user = data.user || data.userInfo || data.userData;

  if (jwt && typeof jwt === "string") {
    const cleanJwt = jwt.trim();
    if (!INVALID_TOKENS.has(cleanJwt.toLowerCase())) {
      localStorage.setItem(TOKEN_KEY, cleanJwt);
      localStorage.setItem(ACCESS_TOKEN_KEY, cleanJwt);
    }
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  localStorage.removeItem(EMPLOYEE_SESSION_KEY);
  localStorage.removeItem("supervisor_session");
  localStorage.setItem(LOGGED_IN_KEY, "true");
};

/**
 * Retrieve the JWT token from localStorage or sessionStorage with fallback keys
 */
export const getToken = () => {
  try {
    let raw =
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem("accessToken") ||
      null;

    if (!raw) {
      const userRaw =
        localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      if (userRaw && userRaw !== "undefined" && userRaw !== "null") {
        try {
          const userObj = JSON.parse(userRaw);
          raw =
            userObj?.token ||
            userObj?.access_token ||
            userObj?.accessToken ||
            userObj?.jwt ||
            null;
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (!raw) return null;

    let token = String(raw).trim();
    if (token.startsWith('"') && token.endsWith('"')) {
      try {
        token = JSON.parse(token);
      } catch {
        token = token.slice(1, -1).trim();
      }
    }

    // Guard against literal falsy or non-token strings
    if (!token || INVALID_TOKENS.has(token.toLowerCase()) || token.length < 10) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
};

/**
 * Parse and verify whether a JWT has expired.
 * Returns true if expired or invalid.
 */
export const isTokenExpired = (token = getToken()) => {
  if (!token || typeof token !== "string") return true;

  if (localStorage.getItem(EMPLOYEE_SESSION_KEY) === "true") {
    return false;
  }

  try {
    const parts = token.split(".");
    // A valid JWT must consist of 3 parts (header.payload.signature)
    if (parts.length !== 3) {
      return true;
    }

    const base64Url = parts[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload || typeof payload !== "object") {
      return true;
    }

    if (payload.exp && typeof payload.exp === "number") {
      // 5-second skew buffer
      return Date.now() >= payload.exp * 1000 - 5000;
    }

    return false;

  } catch {
    // Parsing, decoding, or JSON error indicates a corrupt/invalid token
    return true;
  }
};

export const getUser = () => {
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_KEY);
    if (raw && raw !== "undefined" && raw !== "null") {
      try {
        return JSON.parse(raw);
      } catch {
        // Fallback to token payload
      }
    }

    const token = getToken();
    if (token && typeof token === "string") {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        if (payload?.user) return payload.user;
        if (payload?.sub || payload?.username || payload?.email) {
          return {
            id: payload.id || payload.sub,
            username: payload.username,
            email: payload.email,
            role: payload.role,
            empName: payload.empName,
            payCode: payload.payCode,
          };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearSession();
    return false;
  }
  return true;
};

/**
 * Check if the active session belongs to an Employee / Operator
 */
export const isEmployee = () => {
  if (localStorage.getItem(EMPLOYEE_SESSION_KEY) === "true") return true;
  const user = getUser();
  if (!user) return false;
  const role = String(user.role || "").trim().toUpperCase();
  return role === "OPERATOR" || role === "EMPLOYEE" || user.isEmployee === true;
};

/**
 * Persist live Operator session fetched from backend Users API
 */
export const saveEmployeeSession = (employeeData = {}) => {
  const user = {
    ...employeeData,
    role: employeeData.role || "OPERATOR",
    isEmployee: true,
  };

  const sessionToken = `emp_hdr.${btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify({
          id: user.id ?? null,
          role: "OPERATOR",
          sub: user.email || user.payCode || user.username || "operator",
          empName: user.empName || user.name || "",
          payCode: user.payCode || user.paycode || "",
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        })
      )
    )
  )}.emp_sig`;

  localStorage.setItem(TOKEN_KEY, sessionToken);
  localStorage.setItem(ACCESS_TOKEN_KEY, sessionToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(LOGGED_IN_KEY, "true");
  localStorage.setItem(EMPLOYEE_SESSION_KEY, "true");
  localStorage.removeItem("supervisor_session");
};

/**
 * Check if the active session belongs to a Supervisor authenticated via /api/auth/login
 */
export const isSupervisor = () => {
  const user = getUser();
  if (!user) return false;
  if (user.isSupervisor === true) return true;
  const role = String(user.role || "").trim().toUpperCase();
  const roleType = String(user.roleType || "").trim().toUpperCase();
  const designation = String(user.designation || "").trim().toLowerCase();
  return (
    role === "SUPERVISOR" ||
    roleType === "SUPERVISOR" ||
    designation === "supervisor"
  );
};

/**
 * Clear all session data on logout or when the token becomes invalid
 */
export const clearSession = () => {
  const keys = [
    TOKEN_KEY,
    ACCESS_TOKEN_KEY,
    "accessToken",
    "jwt",
    "authToken",
    USER_KEY,
    LOGGED_IN_KEY,
    EMPLOYEE_SESSION_KEY,
    "supervisor_session",
  ];

  try {
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch {
    // Ignore storage clearing exceptions
  }
};
