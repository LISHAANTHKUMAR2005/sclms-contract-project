import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiUsers, FiCheckCircle, FiX, FiClock } from 'react-icons/fi';
import { adminService } from '../services/adminService';
import { AuthContext } from '../context/AuthContext';
import { createLogger } from '../utils/logger';
import './AdminNotificationBell.css';

const logger = createLogger('AdminNotificationBell');

const AdminNotificationBell = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ count: 0, latestUsers: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pending users count and latest users
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      if (!user || user.role !== 'ADMIN') {
        throw new Error('User not authenticated as admin.');
      }

      const response = await adminService.getPendingUsersNotifications();

      // Ensure we have valid response data with defaults
      const safeResponse = {
        count: response?.count || 0,
        latestUsers: response?.latestUsers || []
      };

      setNotifications(safeResponse);
    } catch (err) {
      logger.error(`Failed to fetch notifications: ${err.message}`);
      setError('Failed to load notifications');

      // If authentication error, clear tokens and redirect to login
      if (err.message.includes('authentication') || err.message.includes('permission')) {
        logger.error('Authentication/permission error detected, clearing auth and redirecting to login');
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      // Set safe defaults on error
      setNotifications({ count: 0, latestUsers: [] });
    } finally {
      setLoading(false);
    }
  };

  // Poll every 20 seconds
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 20000); // 20 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Don't render if not admin
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };



  return (
    <div className="admin-notification-bell">
      <button
        className={`notification-button ${notifications.count > 0 ? 'has-notifications' : ''}`}
        onClick={toggleDropdown}
        title={`${notifications.count} pending user${notifications.count !== 1 ? 's' : ''}`}
      >
        <FiBell className="bell-icon" />
        {notifications.count > 0 && (
          <span className="notification-badge">
            {notifications.count > 99 ? '99+' : notifications.count}
          </span>
        )}
        {loading && <div className="loading-indicator"></div>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Pending User Approvals</h4>
            <span className="notification-count">
              {notifications.count} pending
            </span>
          </div>

          <div className="dropdown-content">
            {error && (
              <div className="error-message">
                <FiX />
                {error}
              </div>
            )}

            {notifications.count === 0 ? (
              <div className="empty-state">
                <FiCheckCircle className="check-icon" />
                <p>No pending approvals</p>
                <span>All users are approved</span>
              </div>
            ) : (
              <div className="pending-users-list">
                {notifications.latestUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="pending-user-item clickable"
                    onClick={() => {
                      navigate('/admin/approvals');
                      setIsOpen(false);
                    }}
                  >
                    <div className="user-info">
                      <div className="user-avatar">
                        <FiUsers />
                      </div>
                      <div className="user-details">
                        <h5>{pendingUser.name}</h5>
                        <p>{pendingUser.email}</p>
                        <small>{pendingUser.organization}</small>
                        <div className="user-timestamp">
                          <FiClock />
                          {new Date(pendingUser.createdDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.count > 5 && (
                  <div className="view-more">
                    <p>And {notifications.count - 5} more pending users...</p>
                    <button
                      className="view-all-btn"
                      onClick={() => {
                        navigate('/admin/approvals');
                        setIsOpen(false);
                      }}
                    >
                      View All Approvals
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="dropdown-footer">
            <button
              className="refresh-btn"
              onClick={fetchNotifications}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminNotificationBell;
