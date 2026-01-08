import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import "../../styles/contract-details.css";

function ApproverContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);

  useEffect(() => {
    if (!id) return;
    loadContractDetails();
  }, [id]);

  const loadContractDetails = async () => {
    try {
      setLoading(true);
      const [contractResponse, historyResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/contracts/${id}`),
        fetch(`http://localhost:8080/api/contracts/history/${id}`)
      ]);

      if (contractResponse.ok) {
        const contractData = await contractResponse.json();
        setContract(contractData);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setApprovalHistory(historyData);
      }
    } catch (error) {
      console.error("Error loading contract details:", error);
      alert("Failed to load contract details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (comment = "") => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:8080/api/contracts/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actorId: user.id,
          comment: comment || "Approved by approver"
        })
      });

      if (response.ok) {
        alert("Contract approved successfully!");
        navigate("/approver/approvals");
      } else {
        throw new Error("Failed to approve contract");
      }
    } catch (error) {
      console.error("Error approving contract:", error);
      alert("Failed to approve contract. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason = "") => {
    if (!window.confirm("Are you sure you want to reject this contract?")) return;

    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:8080/api/contracts/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actorId: user.id,
          reason: reason || "Rejected by approver"
        })
      });

      if (response.ok) {
        alert("Contract rejected successfully!");
        navigate("/approver/approvals");
      } else {
        throw new Error("Failed to reject contract");
      }
    } catch (error) {
      console.error("Error rejecting contract:", error);
      alert("Failed to reject contract. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="view-wrapper">
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading contract details...</p>
      </div>
    </div>
  );

  if (!contract) return (
    <div className="view-wrapper">
      <div className="page-error">
        <h2>Contract not found</h2>
        <p>The contract you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/approver/approvals" className="btn-secondary">← Back to Approvals</Link>
      </div>
    </div>
  );

  return (
    <div className="view-wrapper">
      {/* Breadcrumb */}
      <div className="breadcrumbs">
        <Link to="/approver/dashboard">Dashboard</Link> ›
        <Link to="/approver/approvals"> Approvals</Link> ›
        <span> Contract Details</span>
      </div>

      {/* Header */}
      <div className="view-header">
        <h1>{contract.title}</h1>
        <span className={`badge ${contract.status?.toLowerCase()}`}>
          {contract.status}
        </span>
      </div>

      {/* Meta */}
      <div className="meta-row">
        <p><b>From:</b> {contract.fromOrg}</p>
        <p><b>To:</b> {contract.toOrg}</p>
        <p><b>Created:</b> {contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'N/A'}</p>
      </div>

      {/* Main Panel */}
      <div className="panel">
        <h3>Contract Details</h3>

        <div className="grid-2">
          <div className="field">
            <label>Contract Type</label>
            <p>{contract.contractType || "—"}</p>
          </div>

          <div className="field">
            <label>Status</label>
            <p>{contract.status}</p>
          </div>

          <div className="field">
            <label>Start Date</label>
            <p>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—"}</p>
          </div>

          <div className="field">
            <label>End Date</label>
            <p>{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}</p>
          </div>

          <div className="field">
            <label>Created By</label>
            <p>{contract.createdBy || "—"}</p>
          </div>

          <div className="field">
            <label>Approved By</label>
            <p>{contract.approvedBy || "—"}</p>
          </div>
        </div>

        <div className="description-box">
          <label>Description</label>
          <p>{contract.description || "No description provided"}</p>
        </div>

        {contract.approverComments && (
          <div className="field">
            <label>Approver Comments</label>
            <p>{contract.approverComments}</p>
          </div>
        )}

        {contract.rejectionReason && (
          <div className="field">
            <label>Rejection Reason</label>
            <p>{contract.rejectionReason}</p>
          </div>
        )}

        {contract.documentUrl && (
          <div className="document-section">
            <div className="doc-header">
              <h3>Attached Document</h3>
              <div className="doc-actions">
                <a
                  href={`http://localhost:8080/api/contracts/file/${contract.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Open in New Tab
                </a>
                <a
                  href={`http://localhost:8080/api/contracts/file/${contract.id}`}
                  download={contract.documentName}
                  className="btn-secondary"
                >
                  Download
                </a>
              </div>
            </div>

            <iframe
              src={`http://localhost:8080/api/contracts/file/${contract.id}`}
              className="pdf-preview"
              title="Contract Document"
            />
          </div>
        )}

        {/* Approval History */}
        {approvalHistory.length > 0 && (
          <div className="approval-history-section">
            <h3>Approval History</h3>
            <div className="history-list">
              {approvalHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    {item.action === 'CREATED' && '📄'}
                    {item.action === 'APPROVED' && '✅'}
                    {item.action === 'REJECTED' && '❌'}
                  </div>
                  <div className="history-content">
                    <p className="history-action">{item.action}</p>
                    <p className="history-actor">By: {item.actor} ({item.actorRole})</p>
                    {item.comment && <p className="history-comment">Comment: {item.comment}</p>}
                    {item.reason && <p className="history-reason">Reason: {item.reason}</p>}
                    <span className="history-time">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approval Actions - Only show for PENDING contracts */}
      {contract.status === 'PENDING' && (
        <div className="approval-actions-section">
          <h3>Approval Decision</h3>
          <div className="approval-actions-grid">
            <button
              className="btn-approve-large"
              onClick={() => handleApprove()}
              disabled={actionLoading}
            >
              {actionLoading ? <FiRefreshCw className="spinning" /> : <FiCheckCircle />}
              Approve Contract
            </button>
            <button
              className="btn-reject-large"
              onClick={() => handleReject()}
              disabled={actionLoading}
            >
              {actionLoading ? <FiRefreshCw className="spinning" /> : <FiXCircle />}
              Reject Contract
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="actions-row">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back to Approvals
        </button>
      </div>
    </div>
  );
}

export default ApproverContractDetails;
