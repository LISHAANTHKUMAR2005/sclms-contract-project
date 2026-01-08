import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { notificationAPI } from "../../utils/api";
import {
  FiBell, FiCheckCircle, FiEye, FiClock,
  FiAlertCircle, FiInfo, FiCheck, FiMessageSquare
} from "react-icons/fi";
import "../../styles/notification.css";

function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getMyNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate to contract if it's contract-related
    if (notification.contractId) {
      window.location.href = `/approver/contracts/view/${notification.contractId}`;
    }
  };

  // Format relative time
  const formatTime = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'contract_approved':
      case 'contract_rejected':
        return <FiCheckCircle className="notification-icon success" />;
      case 'contract_created':
        return <FiAlertCircle className="notification-icon warning" />;
      case 'contract_expiring':
        return <FiClock className="notification-icon danger" />;
      default:
        return <FiInfo className="notification-icon info" />;
    }
  };

  // Get notification type badge color
  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'contract_approved':
        return 'badge-success';
      case 'contract_rejected':
        return 'badge-danger';
      case 'contract_created':
        return 'badge-warning';
      case 'contract_expiring':
        return 'badge-info';
      default:
        return 'badge-default';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readNotifications = notifications.filter(n => n.read);
  const unreadNotifications = notifications.filter(n => !n.read);

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">

      {/* Header */}
      <div className="notifications-header">
        <div className="header-content">
          <FiBell className="header-icon" />
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your contract activities</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn-outline mark-all-btn"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <>
                <div className="loading-spinner small"></div>
                Marking...
              </>
            ) : (
              <>
                <FiCheck />
                Mark all read ({unreadCount})
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="notifications-stats">
        <div className="stat-item">
          <span className="stat-number">{unreadCount}</span>
          <span className="stat-label">Unread</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notifications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{readNotifications.length}</span>
          <span className="stat-label">Read</span>
        </div>
      </div>

      {/* Notification Lists */}
      <div className="notifications-content">

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="notifications-section">
            <h2><FiEye className="section-icon" /> Unread Notifications</h2>
            <div className="notifications-list">
              {unreadNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="notification-card unread"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-main">
                    {getNotificationIcon(notification.type)}
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3 className="notification-title">{notification.title}</h3>
                        <span className={`notification-badge ${getTypeBadgeClass(notification.type)}`}>
                          {notification.type?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          <FiClock className="time-icon" />
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span className="unread-indicator">● Unread</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {notification.contractId && (
                    <div className="notification-actions">
                      <button className="btn-link">
                        View Contract →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        <div className="notifications-section">
          <h2>
            <FiCheckCircle className="section-icon" />
            {unreadNotifications.length > 0 ? 'Read Notifications' : 'All Notifications'}
          </h2>

          {readNotifications.length === 0 && unreadNotifications.length === 0 ? (
            <div className="empty-state">
              <FiMessageSquare className="empty-icon" />
              <h3>No notifications yet</h3>
              <p>Notifications about your contracts and activities will appear here.</p>
            </div>
          ) : readNotifications.length === 0 && unreadNotifications.length > 0 ? (
            <div className="empty-section">
              <p>No read notifications yet. Mark some as read to see them here.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {readNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="notification-card read"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-main">
                    {getNotificationIcon(notification.type)}
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3 className="notification-title">{notification.title}</h3>
                        <span className={`notification-badge ${getTypeBadgeClass(notification.type)}`}>
                          {notification.type?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          <FiClock className="time-icon" />
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.read && (
                          <span className="read-indicator">
                            <FiCheck className="check-icon" />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {notification.contractId && (
                    <div className="notification-actions">
                      <button className="btn-link">
                        View Contract →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Notifications;
