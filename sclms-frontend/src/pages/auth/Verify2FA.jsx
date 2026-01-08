import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { showToast } from "../../utils/toast";
import "../../styles/auth.css";

function Verify2FA() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get userId from location state (passed from login)
    const stateUserId = location.state?.userId;
    if (stateUserId) {
      setUserId(stateUserId);
    } else {
      // If no userId, redirect to login
      navigate("/login");
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim() || code.length !== 6) {
      showToast("Please enter a valid 6-digit code", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("2fa/verify", {
        method: "POST",
        body: JSON.stringify({
          userId: userId,
          code: parseInt(code)
        })
      });

      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      showToast("Login successful!", "success");

      // Navigate to dashboard based on role
      const role = response.user.role;
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/approver/dashboard");
      }

    } catch (error) {
      showToast(error.message || "Invalid 2FA code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Two-Factor Authentication</h2>
          <p>Enter the 6-digit code from your authenticator app</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Authentication Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
              }}
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <small className="form-hint">
              Enter the code from your Google Authenticator app
            </small>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="auth-link"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Verify2FA;
