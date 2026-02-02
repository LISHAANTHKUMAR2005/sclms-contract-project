import { createLogger } from "./logger";

const logger = createLogger("API");

/**
 * Base API URL
 * Priority:
 * 1. Vercel ENV
 * 2. Render fallback
 */
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://sclms-contract-project.onrender.com"
).replace(/\/+$/, ""); // remove trailing slash

// ==============================
// CSRF Token Helper
// ==============================
const getCsrfToken = () => {
  const name = "XSRF-TOKEN=";
  const decoded = decodeURIComponent(document.cookie);
  const cookies = decoded.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }

  return "";
};

// ==============================
// Core API Handler
// ==============================
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // Normalize endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, "");

  const method = options.method || "GET";

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Attach JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ==============================
  // CSRF (non-admin only)
  // ==============================
  const isAdmin = cleanEndpoint.startsWith("admin/");

  if (method !== "GET" && !isAdmin) {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers["X-XSRF-TOKEN"] = csrf;
    }
  }

  const url = `${API_BASE_URL}/${cleanEndpoint}`;

  logger.info(`Request → ${method} ${url}`);

  // ==============================
  // Send Request
  // ==============================
  const response = await fetch(url, config);

  // ==============================
  // Error Handling
  // ==============================
  if (!response.ok) {
    let text = "";

    try {
      text = await response.text();
    } catch {}

    // ---------- 403 ----------
    if (response.status === 403) {
      const isJwtError =
        text?.toLowerCase().includes("jwt") ||
        text?.toLowerCase().includes("expired") ||
        text?.toLowerCase().includes("invalid");

      if (token && isJwtError) {
        logger.error("JWT expired → Logging out");

        localStorage.clear();
        window.location.href = "/login";

        throw new Error("Session expired. Please login again.");
      }

      logger.error(`403 Forbidden → ${text}`);

      throw new Error(text || "Access denied");
    }

    // ---------- 401 ----------
    if (response.status === 401) {
      logger.error(`401 Unauthorized → ${text}`);

      throw new Error(text || "Unauthorized");
    }

    // ---------- Others ----------
    logger.error(
      `API Error → ${response.status} → ${text || "Unknown error"}`
    );

    throw new Error(text || `HTTP ${response.status}`);
  }

  // ==============================
  // JSON Parse
  // ==============================
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// ==============================
// API Shortcuts
// ==============================
export const api = {
  get: (url) => apiRequest(url),

  post: (url, data) =>
    apiRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (url, data) =>
    apiRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (url, data) =>
    apiRequest(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (url) =>
    apiRequest(url, {
      method: "DELETE",
    }),

  // ==============================
  // Notifications
  // ==============================
  getMyNotifications: () => apiRequest("notifications/my"),

  getUnreadCount: () =>
    apiRequest("notifications/unread/count"),

  // ==============================
  // File Download
  // ==============================
  downloadFile: async (endpoint, filename = "download") => {
    const token = localStorage.getItem("token");

    const clean = endpoint.replace(/^\/+/, "");

    const res = await fetch(`${API_BASE_URL}/${clean}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // ==============================
  // Open File
  // ==============================
  openFile: async (endpoint) => {
    const token = localStorage.getItem("token");

    const clean = endpoint.replace(/^\/+/, "");

    const res = await fetch(`${API_BASE_URL}/${clean}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("File load failed");

    const blob = await res.blob();

    window.open(URL.createObjectURL(blob), "_blank");
  },
};

// ==============================
// Notifications API
// ==============================
export const notificationAPI = {
  getMyNotifications: () =>
    apiRequest("notifications/my"),

  markAsRead: (id) =>
    apiRequest(`notifications/read/${id}`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    apiRequest("notifications/read-all", {
      method: "PATCH",
    }),

  getUnreadCount: () =>
    apiRequest("notifications/unread/count"),
};
