import { createLogger } from "./logger";

const logger = createLogger("API");
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sclms-contract-project-production.up.railway.app/api/";

// Helper — read CSRF token from cookies (for non-admin endpoints only)
const getCsrfToken = () => {
  const name = "XSRF-TOKEN=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }
  return "";
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // Normalize endpoint to avoid leading-slash bugs
  const cleanEndpoint = endpoint.replace(/^\//, "");

  const method = options.method || "GET";

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Attach JWT if available
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ==============================
  // CSRF — apply ONLY to non-admin APIs
  // ==============================
  const isAdminEndpoint = cleanEndpoint.startsWith("admin/");

  if (method !== "GET" && !isAdminEndpoint) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
  }

  // ==============================
  // Fire request
  // ==============================
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

  // ==============================
  // Error Handling
  // ==============================
  if (!response.ok) {
    // ---------- 403 ----------
    if (response.status === 403) {
      let text = "";
      try {
        text = await response.text();
      } catch {}

      const isJwtFailure =
        text?.toLowerCase().includes("jwt") ||
        text?.toLowerCase().includes("expired") ||
        text?.toLowerCase().includes("signature") ||
        text?.toLowerCase().includes("invalid token");

      if (token && isJwtFailure) {
        logger.error(
          `JWT invalid/expired for ${cleanEndpoint}. Logging out.`
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }

      logger.error(
        `Access denied → ${cleanEndpoint}. Status: 403, Message: ${
          text || "No message"
        }`
      );
      throw new Error(
        text || "Access denied. You don't have permission for this resource."
      );
    }

    // ---------- 401 ----------
    if (response.status === 401) {
      const message = await response.text();
      logger.apiError(
        `Unauthorized → ${cleanEndpoint}. Message: ${
          message || "No message"
        }`
      );
      throw new Error(message || "Unauthorized request");
    }

    // ---------- Other Errors ----------
    const message = await response.text();
    logger.apiError(
      `API error → ${cleanEndpoint}. Status: ${
        response.status
      }, Message: ${message || "No message"}`
    );
    throw new Error(message || `HTTP error ${response.status}`);
  }

  // ==============================
  // Parse JSON Safely
  // ==============================
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// =================================
// Convenience API Helpers
// =================================
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: (endpoint, data) =>
    apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (endpoint) =>
    apiRequest(endpoint, { method: "DELETE" }),

  // Notifications
  getMyNotifications: () => apiRequest("notifications/my"),
  getUnreadCount: () => apiRequest("notifications/unread/count"),

  // Secure File Download
  downloadFile: async (endpoint, filename = null) => {
    const token = localStorage.getItem("token");
    const cleanEndpoint = endpoint.replace(/^\//, "");

    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Open File in New Tab
  openFile: async (endpoint) => {
    const token = localStorage.getItem("token");
    const cleanEndpoint = endpoint.replace(/^\//, "");

    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Failed to load file: ${response.status}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  },
};

// Notifications API
export const notificationAPI = {
  getMyNotifications: () => apiRequest("notifications/my"),
  markAsRead: (id) =>
    apiRequest(`notifications/read/${id}`, { method: "PATCH" }),
  markAllRead: () => apiRequest("notifications/read-all", { method: "PATCH" }),
  getUnreadCount: () => apiRequest("notifications/unread/count"),
};
