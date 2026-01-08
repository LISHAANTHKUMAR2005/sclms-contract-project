import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { FiRefreshCw } from "react-icons/fi";

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentContracts, setRecentContracts] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user contracts
      const contracts = await api.get(`contracts/my/${user.id}`);

      // Calculate stats
      const total = contracts.length;
      const approved = contracts.filter(c => c.status === "APPROVED").length;
      const pending = contracts.filter(c => c.status === "PENDING").length;
      const rejected = contracts.filter(c => c.status === "REJECTED").length;

      setStats({ total, approved, pending, rejected });
      setRecentContracts(contracts.slice(0, 3)); // Show 3 recent contracts

    } catch (err) {
      console.error("Error loading dashboard:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Unable to connect to server. Please check if the backend is running on port 8082.");
      } else {
        setError(err.message || "Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };



  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>⚠️ Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {user.name}!</h1>
          <p>Manage your contracts and view your activity overview</p>
        </div>
        <div className="welcome-actions">
          <button onClick={refreshData} className="btn-primary">
            <FiRefreshCw />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-row">
        <div className="stat">
          <p>Total Contracts</p>
          <h2>{stats.total}</h2>
        </div>
        <div className="stat ok">
          <p>Approved</p>
          <h2>{stats.approved}</h2>
        </div>
        <div className="stat warn">
          <p>Pending</p>
          <h2>{stats.pending}</h2>
        </div>
        <div className="stat danger">
          <p>Rejected</p>
          <h2>{stats.rejected}</h2>
        </div>
      </div>

  

      {/* Recent Activities */}
      <div className="dashboard-section">
        <h2>📈 Recent Activities</h2>
        <div className="recent-activities">
          {recentContracts.length > 0 ? (
            recentContracts.map(contract => (
              <div key={contract.id} className="activity-item">
                <div className="activity-icon">
                  {contract.status === 'APPROVED' ? '✅' :
                   contract.status === 'PENDING' ? '⏳' :
                   contract.status === 'REJECTED' ? '❌' : '📄'}
                </div>
                <div className="activity-content">
                  <p className="activity-title">
                    Contract "{contract.title}" {contract.status.toLowerCase()}
                  </p>
                  <p className="activity-meta">
                    {contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'N/A'} •
                    {contract.fromOrg === user?.organization ? `Sent to ${contract.toOrg}` : `Received from ${contract.fromOrg}`}
                  </p>
                </div>
                <div className="activity-actions">
                  <Link to={`contracts/view/${contract.id}`} className="activity-link">
                    View →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-activities">
              <p>No recent activities</p>
              <p>Create your first contract to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
