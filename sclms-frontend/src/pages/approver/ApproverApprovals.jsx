import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";
import { FiCheckCircle, FiXCircle, FiEye, FiClock, FiFileText, FiTrendingUp, FiRefreshCw, FiFilter } from "react-icons/fi";
import "../../styles/approver-approvals.css";

function ApproverApprovals() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingContracts, setPendingContracts] = useState([]);
  const [approvedContracts, setApprovedContracts] = useState([]);
  const [rejectedContracts, setRejectedContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [kpiData, setKpiData] = useState({
    totalApproved: 0,
    totalRejected: 0,
    pendingCount: 0,
    avgApprovalTime: 0
  });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPendingContracts(),
        loadApprovedContracts(),
        loadRejectedContracts(),
        loadKPI()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingContracts = async () => {
    try {
      const data = await apiRequest(`contracts/approver/pending`);
      setPendingContracts(data);
    } catch (error) {
      console.error("Error loading pending contracts:", error);
    }
  };

  const loadApprovedContracts = async () => {
    try {
      const data = await apiRequest(`contracts/approver/approved`);
      setApprovedContracts(data);
    } catch (error) {
      console.error("Error loading approved contracts:", error);
    }
  };

  const loadRejectedContracts = async () => {
    try {
      const data = await apiRequest(`contracts/approver/rejected`);
      setRejectedContracts(data);
    } catch (error) {
      console.error("Error loading rejected contracts:", error);
    }
  };

  const loadKPI = async () => {
    try {
      const data = await apiRequest(`contracts/approver/kpi`);
      setKpiData(data);
    } catch (error) {
      console.error("Error loading KPI data:", error);
    }
  };

  const handleApprove = async (contractId, comment = "") => {
    try {
      setActionLoading(contractId);
      await apiRequest(`contracts/approve/${contractId}`, {
        method: 'PUT',
        body: {
          actorId: user.id,
          comment: comment || "Approved by approver"
        }
      });

      await loadAllData();
      showSuccess("Contract approved successfully!");
    } catch (error) {
      console.error("Error approving contract:", error);
      showError("Failed to approve contract. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contractId, reason = "") => {
    if (!window.confirm("Are you sure you want to reject this contract?")) return;

    try {
      setActionLoading(contractId);
      await apiRequest(`contracts/reject/${contractId}`, {
        method: 'PUT',
        body: {
          actorId: user.id,
          reason: reason || "Rejected by approver"
        }
      });

      await loadAllData();
      showSuccess("Contract rejected successfully!");
    } catch (error) {
      console.error("Error rejecting contract:", error);
      showError("Failed to reject contract. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FiClock className="status-icon pending" />;
      case 'APPROVED': return <FiCheckCircle className="status-icon approved" />;
      case 'REJECTED': return <FiXCircle className="status-icon rejected" />;
      default: return <FiFileText className="status-icon" />;
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

  const renderContractCard = (contract, showActions = false) => (
    <div key={contract.id} className="contract-approval-card">
      <div className="contract-header">
        <div className="contract-title-section">
          <h3 className="contract-title">{contract.title}</h3>
          <div className="contract-meta">
            <span className="contract-type">{contract.contractType}</span>
            <span className="contract-date">
              {contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        <div className="contract-status">
          {getStatusIcon(contract.status)}
          <span className={getStatusBadge(contract.status)}>{contract.status}</span>
        </div>
      </div>

      <div className="contract-content">
        <div className="contract-organizations">
          <div className="org-section">
            <span className="org-label">From:</span>
            <span className="org-name">{contract.fromOrg}</span>
          </div>
          <div className="org-section">
            <span className="org-label">To:</span>
            <span className="org-name">{contract.toOrg}</span>
          </div>
        </div>

        {contract.description && (
          <div className="contract-description">
            <p>{contract.description.length > 150
              ? `${contract.description.substring(0, 150)}...`
              : contract.description}</p>
          </div>
        )}

        <div className="contract-dates">
          <div className="date-item">
            <span className="date-label">Start Date:</span>
            <span className="date-value">
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="date-item">
            <span className="date-label">End Date:</span>
            <span className="date-value">
              {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {contract.approverComments && (
          <div className="contract-comments">
            <strong>Approver Comments:</strong>
            <p>{contract.approverComments}</p>
          </div>
        )}

        {contract.rejectionReason && (
          <div className="contract-rejection">
            <strong>Rejection Reason:</strong>
            <p>{contract.rejectionReason}</p>
          </div>
        )}
      </div>

      <div className="contract-actions">
        <button
          className="btn-view"
          onClick={() => navigate(`/approver/contracts/view/${contract.id}`)}
        >
          <FiEye />
          View Details
        </button>

        {/* Approve/Reject buttons removed for security - only available in View Details page */}
      </div>
    </div>
  );

  const renderContractsList = (contracts, showActions = false) => (
    <div className="contracts-list">
      {contracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No contracts found</h3>
          <p>There are no {activeTab} contracts at this time.</p>
        </div>
      ) : (
        contracts.map(contract => renderContractCard(contract, showActions))
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Please log in to view approvals.</p>
      </div>
    );
  }

  return (
    <div className="approvals-dashboard">

      {/* Header Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="page-title">Contract Approval Center</h1>
          <p className="welcome-subtitle">
            Review and process contract approval requests from your organization
          </p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={loadAllData} disabled={loading}>
            {loading ? <FiRefreshCw className="spinning" /> : <FiRefreshCw />}
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Metrics Section */}
      <div className="kpi-grid">
        <div className="kpi-card pending">
          <div className="kpi-icon">
            <FiClock />
          </div>
          <div className="kpi-content">
            <h3>{pendingContracts.length}</h3>
            <p>Pending Reviews</p>
            <span className="kpi-trend">Requires attention</span>
          </div>
        </div>

        <div className="kpi-card approved">
          <div className="kpi-icon">
            <FiCheckCircle />
          </div>
          <div className="kpi-content">
            <h3>{kpiData.totalApproved || approvedContracts.length}</h3>
            <p>Approved This Month</p>
            <span className="kpi-trend positive">+12% from last month</span>
          </div>
        </div>

        <div className="kpi-card rejected">
          <div className="kpi-icon">
            <FiXCircle />
          </div>
          <div className="kpi-content">
            <h3>{kpiData.totalRejected || rejectedContracts.length}</h3>
            <p>Rejected This Month</p>
            <span className="kpi-trend negative">-5% from last month</span>
          </div>
        </div>

        <div className="kpi-card efficiency">
          <div className="kpi-icon">
            <FiTrendingUp />
          </div>
          <div className="kpi-content">
            <h3>{kpiData.avgApprovalTime || '2.3'} days</h3>
            <p>Avg. Approval Time</p>
            <span className="kpi-trend positive">Within SLA</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Section */}
      <div className="approval-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock />
          Pending ({pendingContracts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <FiCheckCircle />
          Approved ({approvedContracts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <FiXCircle />
          Rejected ({rejectedContracts.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="approval-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading approval data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'pending' && renderContractsList(pendingContracts, true)}
            {activeTab === 'approved' && renderContractsList(approvedContracts, false)}
            {activeTab === 'rejected' && renderContractsList(rejectedContracts, false)}
          </>
        )}
      </div>
    </div>
  );
}

export default ApproverApprovals;
