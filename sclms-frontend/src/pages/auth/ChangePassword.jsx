import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { showToast } from "../../utils/toast";
import "../../styles/auth.css";

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if this is a forced password reset
  const forceResetUserId = localStorage.getItem("forcePasswordResetUserId");
  const isForceReset = !!forceResetUserId;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For force reset, don't require old password
    if (!isForceReset && !formData.oldPassword.trim()) {
      showToast("Please enter your current password", "error");
      return;
    }

    if (!formData.newPassword.trim()) {
      showToast("Please enter a new password", "error");
      return;
    }

    if (formData.newPassword.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        newPassword: formData.newPassword
      };

      // Include old password only if not a force reset
      if (!isForceReset) {
        requestBody.oldPassword = formData.oldPassword;
      }

      // Include userId for force reset
      if (isForceReset) {
        requestBody.userId = forceResetUserId;
      }

      await apiRequest("auth/change-password", {
        method: "PUT",
        body: JSON.stringify(requestBody)
      });

      showToast("Password changed successfully!", "success");

      // Clear force reset flag and localStorage
      if (isForceReset) {
        localStorage.removeItem("forcePasswordResetUserId");
      }

      // Clear form and redirect
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Redirect to dashboard based on user role
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "APPROVER") {
        navigate("/approver/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      showToast(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isForceReset ? "Password Reset Required" : "Change Password"}</h2>
          <p>{isForceReset
            ? "You must set a new password to continue using the system"
            : "Enter your current password and choose a new one"
          }</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isForceReset && (
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength={8}
              required
            />
            <small className="form-hint">Must be at least 8 characters</small>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="auth-link"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
