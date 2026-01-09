import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FiHome, FiCheckCircle, FiFileText, FiUser,
  FiSettings, FiLogOut, FiMenu, FiChevronLeft,
  FiChevronDown, FiBell
} from "react-icons/fi";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/approver-layout.css";

export default function ApproverLayout() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSystemAvailable, setNotificationSystemAvailable] = useState(true);

  // Load notifications - DISABLED until notification system is compiled
  const loadNotifications = async () => {
    // Notification system not available in current JAR
    setNotifications([]);
    setUnreadCount(0);
    setNotificationSystemAvailable(false);
    return false; // Always indicate system not available
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    // Notification system not available - silently do nothing
    console.log('Notification system not available');
  };

  // Mark all as read
  const markAllAsRead = async () => {
    // Notification system not available - silently do nothing
    console.log('Notification system not available');
  };

  // Handle outside click to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load notifications on component mount and user change
  useEffect(() => {
    let intervalId = null;

    const setupNotifications = async () => {
      if (!user?.id) return;

      const systemAvailable = await loadNotifications();

      if (systemAvailable && notificationSystemAvailable) {
        // Set up polling for new notifications every 30 seconds only if system is available
        intervalId = setInterval(async () => {
          if (notificationSystemAvailable) {
            await loadNotifications();
          } else {
            // Stop polling if system becomes unavailable
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        }, 30000);
      }
    };

    setupNotifications();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleMenuItemClick = (action) => {
    setUserMenuOpen(false);
    if (action === 'logout') {
      logout();
    }
  };

  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === '/approver/dashboard') return 'Dashboard';
    if (path.includes('/approver/approvals')) return 'Approvals';
    if (path.includes('/approver/contracts')) return 'Contracts';
    if (path.includes('/approver/profile')) return 'Profile';
    if (path.includes('/approver/settings')) return 'Settings';
    return 'Dashboard';
  };

  const isActiveLink = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className={`approver-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* SIDEBAR */}
      <aside className={`approver-sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* Logo Section */}
        <div className="sidebar-logo-section">
          <div className="sidebar-logo">
            <div className="sidebar-logo-main">SCLMS</div>
            <div className="sidebar-logo-subtitle">Approver Portal</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-navigation">
          <Link
            to="/approver/dashboard"
            className={`sidebar-nav-item ${isActiveLink('/approver/dashboard') ? 'active' : ''}`}
          >
            <FiHome className="nav-item-icon" />
            <span className="nav-item-text">Dashboard</span>
          </Link>

          <Link
            to="/approver/approvals"
            className={`sidebar-nav-item ${isActiveLink('/approver/approvals') ? 'active' : ''}`}
          >
            <FiCheckCircle className="nav-item-icon" />
            <span className="nav-item-text">Approvals</span>
          </Link>

          <Link
            to="/approver/contracts"
            className={`sidebar-nav-item ${isActiveLink('/approver/contracts') ? 'active' : ''}`}
          >
            <FiFileText className="nav-item-icon" />
            <span className="nav-item-text">Contracts</span>
          </Link>

          <Link
            to="/approver/profile"
            className={`sidebar-nav-item ${isActiveLink('/approver/profile') ? 'active' : ''}`}
          >
            <FiUser className="nav-item-icon" />
            <span className="nav-item-text">Profile</span>
          </Link>

          <Link
            to="/approver/settings"
            className={`sidebar-nav-item ${isActiveLink('/approver/settings') ? 'active' : ''}`}
          >
            <FiSettings className="nav-item-icon" />
            <span className="nav-item-text">Settings</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={logout}
            title="Logout"
          >
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="approver-main-content">
        {/* TOP HEADER BAR */}
        <header className="approver-header">
          <div className="header-left-section">
            {/* Sidebar Toggle Button */}
            <button
              className="sidebar-toggle-button"
              onClick={toggleSidebar}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <FiMenu /> : <FiChevronLeft />}
            </button>

            <div className="header-content">
              <h1 className="page-main-title">{getCurrentPageTitle()}</h1>
              <div className="page-role-indicator">
                
              </div>
            </div>
          </div>

          <div className="header-right-section">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <div className="notification-container">
              <button
                className="notification-bell"
                onClick={() => setNotificationOpen(!notificationOpen)}
                title="Notifications"
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button
                      onClick={markAllAsRead}
                      className="mark-read-btn"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div
                          key={index}
                          className={`notification-item ${notification.read ? '' : 'unread'}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="notification-icon">
                            {notification.type === 'contract' && '📄'}
                            {notification.type === 'approval' && '✅'}
                            {notification.type === 'rejection' && '❌'}
                            {notification.type === 'system' && '⚙️'}
                          </div>
                          <div className="notification-content">
                            <p className="notification-title">{notification.title}</p>
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {!notification.read && <div className="unread-dot"></div>}
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className={`user-menu-button ${userMenuOpen ? 'active' : ''}`}
                onClick={toggleUserMenu}
                title="User Menu"
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.name || 'Approver'}</div>
                  <div className="user-role">{user?.role || 'APPROVER'}</div>
                </div>
                <FiChevronDown className={`dropdown-arrow ${userMenuOpen ? 'rotated' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-avatar">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <div className="dropdown-user-details">
                        <div className="dropdown-user-name">{user?.name || 'Approver'}</div>
                        <div className="dropdown-user-email">{user?.email || 'approver@sclms.com'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-menu-divider"></div>

                  <div className="dropdown-menu-items">
                    <Link
                      to="/approver/profile"
                      className="dropdown-menu-item"
                      onClick={() => handleMenuItemClick('profile')}
                    >
                      <FiUser className="dropdown-item-icon" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/approver/settings"
                      className="dropdown-menu-item"
                      onClick={() => handleMenuItemClick('settings')}
                    >
                      <FiSettings className="dropdown-item-icon" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="dropdown-menu-divider"></div>

                  <div className="dropdown-menu-items">
                    <button
                      className="dropdown-menu-item logout-menu-item"
                      onClick={() => handleMenuItemClick('logout')}
                    >
                      <FiLogOut className="dropdown-item-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="approver-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
