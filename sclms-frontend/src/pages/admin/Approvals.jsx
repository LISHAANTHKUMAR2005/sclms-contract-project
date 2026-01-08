import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { FiCheckCircle, FiXCircle, FiEye, FiClock, FiUser, FiTrendingUp, FiRefreshCw, FiUsers, FiUserCheck, FiUserX, FiSearch, FiFilter, FiGrid, FiList, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiAlertTriangle, FiBarChart2, FiDownload, FiSettings, FiEdit3 } from "react-icons/fi";

function Approvals() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // cards, table
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    rejectedUsers: 0,
    approvalRate: 0,
    avgApprovalTime: 0
  });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [allUsers, searchTerm, activeTab]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAllUsers(),
        loadPendingUsers(),
        loadUserStats()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await apiRequest(`admin/users`);
      setAllUsers(data);
      setApprovedUsers(data.filter(u => u.status === 'APPROVED'));
      setRejectedUsers(data.filter(u => u.status === 'REJECTED'));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const data = await apiRequest(`admin/pending-users`);
      setPendingUsers(data);
    } catch (error) {
      console.error("Error loading pending users:", error);
    }
  };

  const loadUserStats = async () => {
    try {
      const data = await apiRequest(`admin/users/statistics`);
      setUserStats(data);
    } catch (error) {
      console.error("Error loading user stats:", error);
      setUserStats({
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === 'APPROVED').length,
        pendingUsers: pendingUsers.length,
        rejectedUsers: allUsers.filter(u => u.status === 'REJECTED').length,
        approvalRate: allUsers.length > 0 ? Math.round((allUsers.filter(u => u.status === 'APPROVED').length / allUsers.length) * 100) : 0,
        avgApprovalTime: 0
      });
    }
  };

  const filterUsers = () => {
    let usersToFilter = [];
    switch (activeTab) {
      case 'pending':
        usersToFilter = pendingUsers;
        break;
      case 'approved':
        usersToFilter = approvedUsers;
        break;
      case 'rejected':
        usersToFilter = rejectedUsers;
        break;
      default:
        usersToFilter = allUsers;
    }

    let filtered = usersToFilter.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.organization.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  };



  const handleApproveUser = async (userId) => {
    try {
      setActionLoading(userId);
      await apiRequest(`admin/approve/${userId}`, {
        method: 'PUT'
      });
      await loadAllData();
      alert("User approved successfully!");
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this user?")) return;

    try {
      setActionLoading(userId);
      await apiRequest(`admin/reject/${userId}`, {
        method: 'PUT'
      });
      await loadAllData();
      alert("User rejected successfully!");
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Failed to reject user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FiClock className="status-icon pending" />;
      case 'APPROVED': return <FiCheckCircle className="status-icon approved" />;
      case 'REJECTED': return <FiXCircle className="status-icon rejected" />;
      default: return <FiUser className="status-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'PENDING': 'status-badge pending',
      'APPROVED': 'status-badge approved',
      'REJECTED': 'status-badge rejected'
    };
    return classes[status] || 'status-badge';
  };

  const renderUserCard = (user, showActions = false) => (
    <div key={user.id} className="user-approval-card">
      <div className="user-header">
        <div className="user-info-section">
          <h3 className="user-name">{user.name}</h3>
          <div className="user-meta">
            <span className="user-email">{user.email}</span>
            <span className="user-org">{user.organization}</span>
          </div>
        </div>
        <div className="user-status">
          {getStatusIcon(user.status)}
          <span className={getStatusBadge(user.status)}>{user.status}</span>
        </div>
      </div>

      <div className="user-content">
        <div className="user-details">
          <div className="detail-item">
            <span className="detail-label">Role:</span>
            <span className="detail-value">{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Organization:</span>
            <span className="detail-value">{user.organization}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registration Date:</span>
            <span className="detail-value">
              {user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="user-actions">
        <button
          className="btn-view"
          onClick={() => navigate(`/admin/users/${user.id}`)}
        >
          <FiEye />
          View Profile
        </button>

        <button
          className="btn-edit"
          onClick={() => navigate(`/admin/users/${user.id}`)}
        >
          <FiEdit3 />
          Edit User
        </button>

        {showActions && (
          <div className="approval-actions">
            <button
              className="btn-approve"
              onClick={() => handleApproveUser(user.id)}
              disabled={actionLoading === user.id}
            >
              {actionLoading === user.id ? <FiRefreshCw className="spinning" /> : <FiCheckCircle />}
              Approve
            </button>
            <button
              className="btn-reject"
              onClick={() => handleRejectUser(user.id)}
              disabled={actionLoading === user.id}
            >
              {actionLoading === user.id ? <FiRefreshCw className="spinning" /> : <FiXCircle />}
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsersList = (users, showActions = false) => (
    <div className="users-list">
      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>There are no {activeTab} users at this time.</p>
        </div>
      ) : (
        users.map(user => renderUserCard(user, showActions))
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Please log in to view user approvals.</p>
      </div>
    );
  }

  return (
    <div className="approvals-dashboard">

      {/* Header */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="page-title">User Approval Center</h1>
          <p className="welcome-subtitle">
            Review and approve new user registration requests
          </p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={loadAllData} disabled={loading}>
            {loading ? <FiRefreshCw className="spinning" /> : <FiRefreshCw />}
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card pending">
          <div className="kpi-icon">
            <FiClock />
          </div>
          <div className="kpi-content">
            <h3>{userStats.pendingUsers || pendingUsers.length}</h3>
            <p>Pending Approvals</p>
            <span className="kpi-trend">Requires attention</span>
          </div>
        </div>

        <div className="kpi-card approved">
          <div className="kpi-icon">
            <FiUserCheck />
          </div>
          <div className="kpi-content">
            <h3>{userStats.activeUsers || approvedUsers.length}</h3>
            <p>Active Users</p>
            <span className="kpi-trend positive">Approved accounts</span>
          </div>
        </div>

        <div className="kpi-card rejected">
          <div className="kpi-icon">
            <FiUserX />
          </div>
          <div className="kpi-content">
            <h3>{userStats.rejectedUsers || rejectedUsers.length}</h3>
            <p>Rejected Users</p>
            <span className="kpi-trend negative">Access denied</span>
          </div>
        </div>

        <div className="kpi-card efficiency">
          <div className="kpi-icon">
            <FiTrendingUp />
          </div>
          <div className="kpi-content">
            <h3>{userStats.totalUsers || allUsers.length}</h3>
            <p>Total Registrations</p>
            <span className="kpi-trend positive">Growing community</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="approval-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock />
          Pending ({pendingUsers.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <FiCheckCircle />
          Approved ({approvedUsers.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <FiXCircle />
          Rejected ({rejectedUsers.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="approval-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading user approval data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'pending' && renderUsersList(pendingUsers, true)}
            {activeTab === 'approved' && renderUsersList(approvedUsers, false)}
            {activeTab === 'rejected' && renderUsersList(rejectedUsers, false)}
          </>
        )}
      </div>
    </div>
  );
}

export default Approvals;
