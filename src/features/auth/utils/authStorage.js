const TOKEN_KEY = "token";
const USER_KEY = "user";
const LOGGED_IN_KEY = "isLoggedIn";

// Persist the session returned by POST /api/auth/login
export const saveSession = ({ access_token, token, user } = {}) => {
  const jwt = access_token || token;
  if (jwt) {
    localStorage.setItem(TOKEN_KEY, jwt);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  localStorage.setItem(LOGGED_IN_KEY, "true");
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getToken());

// Clear all session data on logout or when the token becomes invalid
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGGED_IN_KEY);
};
