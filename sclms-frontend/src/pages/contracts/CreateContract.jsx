import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";
import {
  FiFileText, FiHome, FiCalendar, FiUpload, FiCheck,
  FiArrowLeft, FiAlertCircle, FiInfo, FiSave
} from "react-icons/fi";
import "../../styles/contract.css";

// Import API_BASE_URL for FormData requests
const API_BASE_URL = "http://localhost:8082/api/";

function CreateContract() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    targetOrg: "",
    contractType: "",
    startDate: "",
    endDate: "",
    description: "",
    documentFile: null
  });

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch organizations on mount
  useEffect(() => {
    if (!user) return;

    const loadOrganizations = async () => {
      try {
        setLoading(true);
        console.log("🔍 Loading organizations for user:", user);
        console.log("🔍 User organization:", user.organization);

        const data = await api.get("organizations");
        console.log("🔍 API response data:", data);
        console.log("🔍 API response type:", typeof data);
        console.log("🔍 API response length:", Array.isArray(data) ? data.length : 'not array');

        const orgNames = data.map(org => org.name);
        console.log("🔍 Mapped organization names:", orgNames);

        const filteredOrgs = orgNames.filter(org => org !== user.organization);
        console.log("🔍 Filtered organizations (excluding user's org):", filteredOrgs);

        setOrganizations(filteredOrgs);
        console.log("🔍 Final organizations set to state:", filteredOrgs);
      } catch (error) {
        console.error("❌ Failed to load organizations:", error);
        console.error("❌ Error details:", error.message, error.response);
        setError("Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // File upload handlers
  const handleFileChange = (file) => {
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        documentFile: file
      }));
      setValidationErrors(prev => ({
        ...prev,
        document: undefined
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        document: "Please upload a valid PDF file"
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Contract title is required";
    }

    if (!formData.targetOrg) {
      errors.targetOrg = "Target organization is required";
    }

    if (!formData.contractType) {
      errors.contractType = "Contract type is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        errors.endDate = "End date must be after start date";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit contract
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        contractType: formData.contractType,
        toOrg: formData.targetOrg,
        startDate: formData.startDate,
        endDate: formData.endDate
        // TODO: Add document support later
      };

      console.log("📤 Contract creation payload:", payload);
      console.log("📤 Making API call to:", `contracts/create/${user.id}`);

      const response = await api.post(`contracts/create/${user.id}`, payload);
      console.log("📤 Contract creation response:", response);

      // Success - navigate to contracts page
      navigate("/dashboard/contracts");

    } catch (error) {
      console.error("Contract creation failed:", error);
      setError(error.message || "Failed to create contract. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-contract-loading">
        <div className="loading-spinner"></div>
        <p>Loading contract form...</p>
      </div>
    );
  }


  return (
    <div className="create-contract-page">

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="btn-back"
            onClick={() => navigate('/dashboard/contracts')}
          >
            <FiArrowLeft /> Back to Contracts
          </button>
        </div>
        <div className="header-center">
          <h1>Create New Contract</h1>
          <p>Fill out the form below to create a contract request</p>
        </div>
        <div className="header-right">
          {/* Empty for balance */}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Main Form */}
      <div className="contract-form-card">
        <form onSubmit={handleSubmit} className="contract-form">

          {/* Basic Information Section */}
          <div className="form-section">
            <div className="section-header">
              <FiFileText className="section-icon" />
              <h2>Basic Information</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contract Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Research Collaboration Agreement 2025"
                  className={validationErrors.title ? 'error' : ''}
                  required
                />
                {validationErrors.title && (
                  <span className="field-error">{validationErrors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label>Contract Type *</label>
                <select
                  value={formData.contractType}
                  onChange={(e) => handleInputChange('contractType', e.target.value)}
                  className={validationErrors.contractType ? 'error' : ''}
                  required
                >
                  <option value="">Select contract type...</option>
                  <option value="PLACEMENT">Placement Agreement</option>
                  <option value="INTERNSHIP">Internship Agreement</option>
                  <option value="MOU">Memorandum of Understanding</option>
                  <option value="RESEARCH">Research Collaboration</option>
                  <option value="SERVICE">Service Agreement</option>
                  <option value="OTHER">Other</option>
                </select>
                {validationErrors.contractType && (
                  <span className="field-error">{validationErrors.contractType}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From Organization</label>
                <input
                  type="text"
                  value={user?.organization || ''}
                  disabled
                  className="disabled"
                />
                <small className="field-hint">Your organization</small>
              </div>

              <div className="form-group">
                <label>Target Organization *</label>
                <select
                  value={formData.targetOrg}
                  onChange={(e) => handleInputChange('targetOrg', e.target.value)}
                  className={validationErrors.targetOrg ? 'error' : ''}
                  required
                >
                  <option value="">Choose organization...</option>
                  {organizations.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
                {validationErrors.targetOrg && (
                  <span className="field-error">{validationErrors.targetOrg}</span>
                )}
              </div>
            </div>
          </div>

          {/* Duration & Terms Section */}
          <div className="form-section">
            <div className="section-header">
              <FiCalendar className="section-icon" />
              <h2>Duration & Terms</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={validationErrors.startDate ? 'error' : ''}
                  required
                />
                {validationErrors.startDate && (
                  <span className="field-error">{validationErrors.startDate}</span>
                )}
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={validationErrors.endDate ? 'error' : ''}
                  required
                />
                {validationErrors.endDate && (
                  <span className="field-error">{validationErrors.endDate}</span>
                )}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Contract Description & Terms *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed terms and conditions for this contract. Include objectives, responsibilities, deliverables, and any specific requirements..."
                rows={6}
                className={validationErrors.description ? 'error' : ''}
                required
              />
              {validationErrors.description && (
                <span className="field-error">{validationErrors.description}</span>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="form-section">
            <div className="section-header">
              <FiUpload className="section-icon" />
              <h2>Supporting Documents</h2>
            </div>

            <div className="form-group full-width">
              <label>Attach PDF Document (Optional)</label>
              <div className="file-upload-zone">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                  className="file-input"
                  id="document-upload"
                  style={{ display: 'none' }}
                />
                <div
                  className="upload-area"
                  onClick={() => document.getElementById('document-upload').click()}
                  style={{ cursor: 'pointer' }}
                >
                  {formData.documentFile ? (
                    <div className="file-selected">
                      <FiFileText className="file-icon" />
                      <div className="file-info">
                        <span className="file-name">{formData.documentFile.name}</span>
                        <span className="file-size">
                          {(formData.documentFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange('documentFile', null);
                        }}
                        className="file-remove"
                      >
                        <FiAlertCircle />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <FiUpload className="upload-icon" />
                      <div className="upload-text">
                        <p className="upload-primary">Click to upload PDF file</p>
                        <p className="upload-secondary">or drag and drop here</p>
                        <small>Maximum file size: 10MB</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard/contracts')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="loading-spinner small"></div>
                  Creating Contract...
                </>
              ) : (
                <>
                  <FiSave /> Create Contract
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <FiInfo className="info-icon" />
          <div className="info-content">
            <h3>What happens next?</h3>
            <ul>
              <li>Once submitted, your contract will be sent for approval</li>
              <li>You will receive notifications about the approval process</li>
              <li>Both organizations will be notified of the contract request</li>
              <li>You can track the status from your contracts dashboard</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CreateContract;
