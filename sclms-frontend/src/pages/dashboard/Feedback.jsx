import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { FiUpload, FiFile, FiTrash2, FiCheckCircle, FiMessageSquare } from "react-icons/fi";

function Feedback() {
  const { user } = useContext(AuthContext);
  const [feedback, setFeedback] = useState({
    type: 'general',
    subject: '',
    message: '',
    rating: 5
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    loadFeedbackHistory();
  }, [user]);

  const loadFeedbackHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await api.get(`users/${user.id}/feedback`);
      setFeedbackHistory(history);
    } catch (err) {
      console.error("Failed to load feedback history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }
      setAttachment(file);
      setError("");
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.subject.trim() || !feedback.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const feedbackData = {
        ...feedback,
        attachmentName: attachment ? attachment.name : null,
        attachmentSize: attachment ? attachment.size : null
      };

      await api.post(`users/${user.id}/feedback`, feedbackData);

      setSubmitted(true);
      setFeedback({
        type: 'general',
        subject: '',
        message: '',
        rating: 5
      });
      setAttachment(null);
      loadFeedbackHistory(); // Refresh history

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="feedback-success">
          <div className="success-icon">✅</div>
          <h1>Thank You!</h1>
          <p>Your feedback has been submitted successfully.</p>
          <p>We appreciate your input and will review it carefully.</p>
          <button
            className="btn-primary"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>💬 Share Your Feedback</h1>
        <p>Help us improve SCLMS by sharing your thoughts and suggestions</p>
      </div>

      <div className="feedback-form-container">
        <form onSubmit={handleSubmit} className="feedback-form">

          <div className="form-section">
            <label className="form-label">Feedback Type</label>
            <select
              value={feedback.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="form-select"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-section">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              value={feedback.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief summary of your feedback"
              className="form-input"
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">Message *</label>
            <textarea
              value={feedback.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Please provide detailed feedback..."
              className="form-textarea"
              rows={6}
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">Overall Rating</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${feedback.rating >= star ? 'active' : ''}`}
                  onClick={() => handleInputChange('rating', star)}
                >
                  ⭐
                </button>
              ))}
              <span className="rating-text">{feedback.rating}/5</span>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Attachment (Optional)</label>
            <div className="file-upload-section">
              {!attachment ? (
                <div className="file-upload-zone">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="feedback-attachment"
                  />
                  <label htmlFor="feedback-attachment" className="upload-button">
                    <FiUpload className="upload-icon" />
                    <span>Choose file or drag here</span>
                  </label>
                  <small className="upload-hint">Max 10MB - Images, PDF, Documents</small>
                </div>
              ) : (
                <div className="file-attachment">
                  <FiFile className="file-icon" />
                  <div className="file-info">
                    <span className="file-name">{attachment.name}</span>
                    <span className="file-size">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="remove-file"
                    title="Remove attachment"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>

        <div className="feedback-info">
          <h3>📧 What happens next?</h3>
          <ul>
            <li>Your feedback will be reviewed by our team</li>
            <li>We may contact you for clarification if needed</li>
            <li>Suggestions may be implemented in future updates</li>
            <li>Bug reports will be prioritized for fixes</li>
          </ul>

          <div className="contact-info">
            <p>For urgent issues, contact support:</p>
            <p><strong>Email:</strong> lishaanthkumar05@gmail.com</p>
            <p><strong>Phone:</strong> +91 9345324405</p>
          </div>
        </div>
      </div>

      {/* Feedback History Section */}
      <div className="feedback-history-section">
        <h2><FiMessageSquare className="section-icon" /> Your Feedback History</h2>

        {loadingHistory ? (
          <div className="loading-history">
            <div className="loading-spinner small"></div>
            <p>Loading feedback history...</p>
          </div>
        ) : feedbackHistory.length === 0 ? (
          <div className="empty-feedback-history">
            <FiMessageSquare className="empty-icon" />
            <h3>No feedback submitted yet</h3>
            <p>Your submitted feedback will appear here.</p>
          </div>
        ) : (
          <div className="feedback-history-list">
            {feedbackHistory.map((item, index) => (
              <div key={index} className="feedback-history-item">
                <div className="feedback-history-header">
                  <div className="feedback-type-badge">
                    {item.type || 'general'}
                  </div>
                  <div className="feedback-status">
                    <FiCheckCircle className="status-icon" />
                    <span>Submitted</span>
                  </div>
                  <div className="feedback-date">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="feedback-history-content">
                  <h4>{item.subject}</h4>
                  <p>{item.message?.substring(0, 150)}{item.message?.length > 150 ? '...' : ''}</p>
                  {item.rating && (
                    <div className="feedback-rating">
                      {'⭐'.repeat(item.rating)} ({item.rating}/5)
                    </div>
                  )}
                  {item.attachmentName && (
                    <div className="feedback-attachment">
                      <FiFile className="attachment-icon" />
                      <span>{item.attachmentName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
