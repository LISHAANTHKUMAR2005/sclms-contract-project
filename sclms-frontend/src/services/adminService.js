import { api, apiRequest } from "../utils/api";

export const adminService = {
  getAllUsers: async () => {
    return api.get("admin/users");
  },

  getPendingUsers: async () => {
    return api.get("admin/pending-users");
  },

  getUserById: async (id) => {
    return api.get(`admin/user/${id}`);
  },

  approveUser: async (id) => {
    return api.put(`admin/approve/${id}`);
  },

  rejectUser: async (id) => {
    return api.put(`admin/reject/${id}`);
  },

  // ✅ PROMOTE USER → APPROVER
  promoteToApprover: async (id) => {
    return api.put(`admin/change-role/${id}?role=APPROVER`);
  },

  // ✅ DEMOTE USER → USER
  demoteToUser: async (id) => {
    return api.put(`admin/demote/${id}`);
  },

  // ✅ CHANGE ROLE
  changeUserRole: async (id, role) => {
    return api.put(`admin/change-role/${id}?role=${role}`);
  },

  // ✅ DELETE USER
  deleteUser: async (id) => {
    return api.delete(`admin/delete/${id}`);
  },

  // ✅ SYSTEM SETTINGS
  getSystemSettings: async () => {
    return api.get("admin/system-settings");
  },

  updateSystemSettings: async (settings) => {
    return api.put("admin/system-settings", settings);
  },

  // ✅ REPORT GENERATION
  generateReport: async (reportRequest) => {
    return api.post("admin/generate-report", reportRequest);
  },

  getReportStatus: async (reportId) => {
    return api.get(`admin/report-status/${reportId}`);
  },

  // ✅ SYSTEM HEALTH CHECK
  getSystemHealth: async () => {
    return api.get("admin/system-health");
  },

  // ✅ RECENT LOGIN ACTIVITY
  getRecentLogins: async (limit = 50) => {
    return api.get(`admin/recent-logins?limit=${limit}`);
  },

  // ✅ EMAIL CONFIGURATION
  getEmailConfig: async () => {
    return api.get("admin/email-config");
  },

  updateEmailConfig: async (config) => {
    return api.put("admin/email-config", config);
  },

  // ✅ SEND TEST EMAIL
  sendTestEmail: async (toEmail) => {
    return api.post("admin/test-email", { toEmail });
  },

  // ✅ DATA MAINTENANCE
  performDataCleanup: async (options) => {
    return api.post("admin/maintenance/cleanup", options);
  },

  // ✅ RESET USER PASSWORD
  resetUserPassword: async (userId, passwordData) => {
    return api.patch(`admin/users/${userId}/reset-password`, passwordData);
  },

  // ✅ SEND NOTIFICATION TO USER
  sendNotification: async (userId, notification) => {
    return api.post(`admin/users/${userId}/notify`, notification);
  },

  // ✅ GET USER ACTIVITY LOG
  getUserActivity: async (userId, limit = 10) => {
    return api.get(`admin/users/${userId}/activity?limit=${limit}`);
  },

  // ✅ BULK USER OPERATIONS
  bulkUserOperation: async (operation, userIds) => {
    return api.post("admin/users/bulk", { operation, userIds });
  },

  // ✅ GET USER STATISTICS
  getUserStatistics: async () => {
    return api.get("admin/users/statistics");
  },

  // ✅ UPDATE USER NOTIFICATIONS
  updateUserNotifications: async (userId, notifications) => {
    return api.put(`users/${userId}/notifications`, notifications);
  },

  // ✅ SYSTEM SETTINGS APIS
  getGeneralSettings: async () => {
    return api.get("admin/settings/general");
  },

  updateGeneralSettings: async (settings) => {
    return api.put("admin/settings/general/update", settings);
  },

  getSecuritySettings: async () => {
    return api.get("admin/settings/security");
  },

  updateSecuritySettings: async (settings) => {
    return api.put("admin/settings/security/update", settings);
  },

  updatePasswordPolicy: async (settings) => {
    return api.put("admin/settings/password", settings);
  },

  updateTwoFactorSettings: async (settings) => {
    return api.put("admin/settings/2fa", settings);
  },

  getEmailSettings: async () => {
    return api.get("admin/settings/email");
  },

  updateEmailSettings: async (settings) => {
    return api.put("admin/settings/email/update", settings);
  },

  getNotificationSettings: async () => {
    return api.get("admin/settings/notifications");
  },

  updateNotificationSettings: async (settings) => {
    return api.put("admin/settings/notifications/update", settings);
  },

  getDatabaseSettings: async () => {
    return api.get("admin/settings/database");
  },

  updateDatabaseSettings: async (settings) => {
    return api.put("admin/settings/database/update", settings);
  },

  getUserSettings: async () => {
    return api.get("admin/settings/users/config");
  },

  updateUserSettings: async (settings) => {
    return api.put("admin/settings/users/config/update", settings);
  },

  getApiSettings: async () => {
    return api.get("admin/settings/api");
  },

  updateApiSettings: async (settings) => {
    return api.put("admin/settings/api/update", settings);
  },

  // ✅ ADMIN NOTIFICATIONS - Get pending users count and latest users
  getPendingUsersNotifications: async () => {
    return api.get("admin/notifications/pending-users");
  },

  // ✅ EXPORT USERS TO CSV
  exportUsers: async (filters = {}) => {
    return apiRequest(`admin/users/export?${new URLSearchParams(filters)}`);
  },
};
