import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FiHome, FiCheckCircle, FiUsers,
  FiLogOut, FiMenu,
  FiUser, FiChevronDown, FiSettings, FiShield
} from "react-icons/fi";
import AdminNotificationBell from "../components/AdminNotificationBell";
import ThemeToggle from "../components/ThemeToggle";

import "../styles/admin.css";

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    // Check for saved sidebar state
    return localStorage.getItem('admin-sidebar-collapsed') === 'true';
  });

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    // Save sidebar state
    localStorage.setItem('admin-sidebar-collapsed', collapsed);
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`admin-layout ${collapsed ? "sidebar-collapsed" : ""}`}
      style={{
        '--sidebar-width': collapsed ? '80px' : '280px'
      }}
    >
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <span>SCLMS Admin</span>
          <button
            onClick={toggleSidebar}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="sidebar-toggle-btn"
          >
            <FiMenu />
          </button>
        </div>

        <nav className="sidebar-menu">
          <Link to="/admin/dashboard" className="sidebar-link">
            <FiHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/approvals" className="sidebar-link">
            <FiCheckCircle />
            <span>Approvals</span>
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <FiUsers />
            <span>User Management</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <button
              className="footer-btn logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        <header className="admin-navbar">
          <div className="navbar-left">
            <button
              className="sidebar-mobile-toggle"
              onClick={toggleSidebar}
              title="Toggle Sidebar"
            >
              <FiMenu />
            </button>
            <div className="navbar-title">SCLMS Admin Panel</div>
          </div>
          <div className="navbar-user">
            <AdminNotificationBell />
            <ThemeToggle />
            <div className="profile-dropdown">
              <button
                className="profile-button"
                onClick={toggleProfileDropdown}
                title="User Profile"
              >
                <div className="profile-avatar">
                  <span className="avatar-text">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user?.name || 'Admin'}</span>
                  <span className="profile-role">
                    {user?.role === 'ADMIN' ? 'Administrator' :
                     user?.role === 'APPROVER' ? 'Approver' : 'User'}
                  </span>
                </div>
                <FiChevronDown className={`dropdown-arrow ${profileDropdownOpen ? 'open' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="profile-menu">
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      <span className="avatar-text">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="profile-details">
                      <div className="profile-name">{user?.name || 'Admin'}</div>
                      <div className="profile-email">{user?.email || 'admin@sclms.com'}</div>
                      <div className="profile-role-badge">
                        <FiShield />
                        {user?.role === 'ADMIN' ? 'Administrator' :
                         user?.role === 'APPROVER' ? 'Approver' : 'User'}
                      </div>
                    </div>
                  </div>

                  <div className="profile-menu-items">
                    <Link to="/admin/settings" className="profile-menu-item">
                      <FiSettings />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      className="profile-menu-item logout"
                      onClick={handleLogout}
                    >
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
