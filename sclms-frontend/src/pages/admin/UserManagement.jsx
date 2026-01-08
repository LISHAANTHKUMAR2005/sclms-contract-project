import React, { useState, useEffect, useContext } from "react";
import { FiSearch, FiFilter, FiUsers, FiUserCheck, FiUserX, FiUserPlus, FiEdit3, FiTrash2, FiEye, FiDownload, FiRefreshCw, FiGrid, FiList, FiBarChart2, FiSettings, FiTrendingUp, FiCalendar, FiShield, FiMail, FiBriefcase, FiChevronDown, FiChevronUp, FiMoreVertical, FiCheck, FiX, FiAlertCircle, FiClock, FiChevronLeft, FiChevronRight, FiCheckCircle, FiUser, FiXCircle } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import { AuthContext } from "../../context/AuthContext";

function UserManagement() {
  const { user } = useContext(AuthContext);

  // Debug current user authentication
  useEffect(() => {
    console.log("🔍 UserManagement - Current User:", user);
    console.log("🔍 UserManagement - User Role:", user?.role);
    console.log("🔍 UserManagement - Is Admin:", user?.role === 'ADMIN');
    console.log("🔍 UserManagement - Is Approver:", user?.role === 'APPROVER');
  }, [user]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'red' });
  const [viewMode, setViewMode] = useState("table");
  const [sortConfig, setSortConfig] = useState({ key: "createdDate", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.organization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
    setFilteredUsers(filtered);
  };

  // Actions
  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      loadUsers();
      alert("User approved successfully!");
    } catch (error) {
      alert("Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this user?")) return;
    try {
      await adminService.rejectUser(userId);
      loadUsers();
      alert("User rejected!");
    } catch (error) {
      alert("Failed to reject user");
    }
  };

  const handlePromote = async (userId) => {
    try {
      await adminService.promoteToApprover(userId);
      loadUsers();
      alert("User promoted to Approver!");
    } catch (error) {
      alert("Failed to promote user");
    }
  };

  const handleDemote = async (userId) => {
    try {
      await adminService.demoteToUser(userId);
      loadUsers();
      alert("User demoted to regular User!");
    } catch (error) {
      alert("Failed to demote user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await adminService.deleteUser(userId);
      loadUsers();
      alert("User deleted successfully!");
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Bulk operations
  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) return alert("No users selected");
    try {
      for (const userId of selectedUsers) {
        await adminService.approveUser(userId);
      }
      setSelectedUsers([]);
      loadUsers();
      alert(`${selectedUsers.length} users approved!`);
    } catch (error) {
      alert("Failed to approve selected users");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return alert("No users selected");
    if (!window.confirm(`Delete ${selectedUsers.length} users?`)) return;
    try {
      for (const userId of selectedUsers) {
        await adminService.deleteUser(userId);
      }
      setSelectedUsers([]);
      loadUsers();
      alert(`${selectedUsers.length} users deleted!`);
    } catch (error) {
      alert("Failed to delete selected users");
    }
  };

  // Export users data
  const handleExportUsers = async () => {
    try {
      const filters = {
        status: statusFilter !== "ALL" ? statusFilter : "",
        role: roleFilter !== "ALL" ? roleFilter : ""
      };

      const response = await adminService.exportUsers(filters);

      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Users data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export users data");
    }
  };

  // Statistics calculations
  const stats = {
    totalUsers: users.length,
    pendingUsers: users.filter(u => u.status === "PENDING").length,
    approvedUsers: users.filter(u => u.status === "APPROVED").length,
    rejectedUsers: users.filter(u => u.status === "REJECTED").length,
    adminUsers: users.filter(u => u.role === "ADMIN").length,
    approverUsers: users.filter(u => u.role === "APPROVER").length,
    regularUsers: users.filter(u => u.role === "USER").length,
  };

  // Sort function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("One lowercase letter");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("One number");

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push("One special character");

    let label, color;
    if (score < 2) {
      label = "Weak";
      color = "red";
    } else if (score < 4) {
      label = "Medium";
      color = "orange";
    } else {
      label = "Strong";
      color = "green";
    }

    return { score, label, color };
  };

  // Handle password input change
  const handlePasswordChange = (field, value) => {
    const updated = { ...resetPasswordData, [field]: value };
    setResetPasswordData(updated);

    if (field === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!selectedUser) return;

    const { newPassword, confirmPassword } = resetPasswordData;

    if (!newPassword || !confirmPassword) {
      alert("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 3) {
      alert("Password is too weak. Please choose a stronger password.");
      return;
    }

    try {
      await adminService.resetUserPassword(selectedUser.id, { newPassword });
      alert("Password reset successfully. User must log in using new credentials.");
      setShowResetPasswordModal(false);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Handle 403 Forbidden - user doesn't have admin privileges
      if (error.message && error.message.includes("403")) {
        alert("Access denied. You don't have administrator privileges to reset passwords. Please contact your system administrator.");
        // Optionally redirect to appropriate dashboard
        if (user?.role === 'APPROVER') {
          window.location.href = '/approver/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        alert("Failed to reset password: " + error.message);
      }
    }
  };

  // Apply sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  return (
    <div className="admin-content full-width">
      {/* =====================================================
          ENTERPRISE PROFESSIONAL HEADER
      ===================================================== */}
      <div className="enterprise-header">
        <div className="header-main-section">
          <div className="header-branding">
            <div className="brand-icon">
              <FiUsers />
            </div>
            <div className="brand-content">
              <h1 className="page-title">User Administration</h1>
              <p className="page-subtitle">Enterprise user management and access control system</p>
            </div>
          </div>

          <div className="header-controls">
            <button
              className="btn btn-analytics"
              onClick={() => setShowStatsModal(true)}
            >
              <FiBarChart2 />
              Analytics Dashboard
            </button>
            <button
              className="btn btn-refresh"
              onClick={loadUsers}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Professional Statistics Dashboard */}
        <div className="enterprise-stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-trend positive">
                <FiTrendingUp />
                Active System
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingUsers}</div>
              <div className="stat-label">Pending Review</div>
              <div className="stat-trend warning">
                <FiAlertCircle />
                Requires Action
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.approvedUsers}</div>
              <div className="stat-label">Active Users</div>
              <div className="stat-trend positive">
                <FiTrendingUp />
                Growing
              </div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <FiShield />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.adminUsers + stats.approverUsers}</div>
              <div className="stat-label">Admin Staff</div>
              <div className="stat-trend neutral">
                <FiSettings />
                System Operators
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ADVANCED FILTERING & SEARCH BAR
      ===================================================== */}
      <div className="enterprise-filters-bar">
        <div className="filters-left">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-dropdown">
              <FiFilter className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">⏳ Pending Approval</option>
                <option value="APPROVED">✅ Approved</option>
                <option value="REJECTED">❌ Rejected</option>
              </select>
            </div>

            <div className="filter-dropdown">
              <FiShield className="filter-icon" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">👑 Administrator</option>
                <option value="APPROVER">🔧 Approver</option>
                <option value="USER">👤 User</option>
              </select>
            </div>
          </div>
        </div>

        <div className="filters-right">
          <div className="view-mode-selector">
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <FiList />
              Table View
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
              Card View
            </button>
          </div>

          <button className="btn btn-export" onClick={handleExportUsers}>
            <FiDownload />
            Export Data
          </button>
        </div>
      </div>

      {/* =====================================================
          BULK OPERATIONS BAR
      ===================================================== */}
      {selectedUsers.length > 0 && (
        <div className="bulk-operations-bar">
          <div className="bulk-selection-info">
            <div className="selection-count">
              <FiCheckCircle />
              <span>{selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected</span>
            </div>
            <button
              className="clear-selection"
              onClick={() => setSelectedUsers([])}
            >
              <FiX />
              Clear Selection
            </button>
          </div>

          <div className="bulk-actions">
            <button
              className="bulk-action-btn approve"
              onClick={handleBulkApprove}
            >
              <FiUserCheck />
              Approve Selected
            </button>
            <button
              className="bulk-action-btn delete"
              onClick={handleBulkDelete}
            >
              <FiTrash2 />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}
      <div className="enterprise-content">
        {loading ? (
          <div className="enterprise-loading">
            <div className="loading-spinner-large"></div>
            <div className="loading-text">
              <h3>Loading User Data</h3>
              <p>Fetching user information from the system...</p>
            </div>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="enterprise-empty-state">
            <div className="empty-icon">
              <FiUsers />
            </div>
            <div className="empty-content">
              <h3>No Users Found</h3>
              <p>No users match your current search and filter criteria. Try adjusting your filters or search terms.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setRoleFilter('ALL');
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* =====================================================
              ENTERPRISE TABLE VIEW
          ===================================================== */
          <div className="enterprise-table-container">
            <div className="table-header">
              <div className="table-info">
                <span className="results-count">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </span>
              </div>
              <div className="table-controls">
                <div className="sort-indicator">
                  <FiChevronUp className={sortConfig.direction === 'asc' ? 'active' : ''} />
                  <FiChevronDown className={sortConfig.direction === 'desc' ? 'active' : ''} />
                  <span>Sort by {sortConfig.key}</span>
                </div>
              </div>
            </div>

            <div className="enterprise-table-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th className="selection-column">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(currentUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </th>
                    <th onClick={() => handleSort('name')} className="sortable">
                      User Profile
                      {sortConfig.key === 'name' && (
                        <span className="sort-arrow">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </th>
                    <th>Contact Information</th>
                    <th>Organization</th>
                    <th onClick={() => handleSort('role')} className="sortable">
                      Role & Access
                      {sortConfig.key === 'role' && (
                        <span className="sort-arrow">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Account Status
                      {sortConfig.key === 'status' && (
                        <span className="sort-arrow">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort('createdDate')} className="sortable">
                      Created Date
                      {sortConfig.key === 'createdDate' && (
                        <span className="sort-arrow">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                        />
                      </td>
                      <td>
                        <div className="user-profile-cell">
                          <div className="user-avatar-large">
                            <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-id">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-email">
                            <FiMail />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="organization-info">
                          <FiBriefcase />
                          <span>{user.organization}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge-xl ${user.role.toLowerCase()}`}>
                          {user.role === 'ADMIN' && <FiShield />}
                          {user.role === 'APPROVER' && <FiSettings />}
                          {user.role === 'USER' && <FiUser />}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge-xl ${user.status.toLowerCase()}`}>
                          {user.status === 'APPROVED' && <FiCheckCircle />}
                          {user.status === 'PENDING' && <FiClock />}
                          {user.status === 'REJECTED' && <FiXCircle />}
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="date-info">
                          <FiCalendar />
                          <span>
                            {user.createdDate ?
                              new Date(user.createdDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'
                            }
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="enterprise-actions">
                          <button
                            className="action-btn view"
                            onClick={() => openUserModal(user)}
                            title="View User Details"
                          >
                            <FiEye />
                          </button>

                          {user.status === "APPROVED" && (
                            <button
                              className="action-btn reset-password"
                              onClick={() => {
                                setSelectedUser(user);
                                setResetPasswordData({ newPassword: '', confirmPassword: '' });
                                setPasswordStrength({ score: 0, label: 'Weak', color: 'red' });
                                setShowResetPasswordModal(true);
                              }}
                              title="Reset User Password"
                            >
                              🔐
                            </button>
                          )}

                          {user.status === "PENDING" && (
                            <>
                              <button
                                className="action-btn approve"
                                onClick={() => handleApprove(user.id)}
                                title="Approve User"
                              >
                                <FiUserCheck />
                              </button>
                              <button
                                className="action-btn reject"
                                onClick={() => handleReject(user.id)}
                                title="Reject User"
                              >
                                <FiUserX />
                              </button>
                            </>
                          )}

                          {user.status === "APPROVED" && user.role === "USER" && (
                            <button
                              className="action-btn promote"
                              onClick={() => handlePromote(user.id)}
                              title="Promote to Approver"
                            >
                              <FiUserPlus />
                            </button>
                          )}

                          {user.role !== 'ADMIN' && (
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(user.id)}
                              title="Delete User"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="enterprise-pagination">
                <div className="pagination-info">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <FiChevronLeft />
                    Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =====================================================
              ENTERPRISE CARD VIEW
          ===================================================== */
          <div className="enterprise-grid-view">
            <div className="grid-header">
              <div className="grid-info">
                <span className="results-count">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </span>
              </div>
            </div>

            <div className="enterprise-cards-grid">
              {currentUsers.map(user => (
                <div
                  key={user.id}
                  className={`enterprise-user-card ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                >
                  <div className="card-selection">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </div>

                  <div className="card-header-section">
                    <div className="user-avatar-hero">
                      <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
                      <div className={`status-indicator-hero ${user.status.toLowerCase()}`}>
                        {user.status === 'APPROVED' && <FiCheckCircle />}
                        {user.status === 'PENDING' && <FiClock />}
                        {user.status === 'REJECTED' && <FiXCircle />}
                      </div>
                    </div>

                    <div className="user-basic-info">
                      <h3 className="card-user-name">{user.name}</h3>
                      <p className="card-user-id">User ID: {user.id}</p>
                    </div>
                  </div>

                  <div className="card-content-section">
                    <div className="info-row">
                      <FiMail className="info-icon" />
                      <span className="info-text">{user.email}</span>
                    </div>
                    <div className="info-row">
                      <FiBriefcase className="info-icon" />
                      <span className="info-text">{user.organization}</span>
                    </div>
                    <div className="info-row">
                      <FiCalendar className="info-icon" />
                      <span className="info-text">
                        {user.createdDate ?
                          new Date(user.createdDate).toLocaleDateString() : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="card-badges-section">
                    <span className={`role-badge-card ${user.role.toLowerCase()}`}>
                      {user.role === 'ADMIN' && <FiShield />}
                      {user.role === 'APPROVER' && <FiSettings />}
                      {user.role === 'USER' && <FiUser />}
                      {user.role}
                    </span>
                    <span className={`status-badge-card ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="card-actions-section">
                    <button
                      className="card-action-btn view"
                      onClick={() => openUserModal(user)}
                    >
                      <FiEye />
                      View Details
                    </button>

                    {user.status === "APPROVED" && (
                      <button
                        className="card-action-btn reset-password"
                        onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordData({ newPassword: '', confirmPassword: '' });
                          setPasswordStrength({ score: 0, label: 'Weak', color: 'red' });
                          setShowResetPasswordModal(true);
                        }}
                        title="Reset User Password"
                      >
                        🔐 Reset Password
                      </button>
                    )}

                    {user.status === "PENDING" && (
                      <div className="card-pending-actions">
                        <button
                          className="card-action-btn approve"
                          onClick={() => handleApprove(user.id)}
                        >
                          <FiUserCheck />
                          Approve
                        </button>
                        <button
                          className="card-action-btn reject"
                          onClick={() => handleReject(user.id)}
                        >
                          <FiUserX />
                          Reject
                        </button>
                      </div>
                    )}

                    {user.status === "APPROVED" && user.role === "USER" && (
                      <button
                        className="card-action-btn promote"
                        onClick={() => handlePromote(user.id)}
                      >
                        <FiUserPlus />
                        Promote
                      </button>
                    )}

                    {user.role !== 'ADMIN' && (
                      <button
                        className="card-action-btn delete"
                        onClick={() => handleDelete(user.id)}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Grid View */}
            {totalPages > 1 && (
              <div className="enterprise-pagination">
                <div className="pagination-info">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <FiChevronLeft />
                    Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          PASSWORD RESET MODAL
      ===================================================== */}
      {showResetPasswordModal && selectedUser && (
        <div className="enterprise-modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
          <div
            className="enterprise-password-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              padding: '20px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)'
            }}
          >
            <div className="modal-header-professional">
              <div className="modal-title">
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  🔐 Reset User Password
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Reset password for {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowResetPasswordModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body-professional" style={{ padding: '20px 0' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #d9d9d9',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #d9d9d9',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
                />
              </div>

              {/* Password Strength Indicator */}
              {resetPasswordData.newPassword && (
                <div className="password-strength" style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Password Strength: <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      height: '100%',
                      background: passwordStrength.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    Minimum requirements: 8+ chars, 1 uppercase, 1 number
                  </div>
                </div>
              )}

              {/* Password Match Indicator */}
              {resetPasswordData.newPassword && resetPasswordData.confirmPassword && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: resetPasswordData.newPassword === resetPasswordData.confirmPassword ? '#d1fae5' : '#fee2e2',
                  color: resetPasswordData.newPassword === resetPasswordData.confirmPassword ? '#065f46' : '#991b1b',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {resetPasswordData.newPassword === resetPasswordData.confirmPassword ?
                    '✓ Passwords match' : '✗ Passwords do not match'
                  }
                </div>
              )}
            </div>

            <div className="modal-footer-professional" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={
                  !resetPasswordData.newPassword ||
                  !resetPasswordData.confirmPassword ||
                  resetPasswordData.newPassword !== resetPasswordData.confirmPassword ||
                  passwordStrength.score < 3
                }
                style={{
                  background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: (
                    !resetPasswordData.newPassword ||
                    !resetPasswordData.confirmPassword ||
                    resetPasswordData.newPassword !== resetPasswordData.confirmPassword ||
                    passwordStrength.score < 3
                  ) ? 0.5 : 1
                }}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PROFESSIONAL USER DETAILS MODAL
      ===================================================== */}
      {showUserModal && selectedUser && (
        <div className="enterprise-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="enterprise-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-professional">
              <div className="modal-user-info">
                <div className="modal-avatar">
                  <span className="avatar-text">{selectedUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="modal-user-details">
                  <h2 className="modal-user-name">{selectedUser.name}</h2>
                  <p className="modal-user-email">{selectedUser.email}</p>
                  <div className="modal-user-badges">
                    <span className={`role-badge-modal ${selectedUser.role.toLowerCase()}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`status-badge-modal ${selectedUser.status.toLowerCase()}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowUserModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body-professional">
              <div className="user-details-sections">
                <div className="details-section">
                  <h4 className="section-title">
                    <FiUser />
                    Basic Information
                  </h4>
                  <div className="section-content">
                    <div className="detail-item-professional">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{selectedUser.name}</span>
                    </div>
                    <div className="detail-item-professional">
                      <span className="detail-label">Email Address</span>
                      <span className="detail-value">{selectedUser.email}</span>
                    </div>
                    <div className="detail-item-professional">
                      <span className="detail-label">Organization</span>
                      <span className="detail-value">{selectedUser.organization}</span>
                    </div>
                    <div className="detail-item-professional">
                      <span className="detail-label">User ID</span>
                      <span className="detail-value">{selectedUser.id}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="section-title">
                    <FiShield />
                    Account & Access
                  </h4>
                  <div className="section-content">
                    <div className="detail-item-professional">
                      <span className="detail-label">Account Status</span>
                      <span className={`detail-value status-chip ${selectedUser.status.toLowerCase()}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="detail-item-professional">
                      <span className="detail-label">User Role</span>
                      <span className={`detail-value role-chip ${selectedUser.role.toLowerCase()}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="detail-item-professional">
                      <span className="detail-label">Registration Date</span>
                      <span className="detail-value">
                        {selectedUser.createdDate ?
                          new Date(selectedUser.createdDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="section-title">
                    <FiSettings />
                    Permissions & Access Rights
                  </h4>
                  <div className="section-content">
                    <div className="permissions-matrix-professional">
                      <div className="permission-row">
                        <span className="permission-name">View Contracts</span>
                        <span className="permission-status granted">
                          <FiCheck />
                          Granted
                        </span>
                      </div>
                      <div className="permission-row">
                        <span className="permission-name">Approve Contracts</span>
                        <span className={`permission-status ${selectedUser.role === 'APPROVER' || selectedUser.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                          {selectedUser.role === 'APPROVER' || selectedUser.role === 'ADMIN' ?
                            <><FiCheck /> Granted</> :
                            <><FiX /> Denied</>
                          }
                        </span>
                      </div>
                      <div className="permission-row">
                        <span className="permission-name">Manage Users</span>
                        <span className={`permission-status ${selectedUser.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                          {selectedUser.role === 'ADMIN' ?
                            <><FiCheck /> Granted</> :
                            <><FiX /> Denied</>
                          }
                        </span>
                      </div>
                      <div className="permission-row">
                        <span className="permission-name">System Administration</span>
                        <span className={`permission-status ${selectedUser.role === 'ADMIN' ? 'granted' : 'denied'}`}>
                          {selectedUser.role === 'ADMIN' ?
                            <><FiCheck /> Granted</> :
                            <><FiX /> Denied</>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-professional">
              <button
                className="btn btn-outline"
                onClick={() => setShowUserModal(false)}
              >
                Close Details
              </button>

              <div className="modal-actions-professional">
                {selectedUser.status === "PENDING" && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => { handleApprove(selectedUser.id); setShowUserModal(false); }}
                    >
                      <FiUserCheck />
                      Approve User
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => { handleReject(selectedUser.id); setShowUserModal(false); }}
                    >
                      <FiUserX />
                      Reject User
                    </button>
                  </>
                )}

                {selectedUser.status === "APPROVED" && selectedUser.role === "USER" && (
                  <button
                    className="btn btn-warning"
                    onClick={() => { handlePromote(selectedUser.id); setShowUserModal(false); }}
                  >
                    <FiUserPlus />
                    Promote to Approver
                  </button>
                )}

                <button
                  className="btn btn-danger"
                  onClick={() => { handleDelete(selectedUser.id); setShowUserModal(false); }}
                >
                  <FiTrash2 />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ENTERPRISE ANALYTICS MODAL
      ===================================================== */}
      {showStatsModal && (
        <div className="enterprise-modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="enterprise-analytics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="analytics-header">
              <div className="analytics-title">
                <FiBarChart2 className="analytics-icon" />
                <div>
                  <h2>User Analytics Dashboard</h2>
                  <p>Comprehensive user statistics and insights</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowStatsModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card total">
                  <div className="card-icon">
                    <FiUsers />
                  </div>
                  <div className="card-data">
                    <div className="metric-value">{stats.totalUsers}</div>
                    <div className="metric-label">Total Users</div>
                    <div className="metric-change positive">
                      <FiTrendingUp />
                      +12% this month
                    </div>
                  </div>
                </div>

                <div className="analytics-card pending">
                  <div className="card-icon">
                    <FiClock />
                  </div>
                  <div className="card-data">
                    <div className="metric-value">{stats.pendingUsers}</div>
                    <div className="metric-label">Pending Review</div>
                    <div className="metric-change warning">
                      <FiAlertCircle />
                      Requires attention
                    </div>
                  </div>
                </div>

                <div className="analytics-card approved">
                  <div className="card-icon">
                    <FiCheckCircle />
                  </div>
                  <div className="card-data">
                    <div className="metric-value">{stats.approvedUsers}</div>
                    <div className="metric-label">Active Users</div>
                    <div className="metric-change positive">
                      <FiTrendingUp />
                      +8% this month
                    </div>
                  </div>
                </div>

                <div className="analytics-card admins">
                  <div className="card-icon">
                    <FiShield />
                  </div>
                  <div className="card-data">
                    <div className="metric-value">{stats.adminUsers}</div>
                    <div className="metric-label">Administrators</div>
                    <div className="metric-change neutral">
                      <FiSettings />
                      System operators
                    </div>
                  </div>
                </div>

                <div className="analytics-card approvers">
                  <div className="card-icon">
                    <FiSettings />
                  </div>
                  <div className="card-data">
                    <div className="metric-value">{stats.approverUsers}</div>
                    <div className="metric-label">Approvers</div>
                    <div className="metric-change neutral">
                      <FiUsers />
                      Contract reviewers
                    </div>
                  </div>
                </div>

                <div className="analytics-card rejected">
                  <div className="card-icon">
                    <FiXCircle />
                  </div>
                  <div className="card-data">
                    <div className="metric-value">{stats.rejectedUsers}</div>
                    <div className="metric-label">Rejected Users</div>
                    <div className="metric-change neutral">
                      <FiX />
                      Access denied
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-charts">
                <div className="chart-placeholder">
                  <FiBarChart2 />
                  <p>Advanced analytics and reporting charts will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );


}

export default UserManagement;
