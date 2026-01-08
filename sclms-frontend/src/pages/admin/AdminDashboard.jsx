import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { AuthContext } from "../../context/AuthContext";

// Debug mode flag - set to true for debugging, false for production
const DEBUG_MODE = false;
const safeLog = (...m) => DEBUG_MODE && console.log(...m);

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    autoApproveUsers: false
  });
  // eslint-disable-next-line no-unused-vars
  const [reportStatus, setReportStatus] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    safeLog('🔍 AdminDashboard - useEffect triggered');
    safeLog('🔍 AdminDashboard - User:', user);
    safeLog('🔍 AdminDashboard - User role:', user?.role);

    // Check if user is authenticated and has ADMIN role
    const token = localStorage.getItem('token');
    safeLog('🔍 AdminDashboard - Token exists:', !!token);

    if (user && user.role === 'ADMIN' && token) {
      safeLog('🔍 AdminDashboard - Loading dashboard data...');
      loadDashboardData();
    } else {
      safeLog('🔍 AdminDashboard - Not loading (user not admin or no token)');
      setLoading(false);
    }

    // Listen for sidebar events to open modals and perform actions
    const handleOpenSystemSettings = () => setShowSettingsModal(true);
    const handleOpenReportGenerator = () => setShowReportModal(true);
    const handleOpenEmailSettings = async () => {
      try {
        const config = await adminService.getEmailConfig();
        alert(`Current SMTP: ${config.smtpHost}:${config.smtpPort}\nFrom: ${config.fromEmail}`);
      } catch (error) {
        alert('Failed to load email configuration');
        console.error('Email config error:', error);
      }
    };
    const handleOpenDataMaintenance = async () => {
      if (window.confirm('This will perform data cleanup operations. Continue?')) {
        try {
          // eslint-disable-next-line no-unused-vars
          const result = await adminService.performDataCleanup({
            clearOldLogs: true,
            optimizeDatabase: true,
            clearTempFiles: true
          });
          alert('Data maintenance completed successfully!');
        } catch (error) {
          alert('Failed to perform data maintenance');
          console.error('Maintenance error:', error);
        }
      }
    };
    const handleOpenRecentActivity = async () => {
      try {
        const activity = await adminService.getRecentLogins(10);
        const activities = activity.activities || [];
        alert(`Recent Activities: ${activities.length} entries\nLast activity: ${activities[0]?.lastActivity || 'None'}`);
      } catch (error) {
        alert('Failed to load recent activity');
        console.error('Activity error:', error);
      }
    };

    window.addEventListener('openSystemSettings', handleOpenSystemSettings);
    window.addEventListener('openReportGenerator', handleOpenReportGenerator);
    window.addEventListener('openEmailSettings', handleOpenEmailSettings);
    window.addEventListener('openDataMaintenance', handleOpenDataMaintenance);
    window.addEventListener('openRecentActivity', handleOpenRecentActivity);

    return () => {
      window.removeEventListener('openSystemSettings', handleOpenSystemSettings);
      window.removeEventListener('openReportGenerator', handleOpenReportGenerator);
      window.removeEventListener('openEmailSettings', handleOpenEmailSettings);
      window.removeEventListener('openDataMaintenance', handleOpenDataMaintenance);
      window.removeEventListener('openRecentActivity', handleOpenRecentActivity);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [allUsers, pending] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getPendingUsers()
      ]);

      setUsers(allUsers);
      setPendingUsers(pending);

      // Generate recent activities (mock data for now - in real app this would come from backend)
      const activities = generateRecentActivities(allUsers, pending);
      setRecentActivities(activities);

    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (allUsers, pending) => {
    const activities = [];

    // Recent registrations
    const recentUsers = allUsers
      .filter(u => u.createdDate)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 5);

    recentUsers.forEach(user => {
      activities.push({
        id: `reg-${user.id}`,
        type: 'registration',
        message: `${user.name} registered from ${user.organization}`,
        time: user.createdDate,
        icon: '👤'
      });
    });

    // Pending approvals
    pending.slice(0, 3).forEach(user => {
      activities.push({
        id: `pending-${user.id}`,
        type: 'pending',
        message: `${user.name} is waiting for approval`,
        time: user.createdDate || new Date().toISOString(),
        icon: '⏳'
      });
    });

    // Sort by time (most recent first)
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
  };

  // Statistics
  const stats = {
    totalUsers: users.length,
    pendingApprovals: pendingUsers.length,
    approvedUsers: users.filter(u => u.status === "APPROVED").length,
    rejectedUsers: users.filter(u => u.status === "REJECTED").length,
    activeAdmins: users.filter(u => u.role === "ADMIN").length,
    activeApprovers: users.filter(u => u.role === "APPROVER").length,
    activeUsers: users.filter(u => u.role === "USER" && u.status === "APPROVED").length,
  };

  // Quick actions
  const quickActions = [
    {
      title: "Review Pending Users",
      description: `${stats.pendingApprovals} users waiting for approval`,
      action: () => navigate('/admin/approvals'),
      icon: '📋',
      color: 'warning'
    },
    {
      title: "Manage Users",
      description: "Full user management and role assignments",
      action: () => navigate('/admin/users'),
      icon: '👥',
      color: 'info'
    },
    {
      title: "System Health",
      description: "Check database and server status",
      action: async () => {
        try {
          const health = await adminService.getSystemHealth();
          alert(`System Status: ${health.status}\nDatabase: ${health.database.status}\nMemory Usage: ${health.memory.usagePercent}`);
        } catch (error) {
          alert('Failed to check system health');
          console.error('Health check error:', error);
        }
      },
      icon: '🩺',
      color: 'success'
    },
    {
      title: "Email Settings",
      description: "Configure SMTP and notifications",
      action: async () => {
        try {
          const config = await adminService.getEmailConfig();
          alert(`Current SMTP: ${config.smtpHost}:${config.smtpPort}\nFrom: ${config.fromEmail}`);
        } catch (error) {
          alert('Failed to load email configuration');
          console.error('Email config error:', error);
        }
      },
      icon: '📧',
      color: 'primary'
    },
    {
      title: "Data Maintenance",
      description: "Clean up old data and optimize system",
      action: async () => {
        if (window.confirm('This will perform data cleanup operations. Continue?')) {
          try {
            // eslint-disable-next-line no-unused-vars
            const result = await adminService.performDataCleanup({
              clearOldLogs: true,
              optimizeDatabase: true,
              clearTempFiles: true
            });
            alert('Data maintenance completed successfully!');
          } catch (error) {
            alert('Failed to perform data maintenance');
            console.error('Maintenance error:', error);
          }
        }
      },
      icon: '🧹',
      color: 'secondary'
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      action: async () => {
        try {
          const currentSettings = await adminService.getSystemSettings();
          setSettings(currentSettings);
          setShowSettingsModal(true);
        } catch (error) {
          console.error('Failed to load settings:', error);
          setShowSettingsModal(true); // Still show modal with default settings
        }
      },
      icon: '⚙️',
      color: 'secondary'
    },
    {
      title: "Generate Report",
      description: "Export user and activity reports",
      action: () => setShowReportModal(true),
      icon: '📊',
      color: 'success'
    },
    {
      title: "Recent Activity",
      description: "View recent user login activity",
      action: async () => {
        try {
          const activity = await adminService.getRecentLogins(10);
          const activities = activity.activities || [];
          alert(`Recent Activities: ${activities.length} entries\nLast activity: ${activities[0]?.lastActivity || 'None'}`);
        } catch (error) {
          alert('Failed to load recent activity');
          console.error('Activity error:', error);
        }
      },
      icon: '📈',
      color: 'info'
    }
  ];

  const handleSaveSettings = async () => {
    try {
      await adminService.updateSystemSettings(settings);
      alert('System settings saved successfully!');
      setShowSettingsModal(false);
    } catch (error) {
      alert('Failed to save system settings. Please try again.');
      console.error('Settings save error:', error);
    }
  };

  const handleGenerateReport = async () => {
    // Get selected values from radio buttons and inputs
    const reportType = document.querySelector('input[name="reportType"]:checked')?.value || 'User Activity Report';
    const format = document.querySelector('input[name="format"]:checked')?.value || 'pdf';
    const startDate = document.querySelector('input[name="startDate"]')?.value || null;
    const endDate = document.querySelector('input[name="endDate"]')?.value || null;

    const reportRequest = {
      reportType: reportType,
      format: format,
      startDate: startDate,
      endDate: endDate
    };

    try {
      setGeneratingReport(true);
      const response = await adminService.generateReport(reportRequest);

      if (response.reportId && response.status === 'COMPLETED') {
        alert(`Report generated successfully! Report ID: ${response.reportId}`);

        // Automatically trigger download
        setTimeout(() => {
          downloadReport(response.reportId, response.fileName || `${response.reportId}.txt`);
        }, 1000); // Small delay for user to see the success message

      } else {
        alert('Report generation failed. Please try again.');
      }
    } catch (error) {
      alert('Failed to generate report. Please try again.');
      console.error('Report generation error:', error);
    } finally {
      setGeneratingReport(false);
      setShowReportModal(false);
    }
  };

  const downloadReport = (reportId, fileName) => {
    try {
      // Create a temporary link to trigger download
      const downloadUrl = `http://localhost:8080/api/admin/download-report/${reportId}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || `${reportId}.txt`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Check authentication before rendering
  const token = localStorage.getItem('token');
  if (!user || user.role !== 'ADMIN' || !token) {
    return (
      <div className="admin-content full-width">
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="welcome-subtitle">
              Please login as an administrator to access this dashboard
            </p>
          </div>
          <div className="welcome-actions">
            <a href="/login" className="btn btn-primary">
              Login as Admin
            </a>
          </div>
        </div>
        <div className="auth-required-message">
          <div className="auth-icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>This dashboard requires administrator privileges.</p>
          <p>Please login with admin credentials to access user management and system statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content full-width">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="page-title">Welcome back, Administrator</h1>
          <p className="welcome-subtitle">
            Here's what's happening with your Contract Lifecycle Management System
          </p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
            <span className="metric-trend positive">+{stats.approvedUsers} active</span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
            <span className="metric-trend">Requires attention</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{stats.approvedUsers}</h3>
            <p>Approved Users</p>
            <span className="metric-trend positive">{Math.round((stats.approvedUsers / stats.totalUsers) * 100)}% approval rate</span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">🏢</div>
          <div className="metric-content">
            <h3>{[...new Set(users.map(u => u.organization))].length}</h3>
            <p>Organizations</p>
            <span className="metric-trend">Active partners</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Only Important Actions */}
      <div className="dashboard-main-grid">

        {/* Daily Operations - Most Used Features */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>🚀 Daily Operations</h2>
            <p>Most frequently used administrative tasks</p>
          </div>
          <div className="quick-actions-grid daily-ops-grid">
            {quickActions.filter(action => ['Review Pending Users', 'Manage Users', 'System Health'].includes(action.title)).map((action, index) => (
              <div
                key={index}
                className={`quick-action-card ${action.color} daily`}
                onClick={action.action}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </div>



        {/* Recent Activities & Role Distribution - Side by Side */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <p>Latest system events and user actions</p>
          </div>
          <div className="activities-list">
            {loading ? (
              <div className="loading-activities">
                <p>Loading recent activities...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{formatTimeAgo(activity.time)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No recent activities to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>User Roles Distribution</h2>
            <p>Current user role breakdown</p>
          </div>
          <div className="role-distribution">
            <div className="role-item">
              <div className="role-info">
                <span className="role-name">Administrators</span>
                <span className="role-count">{stats.activeAdmins}</span>
                <span className="role-percentage">
                  {stats.totalUsers > 0 ? Math.round((stats.activeAdmins / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="role-bar-container">
                <div className="role-bar">
                  <div
                    className="role-fill admin"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.activeAdmins / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="role-item">
              <div className="role-info">
                <span className="role-name">Approvers</span>
                <span className="role-count">{stats.activeApprovers}</span>
                <span className="role-percentage">
                  {stats.totalUsers > 0 ? Math.round((stats.activeApprovers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="role-bar-container">
                <div className="role-bar">
                  <div
                    className="role-fill approver"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.activeApprovers / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="role-item">
              <div className="role-info">
                <span className="role-name">Regular Users</span>
                <span className="role-count">{stats.activeUsers}</span>
                <span className="role-percentage">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="role-bar-container">
                <div className="role-bar">
                  <div
                    className="role-fill user"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* System Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>System Settings</h3>
              <button onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="settings-form">
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    />
                    Maintenance Mode
                  </label>
                  <p>Put the system in maintenance mode (users cannot access)</p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.registrationEnabled}
                      onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
                    />
                    User Registration Enabled
                  </label>
                  <p>Allow new users to register accounts</p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                    />
                    Email Notifications
                  </label>
                  <p>Send email notifications for approvals and updates</p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.autoApproveUsers}
                      onChange={(e) => setSettings({...settings, autoApproveUsers: e.target.checked})}
                    />
                    Auto-Approve Users
                  </label>
                  <p>Automatically approve all new user registrations</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowSettingsModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveSettings}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate Report</h3>
              <button onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="report-options">
                <h4>Select Report Type</h4>

                <div className="report-item">
                  <label>
                    <input type="radio" name="reportType" defaultChecked />
                    User Activity Report
                  </label>
                  <p>Detailed report of all user registrations, approvals, and activities</p>
                </div>

                <div className="report-item">
                  <label>
                    <input type="radio" name="reportType" />
                    System Usage Report
                  </label>
                  <p>System performance, API usage, and resource consumption</p>
                </div>

                <div className="report-item">
                  <label>
                    <input type="radio" name="reportType" />
                    Contract Analytics Report
                  </label>
                  <p>Contract creation, approval, and lifecycle analytics</p>
                </div>

                <div className="report-format">
                  <h4>Export Format</h4>
                  <div className="format-options">
                    <label>
                      <input type="radio" name="format" value="pdf" defaultChecked />
                      PDF Report
                    </label>
                    <label>
                      <input type="radio" name="format" value="excel" />
                      Excel Spreadsheet
                    </label>
                    <label>
                      <input type="radio" name="format" value="csv" />
                      CSV Data File
                    </label>
                  </div>
                </div>

                <div className="date-range">
                  <h4>Date Range</h4>
                  <div className="date-inputs">
                    <input type="date" name="startDate" placeholder="From date" />
                    <span>to</span>
                    <input type="date" name="endDate" placeholder="To date" />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowReportModal(false)} disabled={generatingReport}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleGenerateReport} disabled={generatingReport}>
                  {generatingReport ? 'Generating Report...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
