import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/api";
import { showSuccess } from "../../utils/toast";
import ThemeToggle from "../../components/ThemeToggle";
import "../../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "", // No default selection - user must choose
    organization: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle organization type selection
  const handleOrgTypeChange = (orgType) => {
    setForm({ ...form, role: orgType });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("auth/register", form);
      showSuccess("Registration successful! Your account has been created and is pending admin approval. You will be able to login once approved.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);

      // Check if it's actually a success but treated as error
      if (err.message && err.message.includes("Registration successful")) {
        showSuccess("Registration successful! Your account has been created and is pending admin approval.");
        navigate("/login");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <ThemeToggle />
      <div className="auth-card">
        <div className="auth-logo-text">
          <h1>CLM</h1>
          <p>Contract Lifecycle Management</p>
        </div>

        <h2>Create Account</h2>
        <p className="auth-subtitle">Register to access SCLMS</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Organization Type Selection - Professional Cards */}
          <div className="org-type-selection">
            <label className="form-label">Organization Type</label>
            <div className="org-type-cards">
              <div
                className={`organization-card ${form.role === 'USER' ? 'selected' : ''}`}
                onClick={() => handleOrgTypeChange('USER')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOrgTypeChange('USER')}
              >
                <div className="card-icon">🎓</div>
                <div className="card-content">
                  <h3 className="card-title">College</h3>
                  <p className="card-subtitle">Educational Institution</p>
                </div>
              </div>
              <div
                className={`organization-card ${form.role === 'APPROVER' ? 'selected' : ''}`}
                onClick={() => handleOrgTypeChange('APPROVER')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOrgTypeChange('APPROVER')}
              >
                <div className="card-icon">🏢</div>
                <div className="card-content">
                  <h3 className="card-title">Company</h3>
                  <p className="card-subtitle">Business Organization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Organization Input */}
          <input
            name="organization"
            placeholder={form.role === 'USER' ? 'College Name' : 'Company Name'}
            value={form.organization}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading || !form.role}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
