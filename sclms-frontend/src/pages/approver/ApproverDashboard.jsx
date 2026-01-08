import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { createDebugLogger } from "../../utils/debug";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiFileText,
  FiRefreshCw,
  FiEye
} from "react-icons/fi";
import "../../styles/approver-dashboard.css";

const debugLogger = createDebugLogger('ApproverDashboard');

export default function ApproverDashboard() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD DATA (WITH TOKEN)
  // =========================
  const loadData = async () => {
    debugLogger.log("Starting data load");
    setLoading(true);

    try {
      const [p, a, r, h] = await Promise.all([
        apiRequest("contracts/approver/pending"),
        apiRequest("contracts/approver/approved"),
        apiRequest("contracts/approver/rejected"),
        apiRequest("contracts/activity/approver")
      ]);

      setPending(Array.isArray(p) ? p : []);
      setApproved(Array.isArray(a) ? a : []);
      setRejected(Array.isArray(r) ? r : []);
      setActivity(Array.isArray(h) ? h : []);

    } catch (err) {
      debugLogger.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // STATISTICS
  // =========================
  const stats = {
    pendingCount: pending.length,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    totalHandled: approved.length + rejected.length,
    approvalRate:
      approved.length + rejected.length > 0
        ? Math.round((approved.length / (approved.length + rejected.length)) * 100)
        : 0
  };

  const quickActions = [
    {
      title: "Review Pending Contracts",
      description: `${stats.pendingCount} contracts awaiting your approval`,
      action: () => navigate('/approver/approvals'),
      icon: <FiClock />,
      color: 'warning'
    },
    {
      title: "View All Contracts",
      description: "Browse and manage all contract records",
      action: () => navigate('/approver/contracts'),
      icon: <FiFileText />,
      color: 'info'
    },
    {
      title: "Approval Analytics",
      description: "View detailed approval statistics and trends",
      action: () => navigate('/dashboard/analytics'),
      icon: <FiTrendingUp />,
      color: 'primary'
    }
  ];

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  // =========================
  // UI BELOW
  // =========================
  return (
    <div className="approver-dashboard-container">

      <div className="dashboard-header-section">
        <div className="header-content-block">
          <h1 className="dashboard-main-heading">Welcome back, Approver</h1>
          <p className="dashboard-subtitle">
            Review and manage contract approvals for your organization
          </p>
        </div>

        <div className="header-actions-block">
          <button
            className="refresh-dashboard-btn"
            onClick={loadData}
            disabled={loading}
          >
            {loading
              ? <FiRefreshCw className="spinning-icon" />
              : <FiRefreshCw />}
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-cards-grid">
        <div className="metric-card warning-card">
          <div className="metric-card-icon"><FiClock /></div>
          <div className="metric-card-content">
            <h3 className="metric-value">{stats.pendingCount}</h3>
            <p className="metric-label">Pending Reviews</p>
            <span className="metric-status">Requires attention</span>
          </div>
        </div>

        <div className="metric-card success-card">
          <div className="metric-card-icon"><FiCheckCircle /></div>
          <div className="metric-card-content">
            <h3 className="metric-value">{stats.approvedCount}</h3>
            <p className="metric-label">Approved This Month</p>
            <span className="metric-status positive">
              {stats.approvalRate}% approval rate
            </span>
          </div>
        </div>

        <div className="metric-card danger-card">
          <div className="metric-card-icon"><FiXCircle /></div>
          <div className="metric-card-content">
            <h3 className="metric-value">{stats.rejectedCount}</h3>
            <p className="metric-label">Rejected This Month</p>
            <span className="metric-status negative">
              {stats.totalHandled > 0
                ? Math.round((stats.rejectedCount / stats.totalHandled) * 100)
                : 0}% rejection rate
            </span>
          </div>
        </div>

        <div className="metric-card info-card">
          <div className="metric-card-icon"><FiTrendingUp /></div>
          <div className="metric-card-content">
            <h3 className="metric-value">{stats.totalHandled}</h3>
            <p className="metric-label">Total Processed</p>
            <span className="metric-status positive">
              Contracts handled this month
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main-content-grid">

        {/* Quick Actions */}
        <div className="dashboard-section-card full-width-section">
          <div className="section-card-header">
            <h2 className="section-card-title">🚀 Quick Actions</h2>
            <p className="section-card-subtitle">Most frequently used approval tasks</p>
          </div>

          <div className="quick-actions-cards-grid">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`quick-action-card ${action.color}-action`}
                onClick={action.action}
              >
                <div className="action-card-icon">{action.icon}</div>
                <div className="action-card-content">
                  <h4 className="action-card-title">{action.title}</h4>
                  <p className="action-card-description">{action.description}</p>
                </div>
                <div className="action-card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Recent Activities</h2>
            <p className="section-card-subtitle">Latest contract approval actions</p>
          </div>

          <div className="recent-activities-container">
            {loading ? (
              <div className="activities-loading-state">
                <div className="loading-spinner"></div>
                <p>Loading recent activities...</p>
              </div>
            ) : activity.length > 0 ? (
              activity.slice(0, 3).map((item, i) => (
                <div key={i} className="activity-item-card">
                  <div className="activity-item-icon">
                    {item.action === "APPROVED" ? "✅" :
                     item.action === "REJECTED" ? "❌" : "📝"}
                  </div>

                  <div className="activity-item-content">
                    <p className="activity-item-text">
                      {item.action} — {item.contractTitle}
                    </p>
                    <span className="activity-item-time">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>

                  <Link
                    to={`/approver/contracts/view/${item.contractId}`}
                    className="activity-item-link"
                  >
                    <FiEye />
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-activities-message">
                <p>No recent activities to display</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
