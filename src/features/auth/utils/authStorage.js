const TOKEN_KEY = "token";
const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";
const LOGGED_IN_KEY = "isLoggedIn";

/**
 * Persist the session returned by POST /api/auth/login
 */
export const saveSession = ({ access_token, token, user } = {}) => {
  const jwt = access_token || token;
  if (jwt) {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  localStorage.setItem(LOGGED_IN_KEY, "true");
};

/**
 * Retrieve the JWT token from localStorage or sessionStorage with fallback keys
 */
export const getToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Parse and verify whether a JWT has expired
 */
export const isTokenExpired = (token = getToken()) => {
  if (!token || typeof token !== "string") return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    if (payload.exp && typeof payload.exp === "number") {
      // 5-second skew buffer
      return Date.now() >= payload.exp * 1000 - 5000;
    }
    return false;
  } catch {
    return false;
  }
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
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
 * Clear all session data on logout or when the token becomes invalid
 */
export const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOGGED_IN_KEY);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(LOGGED_IN_KEY);
  } catch {
    // Ignore storage clearing exceptions
  }
};
