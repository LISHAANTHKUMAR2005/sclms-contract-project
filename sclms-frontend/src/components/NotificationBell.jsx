import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";
import "../styles/notification.css";

function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      console.log("🔔 Loading notifications...");
      console.log("User Role:", user?.role);

      try {
        const [my, unread] = await Promise.all([
          api.getMyNotifications(),
          api.getUnreadCount()
        ]);

        if (!isMounted) return;

        setNotifications(my || []);
        setUnreadCount(unread?.count || 0);
        console.log("🔔 Loaded notifications:", my?.length || 0, "unread:", unread?.count || 0);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    // Ensure loadNotifications is triggered when token exists
    const token = localStorage.getItem("token");
    if (token) {
      loadNotifications(); // run once
    }

    const interval = setInterval(loadNotifications, 10000); // Changed to 10 seconds as requested

    // Add event listener for manual refresh
    const handleRefresh = () => {
      console.log("🔔 Manual notification refresh triggered");
      loadNotifications();
    };

    window.addEventListener("notifications-refresh", handleRefresh);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("notifications-refresh", handleRefresh);
    };
  }, [user]); // Add user dependency to ensure re-run when user changes

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`notifications/read/${notificationId}`);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Navigate to contract if it's contract-related
    if (notification.contractId) {
      window.location.href = `/approver/contracts/view/${notification.contractId}`;
    }
    setOpen(false);
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

  return (
    <div className="notification-wrapper">
      {/* 🔔 Bell */}
      <div className="notification-bell" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => api.patch("notifications/read-all").then(() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadCount(0);
                })}
                className="mark-all-read"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="empty">No notifications yet</p>
          ) : (
            <div className="notifications-list">
              {notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  className={`notification-item ${n.read ? "" : "unread"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notification-content">
                    <p className="notification-title">{n.title}</p>
                    <p className="notification-message">{n.message}</p>
                  </div>
                  <div className="notification-meta">
                    <span className="notification-time">{formatTime(n.createdAt)}</span>
                    {!n.read && <span className="unread-dot">●</span>}
                  </div>
                </div>
              ))}
              {notifications.length > 10 && (
                <div className="view-more">
                  <span>+{notifications.length - 10} more notifications</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
