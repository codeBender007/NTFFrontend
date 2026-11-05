const toBasePath = (base) => {
  if (!base || base === "/") return "";
  try {
    const path = new URL(base, "http://localhost").pathname.replace(/\/+$/, "");
    return path === "/" ? "" : path;
  } catch {
    return String(base).replace(/\/+$/, "");
  }
};

// Synchronizes router basename with Vite's base or explicit router base configuration
export const BASE_URL = toBasePath(
  import.meta.env.VITE_ROUTER_BASE || import.meta.env.BASE_URL || ""
);

export const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || "";
export const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "";
export const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default {
  BASE_URL,
  VITE_BASE_URL,
  VITE_API_BASE_URL,
  VITE_BACKEND_URL,
};
