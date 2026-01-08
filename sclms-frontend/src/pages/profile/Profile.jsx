import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { FiUser, FiMail, FiHome, FiShield, FiCalendar, FiCheckCircle, FiFileText, FiClock, FiSettings, FiEye, FiTrendingUp } from "react-icons/fi";
import "../../styles/profile.css";

function Profile() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalContracts: 0,
    approvedContracts: 0,
    pendingContracts: 0,
    todayActivity: 0,
    unreadNotifications: 0,
    memberSince: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) return;
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);

      // Load dashboard stats
      const dashboardData = await apiRequest(`users/${user.id}/dashboard-stats`);

      setStats({
        totalContracts: (dashboardData.approvalsCompleted || 0) + (dashboardData.approvalsPending || 0),
        approvedContracts: dashboardData.approvalsCompleted || 0,
        pendingContracts: dashboardData.approvalsPending || 0,
        todayActivity: dashboardData.todayActivityCount || 0,
        unreadNotifications: dashboardData.unreadNotifications || 0,
        memberSince: user.createdDate ? new Date(user.createdDate).toLocaleDateString() : null
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
      // Set fallback values
      setStats({
        totalContracts: 0,
        approvedContracts: 0,
        pendingContracts: 0,
        todayActivity: 0,
        unreadNotifications: 0,
        memberSince: user?.createdDate ? new Date(user.createdDate).toLocaleDateString() : null
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'admin';
      case 'APPROVER': return 'approver';
      case 'USER': return 'user';
      default: return 'user';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'rejected';
      default: return 'pending';
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <FiUser size={32} />
          </div>
        </div>
        <div className="profile-info">
          <h1>{user.name || 'User'}</h1>
          <p className="profile-email">{user.email || 'user@example.com'}</p>
          <div className="profile-badges">
            <span className={`badge role ${getRoleBadgeColor(user.role)}`}>
              {user.role || 'USER'}
            </span>
            <span className={`badge status ${getStatusBadgeColor(user.status)}`}>
              {user.status || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FiFileText />
          </div>
          <div className="stat-info">
            <div className="stat-number">{loading ? '...' : stats.totalContracts}</div>
            <div className="stat-label">Total Contracts</div>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <div className="stat-number">{loading ? '...' : stats.approvedContracts}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-info">
            <div className="stat-number">{loading ? '...' : stats.pendingContracts}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card activity">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <div className="stat-number">{loading ? '...' : stats.todayActivity}</div>
            <div className="stat-label">Today's Activity</div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="profile-details">

        {/* Basic Information */}
        <div className="detail-section">
          <div className="section-header">
            <FiUser className="section-icon" />
            <h2>Basic Information</h2>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">
                <FiUser />
                <span>Full Name</span>
              </div>
              <div className="detail-value">{user.name || 'Not provided'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiMail />
                <span>Email Address</span>
              </div>
              <div className="detail-value">{user.email || 'Not provided'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiHome />
                <span>Organization</span>
              </div>
              <div className="detail-value">{user.organization || 'Not provided'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiShield />
                <span>Role</span>
              </div>
              <div className="detail-value">
                <span className={`role-badge ${getRoleBadgeColor(user.role)}`}>
                  {user.role || 'USER'}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiCheckCircle />
                <span>Account Status</span>
              </div>
              <div className="detail-value">
                <span className={`status-badge ${getStatusBadgeColor(user.status)}`}>
                  {user.status || 'PENDING'}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiCalendar />
                <span>Member Since</span>
              </div>
              <div className="detail-value">
                {user.createdDate
                  ? new Date(user.createdDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Not available'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="detail-section">
          <div className="section-header">
            <FiShield className="section-icon" />
            <h2>Account Security</h2>
          </div>

          <div className="security-grid">
            <div className="security-item">
              <div className="security-info">
                <h4>Two-Factor Authentication</h4>
                <p>{user.twoFactorEnabled ? 'Extra security layer is active' : 'Add an extra layer of security to your account'}</p>
              </div>
              <div className="security-status">
                <span className={`status-indicator ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Password</h4>
                <p>Update your account password for better security</p>
              </div>
              <div className="security-action">
                <Link to="/change-password" className="btn-outline">
                  <FiSettings />
                  Change Password
                </Link>
              </div>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Account Settings</h4>
                <p>Manage notifications, theme, and security preferences</p>
              </div>
              <div className="security-action">
                <Link to="settings" className="btn-outline">
                  <FiEye />
                  View Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Profile;
