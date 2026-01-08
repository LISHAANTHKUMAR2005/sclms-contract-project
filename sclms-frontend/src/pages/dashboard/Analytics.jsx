import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";

function Analytics() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user contracts for analytics
      const contracts = await api.get(`contracts/my/${user.id}`);

      // Calculate stats
      const total = contracts.length;
      const approved = contracts.filter(c => c.status === "APPROVED").length;
      const pending = contracts.filter(c => c.status === "PENDING").length;
      const rejected = contracts.filter(c => c.status === "REJECTED").length;

      setStats({ total, approved, pending, rejected });
      setRecentContracts(contracts.slice(0, 5)); // Show 5 recent contracts for activity summary

    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h3>⚠️ Error Loading Analytics</h3>
        <p>{error}</p>
        <button onClick={loadAnalytics} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Contract Analytics</h1>
        <p>Detailed insights into your contract management performance</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Contracts Created</h3>
          <div className="metric-large">{stats.total}</div>
        </div>

        <div className="analytics-card">
          <h3>Contracts Approved</h3>
          <div className="metric-large">{stats.approved}</div>
        </div>

        <div className="analytics-card">
          <h3>Contracts Rejected</h3>
          <div className="metric-large">{stats.rejected}</div>
        </div>

        <div className="analytics-card">
          <h3>Pending Contracts</h3>
          <div className="metric-large">{stats.pending}</div>
        </div>
      </div>

      <div className="analytics-details">
        <div className="analytics-section">
          <h3>📈 Contract Overview</h3>
          <div className="metric-item">
            <span>Approval Rate</span>
            <span className="metric-value">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="metric-item">
            <span>Pending Review</span>
            <span className="metric-value">{stats.pending} contracts</span>
          </div>
        </div>

        <div className="analytics-section">
          <h3>🎯 Recent Activity Summary</h3>
          {recentContracts.length > 0 ? (
            <div className="recent-activity-list">
              {recentContracts.map(contract => (
                <div key={contract.id} className="activity-item">
                  <div className="activity-icon">
                    {contract.status === 'APPROVED' ? '✅' :
                     contract.status === 'PENDING' ? '⏳' :
                     contract.status === 'REJECTED' ? '❌' : '📄'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">
                      "{contract.title}" - {contract.status.toLowerCase()}
                    </p>
                    <p className="activity-meta">
                      {contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'N/A'} •
                      {contract.fromOrg === user?.organization ? `Sent to ${contract.toOrg}` : `Received from ${contract.fromOrg}`}
                    </p>
                  </div>
                  <div className="activity-actions">
                    <Link to={`/dashboard/contracts/view/${contract.id}`} className="activity-link">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-analytics">
              <p>No contract activity yet</p>
              <p>Create your first contract to start tracking analytics!</p>
              <Link to="/dashboard/contracts/create" className="btn-primary">
                Create Contract
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
