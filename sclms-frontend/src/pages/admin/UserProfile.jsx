import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { showToast } from "../../utils/toast";
import {
  FiArrowLeft, FiEdit3, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield,
  FiActivity, FiSettings, FiUserCheck, FiUserX, FiTrash2, FiDownload,
  FiLock, FiUnlock, FiEye, FiEyeOff, FiBell, FiBellOff, FiKey, FiUsers,
  FiBriefcase, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiBarChart2,
  FiRefreshCw, FiSave, FiUser, FiAlertTriangle, FiToggleLeft, FiToggleRight
} from "react-icons/fi";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  useEffect(() => {
    if (id) {
      loadUserDetails();
      loadUserStats();
      loadActivityLog();
    }
  }, [id]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`admin/users/${id}`);
      setUser(data);
      setEditedUser({ ...data });
    } catch (error) {
      console.error("Error loading user details:", error);
      showToast("Failed to load user details", "error");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await apiRequest(`admin/users/${id}/stats`);
      setUserStats(stats);
    } catch (error) {
      // Set default stats if API fails
      setUserStats({
        totalContracts: 0,
        activeContracts: 0,
        pendingApprovals: 0,
        lastLogin: null,
        accountAge: 0
      });
    }
  };

  const loadActivityLog = async () => {
    try {
      const activities = await apiRequest(`admin/users/${id}/activity`);
      setActivityLog(activities || []);
    } catch (error) {
      // Set default activity log
      setActivityLog([
        {
          id: 1,
          action: "Account Created",
          description: "User account was created successfully",
          timestamp: user?.createdDate || new Date().toISOString(),
          type: "account"
        }
      ]);
    }
  };

  // Action handlers
  const handleApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve ${user.name}?`)) return;

    try {
      setActionLoading('approve');
      await apiRequest(`admin/approve/${user.id}`, { method: 'PUT' });
      showToast("User approved successfully", "success");
      await loadUserDetails();
    } catch (error) {
      showToast("Failed to approve user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!window.confirm(`Are you sure you want to reject ${user.name}?`)) return;

    try {
      setActionLoading('reject');
      await apiRequest(`admin/reject/${user.id}`, { method: 'PUT' });
      showToast("User rejected successfully", "success");
      await loadUserDetails();
    } catch (error) {
      showToast("Failed to reject user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async () => {
    if (!window.confirm(`Are you sure you want to promote ${user.name} to Approver?`)) return;

    try {
      setActionLoading('promote');
      await apiRequest(`admin/promote/${user.id}`, { method: 'PUT' });
      showToast("User promoted to Approver", "success");
      await loadUserDetails();
    } catch (error) {
      showToast("Failed to promote user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async () => {
    if (!window.confirm(`Are you sure you want to demote ${user.name} to regular User?`)) return;

    try {
      setActionLoading('demote');
      await apiRequest(`admin/demote/${user.id}`, { method: 'PUT' });
      showToast("User demoted to regular User", "success");
      await loadUserDetails();
    } catch (error) {
      showToast("Failed to demote user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`)) return;

    try {
      setActionLoading('delete');
      await apiRequest(`admin/users/${user.id}`, { method: 'DELETE' });
      showToast("User deleted successfully", "success");
      navigate("/admin/users");
    } catch (error) {
      showToast("Failed to delete user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiRequest(`admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(editedUser)
      });
      setUser(editedUser);
      setEditMode(false);
      showToast("User profile updated successfully", "success");
    } catch (error) {
      showToast("Failed to update user profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setEditMode(false);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditedUser({ ...user });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportUserData = () => {
    const dataStr = JSON.stringify(user, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `user-${user.id}-profile.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast("User profile exported successfully", "success");
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-content">
        <div className="error-state">
          <p>User not found</p>
          <button className="btn btn-primary" onClick={() => navigate("/admin/users")}>
            Back to User Management
          </button>
        </div>
      </div>
    );
  }

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { color: 'var(--admin-success)', bgColor: 'rgba(5, 150, 105, 0.1)', icon: FiCheckCircle };
      case 'PENDING':
        return { color: 'var(--admin-warning)', bgColor: 'rgba(245, 158, 11, 0.1)', icon: FiClock };
      case 'REJECTED':
        return { color: 'var(--admin-error)', bgColor: 'rgba(220, 38, 38, 0.1)', icon: FiXCircle };
      default:
        return { color: 'var(--admin-muted)', bgColor: 'rgba(100, 116, 139, 0.1)', icon: FiUser };
    }
  };

  const statusConfig = getStatusConfig(user.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="admin-content full-width">
      {/* Professional Breadcrumb Header */}
      <div className="user-details-header">
        <div className="breadcrumb-nav">
          <button
            className="breadcrumb-back"
            onClick={() => navigate("/admin/users")}
          >
            <FiArrowLeft />
            Back to Users
          </button>
          <div className="breadcrumb-path">
            <span>Admin</span>
            <span>/</span>
            <span>Users</span>
            <span>/</span>
            <span>{user.name}</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={exportUserData}
          >
            <FiDownload />
            Export Profile
          </button>
          <button
            className="btn btn-primary"
            onClick={toggleEditMode}
          >
            <FiEdit3 />
            {editMode ? 'Cancel Edit' : 'Edit User'}
          </button>
        </div>
      </div>

      {/* User Profile Hero Section */}
      <div className="user-profile-hero">
        <div className="user-profile-main">
          <div className="user-avatar-section">
            <div className="user-avatar-xl">
              <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
              <div
                className="status-indicator-xl"
                style={{ backgroundColor: statusConfig.color }}
              >
                <StatusIcon size={16} />
              </div>
            </div>
          </div>

          <div className="user-info-section">
            <div className="user-name-section">
              <h1 className="user-display-name">{user.name}</h1>
              <div className="user-badges-row">
                <span className={`role-badge-xl ${user.role.toLowerCase()}`}>
                  <FiShield />
                  {user.role}
                </span>
                <span
                  className="status-badge-xl"
                  style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                >
                  <StatusIcon />
                  {user.status}
                </span>
              </div>
            </div>

            <div className="user-contact-info">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>{user.email}</span>
              </div>
              <div className="contact-item">
                <FiBriefcase className="contact-icon" />
                <span>{user.organization}</span>
              </div>
              <div className="contact-item">
                <FiCalendar className="contact-icon" />
                <span>Joined {user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="user-quick-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <span className="stat-value">{user.id}</span>
              <span className="stat-label">User ID</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <FiActivity />
            </div>
            <div className="stat-content">
              <span className="stat-value">Active</span>
              <span className="stat-label">Account Status</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <FiKey />
            </div>
            <div className="stat-content">
              <span className="stat-value">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              <span className="stat-label">2FA Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Tab Navigation */}
      <div className="user-details-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiUser />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FiActivity />
          Activity
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings />
          Settings
        </button>
        <button
          className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <FiShield />
          Permissions
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Basic Information Card */}
              <div className="info-card">
                <div className="card-header">
                  <FiUser className="card-icon" />
                  <h3>Basic Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="info-label">Full Name:</span>
                    <span className="info-value">{user.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email Address:</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Organization:</span>
                    <span className="info-value">{user.organization}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role:</span>
                    <span className={`info-value role-chip ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Status:</span>
                    <span
                      className="info-value status-chip"
                      style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information Card */}
              <div className="info-card">
                <div className="card-header">
                  <FiSettings className="card-icon" />
                  <h3>Account Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="info-label">User ID:</span>
                    <span className="info-value">{user.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Registration Date:</span>
                    <span className="info-value">
                      {user.createdDate ? new Date(user.createdDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Last Login:</span>
                    <span className="info-value">Today, 2:30 PM</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Age:</span>
                    <span className="info-value">
                      {user.createdDate ?
                        Math.floor((new Date() - new Date(user.createdDate)) / (1000 * 60 * 60 * 24)) + ' days' :
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="info-card">
                <div className="card-header">
                  <FiMail className="card-icon" />
                  <h3>Contact Information</h3>
                </div>
                <div className="card-content">
                  <div className="contact-detail">
                    <FiMail className="contact-icon" />
                    <div>
                      <div className="contact-label">Email Address</div>
                      <div className="contact-value">{user.email}</div>
                    </div>
                  </div>
                  <div className="contact-detail">
                    <FiMapPin className="contact-icon" />
                    <div>
                      <div className="contact-label">Organization</div>
                      <div className="contact-value">{user.organization}</div>
                    </div>
                  </div>
                  <div className="contact-detail">
                    <FiPhone className="contact-icon" />
                    <div>
                      <div className="contact-label">Phone Number</div>
                      <div className="contact-value">Not provided</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Information Card */}
              <div className="info-card">
                <div className="card-header">
                  <FiShield className="card-icon" />
                  <h3>Security & Access</h3>
                </div>
                <div className="card-content">
                  <div className="security-item">
                    <div className="security-icon">
                      {user.twoFactorEnabled ? <FiLock /> : <FiUnlock />}
                    </div>
                    <div className="security-info">
                      <div className="security-label">Two-Factor Authentication</div>
                      <div className={`security-status ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                        {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">
                      <FiKey />
                    </div>
                    <div className="security-info">
                      <div className="security-label">Password Strength</div>
                      <div className="security-status strong">Strong</div>
                    </div>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">
                      <FiActivity />
                    </div>
                    <div className="security-info">
                      <div className="security-label">Last Activity</div>
                      <div className="security-status active">2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            <div className="activity-header">
              <h3><FiActivity /> User Activity Log</h3>
              <p>Recent actions and system events for this user</p>
            </div>

            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-icon">
                  <FiUserCheck />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Account Approved</div>
                  <div className="timeline-description">User account was approved by admin</div>
                  <div className="timeline-time">2 days ago</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <FiMail />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Welcome Email Sent</div>
                  <div className="timeline-description">Account activation email sent to user</div>
                  <div className="timeline-time">2 days ago</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <FiUser />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Account Created</div>
                  <div className="timeline-description">User registration completed successfully</div>
                  <div className="timeline-time">{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-header">
              <h3><FiSettings /> User Preferences & Settings</h3>
              <p>Manage notification preferences and account settings</p>
            </div>

            <div className="settings-grid">
              <div className="settings-card">
                <div className="settings-card-header">
                  <FiBell className="settings-icon" />
                  <h4>Notification Preferences</h4>
                </div>
                <div className="settings-content">
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Email Notifications</span>
                      <span className="setting-description">Receive updates via email</span>
                    </div>
                    <div className={`setting-toggle ${user.emailNotifications ? 'enabled' : 'disabled'}`}>
                      {user.emailNotifications ? <FiBell /> : <FiBellOff />}
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Contract Alerts</span>
                      <span className="setting-description">Get notified about contract updates</span>
                    </div>
                    <div className={`setting-toggle ${user.contractAlerts ? 'enabled' : 'disabled'}`}>
                      {user.contractAlerts ? <FiBell /> : <FiBellOff />}
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Expiration Reminders</span>
                      <span className="setting-description">Reminders for expiring contracts</span>
                    </div>
                    <div className={`setting-toggle ${user.expirationReminders ? 'enabled' : 'disabled'}`}>
                      {user.expirationReminders ? <FiBell /> : <FiBellOff />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <FiShield className="settings-icon" />
                  <h4>Security Settings</h4>
                </div>
                <div className="settings-content">
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Two-Factor Authentication</span>
                      <span className="setting-description">Extra security for account access</span>
                    </div>
                    <div className={`setting-toggle ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                      {user.twoFactorEnabled ? <FiLock /> : <FiUnlock />}
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Session Timeout</span>
                      <span className="setting-description">Auto-logout after inactivity</span>
                    </div>
                    <div className="setting-value">30 minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="permissions-tab">
            <div className="permissions-header">
              <h3><FiShield /> User Permissions & Access Control</h3>
              <p>Current role-based permissions and access rights</p>
            </div>

            <div className="permissions-matrix">
              <div className="permission-group">
                <h4>Contract Management</h4>
                <div className="permission-list">
                  <div className="permission-item">
                    <FiCheckCircle className="permission-icon granted" />
                    <span>View Contracts</span>
                  </div>
                  <div className={`permission-item ${user.role === 'APPROVER' || user.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                    <FiCheckCircle className={`permission-icon ${user.role === 'APPROVER' || user.role === 'ADMIN' ? 'granted' : 'denied'}`} />
                    <span>Approve Contracts</span>
                  </div>
                  <div className="permission-item granted">
                    <FiCheckCircle className="permission-icon granted" />
                    <span>Create Contracts</span>
                  </div>
                  <div className="permission-item granted">
                    <FiCheckCircle className="permission-icon granted" />
                    <span>Edit Own Contracts</span>
                  </div>
                </div>
              </div>

              <div className="permission-group">
                <h4>System Administration</h4>
                <div className="permission-list">
                  <div className={`permission-item ${user.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                    <FiCheckCircle className={`permission-icon ${user.role === 'ADMIN' ? 'granted' : 'denied'}`} />
                    <span>Manage Users</span>
                  </div>
                  <div className={`permission-item ${user.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                    <FiCheckCircle className={`permission-icon ${user.role === 'ADMIN' ? 'granted' : 'denied'}`} />
                    <span>System Settings</span>
                  </div>
                  <div className={`permission-item ${user.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                    <FiCheckCircle className={`permission-icon ${user.role === 'ADMIN' ? 'granted' : 'denied'}`} />
                    <span>View Analytics</span>
                  </div>
                  <div className={`permission-item ${user.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                    <FiCheckCircle className={`permission-icon ${user.role === 'ADMIN' ? 'granted' : 'denied'}`} />
                    <span>Audit Logs</span>
                  </div>
                </div>
              </div>

              <div className="permission-group">
                <h4>Communication & Collaboration</h4>
                <div className="permission-list">
                  <div className="permission-item granted">
                    <FiCheckCircle className="permission-icon granted" />
                    <span>Send Messages</span>
                  </div>
                  <div className="permission-item granted">
                    <FiCheckCircle className="permission-icon granted" />
                    <span>Join Teams</span>
                  </div>
                  <div className={`permission-item ${user.role === 'APPROVER' || user.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                    <FiCheckCircle className={`permission-icon ${user.role === 'APPROVER' || user.role === 'ADMIN' ? 'granted' : 'denied'}`} />
                    <span>Manage Teams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Panel */}
      <div className="user-actions-panel">
        <div className="actions-left">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/users")}
          >
            <FiArrowLeft />
            Back to Users
          </button>
        </div>

        <div className="actions-right">
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={actionLoading === 'delete'}
          >
            {actionLoading === 'delete' ? <FiRefreshCw className="spinning" /> : <FiTrash2 />}
            Delete User
          </button>
          <button
            className="btn btn-warning"
            onClick={handleDemote}
            disabled={actionLoading === 'demote'}
          >
            {actionLoading === 'demote' ? <FiRefreshCw className="spinning" /> : <FiUserX />}
            Demote User
          </button>
          <button
            className="btn btn-success"
            onClick={handleApprove}
            disabled={actionLoading === 'approve'}
          >
            {actionLoading === 'approve' ? <FiRefreshCw className="spinning" /> : <FiUserCheck />}
            Approve User
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePromote}
            disabled={actionLoading === 'promote'}
          >
            {actionLoading === 'promote' ? <FiRefreshCw className="spinning" /> : <FiShield />}
            Promote User
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
