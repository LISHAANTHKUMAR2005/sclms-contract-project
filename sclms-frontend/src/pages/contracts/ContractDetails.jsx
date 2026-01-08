import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest, api } from "../../utils/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/contract-details.css";

function ContractDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiRequest(`contracts/${id}`)
      .then(data => setContract(data))
      .catch(() => alert("Failed to load contract"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="page-loading">Loading...</p>;
  if (!contract) return <p className="page-error">Contract not found</p>;

  return (
    <div className="view-wrapper">

      {/* Breadcrumb */}
      <div className="breadcrumbs">
        <Link to="/dashboard">Dashboard</Link>  ›
        <Link to="/contracts"> Contracts</Link>  ›
        <span> View</span>
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
            <p>{contract.startDate || "—"}</p>
          </div>

          <div className="field">
            <label>End Date</label>
            <p>{contract.endDate || "—"}</p>
          </div>

        </div>

        <div className="description-box">
  <label>Description</label>
  <p>{contract.description || "No description provided"}</p>
</div>

{contract.documentName && (
  <div className="document-section">

    <div className="doc-header">
      <h3>Attached Document</h3>

      <div className="doc-actions">
        <button
          onClick={() => api.openFile(`contracts/file/${contract.id}`)}
          className="btn-primary"
        >
          Open in New Tab
        </button>

        <button
          onClick={() => api.downloadFile(`contracts/file/${contract.id}`, contract.documentName)}
          className="btn-secondary"
        >
          Download
        </button>
      </div>
    </div>

    {/* For preview, we'll use the authenticated method */}
    <div className="pdf-preview-container">
      <button
        onClick={() => api.openFile(`contracts/file/${contract.id}`)}
        className="pdf-preview-btn"
      >
        Click to Preview Document
      </button>
    </div>
  </div>
)}


      </div>

      {/* Back Button */}
      <div className="actions-row">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

    </div>
  );
}

export default ContractDetails;
