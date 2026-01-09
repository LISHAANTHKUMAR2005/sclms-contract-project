import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  FiHome, FiFileText, FiPlus, FiSearch,
  FiUser, FiSettings, FiLogOut, FiBell,
  FiMenu, FiChevronLeft, FiChevronDown,
  FiBarChart, FiMessageSquare
} from "react-icons/fi";
import NotificationBell from "../components/NotificationBell";
import ThemeToggle from "../components/ThemeToggle";

import "../styles/user-dashboard.css";

export default function UserLayout() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user-theme");
    navigate("/login");
  };

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleMenuItemClick = (action) => {
    setUserMenuOpen(false);
    if (action === "logout") logout();
  };

  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/contracts/create")) return "Create Contract";
    if (path.includes("/contracts/view/")) return "Contract Details";
    if (path.includes("/contracts")) return "My Contracts";
    if (path.includes("/profile")) return "Profile";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  const isActiveLink = (path) => {
    if (path === "") return location.pathname === "/dashboard";
    return location.pathname.includes(path);
  };

  return (
    <div className={`user-layout ${collapsed ? "sidebar-collapsed" : ""}`}
         style={{ "--sidebar-width": collapsed ? "80px" : "280px" }}>

      {/* SIDEBAR */}
      <aside className={`user-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>SCLMS</span>
            <span className="sidebar-subtitle">Contract Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <Link to=""
              className={`nav-link ${isActiveLink("") ? "active" : ""}`}>
              <FiHome className="nav-icon" />
              <span className="nav-text">Dashboard</span>
            </Link>

            <Link to="contracts"
              className={`nav-link ${
                isActiveLink("/contracts") &&
                !location.pathname.includes("/create")
                  ? "active"
                  : ""
              }`}>
              <FiFileText className="nav-icon" />
              <span className="nav-text">My Contracts</span>
            </Link>

            <Link to="contracts/create"
              className={`nav-link ${isActiveLink("/contracts/create") ? "active" : ""}`}>
              <FiPlus className="nav-icon" />
              <span className="nav-text">Create Contract</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Analytics</div>
            <Link to="analytics" className="nav-link">
              <FiBarChart className="nav-icon" />
              <span className="nav-text">Reports</span>
            </Link>
            <Link to="notifications" className="nav-link">
              <FiBell className="nav-icon" />
              <span className="nav-text">Notifications</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Account</div>

            <Link to="profile"
              className={`nav-link ${isActiveLink("/profile") ? "active" : ""}`}>
              <FiUser className="nav-icon" />
              <span className="nav-text">Profile</span>
            </Link>

            <Link to="settings"
              className={`nav-link ${isActiveLink("/settings") ? "active" : ""}`}>
              <FiSettings className="nav-icon" />
              <span className="nav-text">Settings</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Support</div>
            <Link to="feedback" className="nav-link">
              <FiMessageSquare className="nav-icon" />
              <span className="nav-text">Feedback</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <button className="footer-btn logout-btn" onClick={logout}>
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="user-main">

        {/* TOP HEADER BAR */}
        <header className="user-header">
          <div className="header-left">

            <button
              className="header-sidebar-toggle"
              onClick={toggleSidebar}
            >
              {collapsed ? <FiMenu /> : <FiChevronLeft />}
            </button>

            <div className="header-content">
              {/* 🔥 Only big page title — breadcrumb removed */}
              <h1 className="page-title">{getCurrentPageTitle()}</h1>
            </div>
          </div>

          <div className="header-right">

            <div className="header-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search contracts, documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="header-notifications">
              <NotificationBell />
            </div>

            <ThemeToggle />

            <div className="header-user-menu-container" ref={userMenuRef}>
              <button
                className={`header-user-menu ${userMenuOpen ? "active" : ""}`}
                onClick={toggleUserMenu}
              >
                <div className="user-avatar-header">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="user-info-header">
                  <div className="user-name-header">{user?.name}</div>
                  <div className="user-role-header">{user?.role}</div>
                </div>
                <FiChevronDown className={`dropdown-arrow ${userMenuOpen ? "rotated" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {user?.name?.charAt(0)}
                      </div>
                      <div className="dropdown-user-details">
                        <div className="dropdown-user-name">{user?.name}</div>
                        <div className="dropdown-user-email">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link to="profile" className="dropdown-menu-item">
                    <FiUser className="dropdown-icon" />
                    <span>Profile</span>
                  </Link>

                  <Link to="settings" className="dropdown-menu-item">
                    <FiSettings className="dropdown-icon" />
                    <span>Settings</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-menu-item logout-item" onClick={logout}>
                    <FiLogOut className="dropdown-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
