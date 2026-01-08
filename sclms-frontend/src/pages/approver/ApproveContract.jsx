import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import {
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Building2,
  User,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { showToast } from "../../utils/toast";
import "../../styles/approveContract.css";

export default function ApproveContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [contract, setContract] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState("");
  const [reason, setReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadContractData();
  }, [id]);

  const loadContractData = async () => {
    try {
      const [contractData, historyData] = await Promise.all([
        apiRequest(`contracts/${id}`),
        apiRequest(`contracts/history/${id}`)
      ]);

      setContract(contractData);
      setHistory(historyData);
    } catch (error) {
      showToast("Error loading contract data", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!comments.trim()) {
      showToast("Please add approval comments", "error");
      return;
    }

    setProcessing(true);
    try {
      await apiRequest(`contracts/approve/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          comment: comments.trim()
        })
      });

      showToast("Contract approved successfully!", "success");

      // Trigger notification refresh for contract creator
      window.dispatchEvent(new Event("notifications-refresh"));

      setTimeout(() => navigate("/approver/contracts"), 1500);
    } catch (error) {
      showToast("Error approving contract", "error");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      showToast("Please provide a rejection reason", "error");
      return;
    }

    setProcessing(true);
    try {
      await apiRequest(`contracts/reject/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          comment: comments.trim() || "Rejected",
          reason: reason.trim()
        })
      });

      showToast("Contract rejected", "success");

      // Trigger notification refresh for contract creator
      window.dispatchEvent(new Event("notifications-refresh"));

      setTimeout(() => navigate("/approver/contracts"), 1500);
    } catch (error) {
      showToast("Error rejecting contract", "error");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadDocument = () => {
    if (contract?.documentName) {
      window.open(`http://localhost:8082/api/contracts/file/${contract.id}`, '_blank');
    }
  };

  const viewDocument = () => {
    if (contract?.documentName) {
      window.open(`http://localhost:8082/api/contracts/file/${contract.id}`, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: "status-pending", text: "Pending Review" },
      APPROVED: { class: "status-approved", text: "Approved" },
      REJECTED: { class: "status-rejected", text: "Rejected" }
    };
    return badges[status] || badges.PENDING;
  };

  if (loading) {
    return (
      <div className="approve-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="approve-container">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Contract Not Found</h3>
          <button onClick={() => navigate("/approver/contracts")} className="btn-secondary">
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(contract.status);
  const isPending = contract.status === "PENDING";

  return (
    <div className="approve-container">
      {/* Header Section */}
      <div className="approve-header">
        <button onClick={() => navigate("/approver/contracts")} className="back-btn">
          <ArrowLeft size={20} />
          Back to Contracts
        </button>
        <div className="header-info">
          <div className="header-left">
            <h1>{contract.title}</h1>
            <span className={`status-badge ${statusBadge.class}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="header-right">
            <span className="contract-id">ID: #{contract.id}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="approve-content">
        {/* Left Panel - Contract Details */}
        <div className="content-main">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={activeTab === "details" ? "tab-active" : ""}
              onClick={() => setActiveTab("details")}
            >
              Contract Details
            </button>
            <button 
              className={activeTab === "history" ? "tab-active" : ""}
              onClick={() => setActiveTab("history")}
            >
              Approval History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "details" ? (
            <div className="details-panel">
              {/* Organizations Section */}
              <div className="detail-section">
                <h3 className="section-title">Organizations</h3>
                <div className="org-grid">
                  <div className="org-card">
                    <div className="org-icon">
                      <Building2 size={20} />
                    </div>
                    <div className="org-info">
                      <label>From Organization</label>
                      <p>{contract.fromOrg}</p>
                    </div>
                  </div>
                  <div className="org-card">
                    <div className="org-icon">
                      <Building2 size={20} />
                    </div>
                    <div className="org-info">
                      <label>To Organization</label>
                      <p>{contract.toOrg}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Information */}
              <div className="detail-section">
                <h3 className="section-title">Contract Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>
                      <FileText size={16} />
                      Contract Type
                    </label>
                    <p>{contract.contractType}</p>
                  </div>
                  <div className="info-item">
                    <label>
                      <Calendar size={16} />
                      Start Date
                    </label>
                    <p>{formatDate(contract.startDate)}</p>
                  </div>
                  <div className="info-item">
                    <label>
                      <Calendar size={16} />
                      End Date
                    </label>
                    <p>{formatDate(contract.endDate)}</p>
                  </div>
                  <div className="info-item">
                    <label>
                      <Clock size={16} />
                      Created Date
                    </label>
                    <p>{formatDate(contract.createdDate)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <h3 className="section-title">Description</h3>
                <div className="description-box">
                  <p>{contract.description || "No description provided"}</p>
                </div>
              </div>

              {/* Document Section */}
              {contract.documentName && (
                <div className="detail-section">
                  <h3 className="section-title">Attached Document</h3>
                  <div className="document-card">
                    <div className="doc-info">
                      <FileText size={24} className="doc-icon" />
                      <div>
                        <p className="doc-name">{contract.documentName}</p>
                        <span className="doc-type">PDF Document</span>
                      </div>
                    </div>
                    <div className="doc-actions">
                      <button onClick={viewDocument} className="btn-outline" title="View Document">
                        <Eye size={16} />
                        View
                      </button>
                      <button onClick={downloadDocument} className="btn-outline" title="Download Document">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Previous Comments (if rejected/approved) */}
              {contract.approverComments && (
                <div className="detail-section">
                  <h3 className="section-title">Previous Approver Comments</h3>
                  <div className="comment-box previous">
                    <p>{contract.approverComments}</p>
                  </div>
                </div>
              )}

              {contract.rejectionReason && (
                <div className="detail-section">
                  <h3 className="section-title">Rejection Reason</h3>
                  <div className="comment-box rejection">
                    <AlertCircle size={18} />
                    <p>{contract.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="history-panel">
              <div className="timeline">
                {history.length === 0 ? (
                  <div className="empty-history">
                    <Clock size={48} />
                    <p>No approval history yet</p>
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div className={`timeline-marker ${item.action.toLowerCase()}`}>
                        {item.action === "APPROVED" ? <CheckCircle size={16} /> : 
                         item.action === "REJECTED" ? <XCircle size={16} /> : 
                         <ChevronRight size={16} />}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h4 className={`action-${item.action.toLowerCase()}`}>
                            {item.action}
                          </h4>
                          <span className="timeline-date">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="timeline-comment">{item.comment}</p>
                        <div className="timeline-meta">
                          <User size={14} />
                          <span>{item.actor} • {item.actorRole}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Actions */}
        <div className="content-sidebar">
          {isPending && !(window.location.pathname.includes('/contracts/view/') && contract?.status !== 'PENDING') ? (
            <div className="action-panel">
              <h3>Review Actions</h3>
              <p className="action-description">
                Review the contract details carefully and provide your decision with comments.
              </p>

              <div className="form-group">
                <label htmlFor="comments">
                  Approval Comments <span className="required">*</span>
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter your review comments here..."
                  rows={5}
                  disabled={processing}
                />
                <span className="char-count">{comments.length} characters</span>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn-approve"
                  onClick={handleApprove}
                  disabled={processing || !comments.trim()}
                >
                  {processing ? (
                    <>
                      <div className="btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Approve Contract
                    </>
                  )}
                </button>

                <button 
                  className="btn-reject"
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                >
                  <XCircle size={20} />
                  Reject Contract
                </button>
              </div>

              <div className="warning-box">
                <AlertCircle size={18} />
                <p>This action cannot be undone. Please review carefully before submitting.</p>
              </div>
            </div>
          ) : (
            <div className="action-panel processed">
              <div className={`processed-status ${contract.status.toLowerCase()}`}>
                {contract.status === "APPROVED" ? (
                  <CheckCircle size={48} />
                ) : (
                  <XCircle size={48} />
                )}
                <h3>Contract {contract.status}</h3>
                <p>This contract has already been processed on {formatDate(contract.approvedDate)}</p>
              </div>
            </div>
          )}

          {/* Quick Info Card */}
          <div className="info-card">
            <h4>Contract Summary</h4>
            <div className="summary-item">
              <span>Status</span>
              <strong className={statusBadge.class}>{statusBadge.text}</strong>
            </div>
            <div className="summary-item">
              <span>Contract Type</span>
              <strong>{contract.contractType}</strong>
            </div>
            <div className="summary-item">
              <span>Duration</span>
              <strong>
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </strong>
            </div>
            {contract.documentName && (
              <div className="summary-item">
                <span>Document</span>
                <strong>Attached</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => !processing && setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Contract</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="alert-warning">
                <AlertCircle size={20} />
                <p>You are about to reject this contract. Please provide a detailed reason.</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="reason">
                  Rejection Reason <span className="required">*</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a clear reason for rejection..."
                  rows={4}
                  disabled={processing}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn-reject"
                onClick={handleReject}
                disabled={processing || !reason.trim()}
              >
                {processing ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
