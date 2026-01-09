import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../utils/api";
import { showToast, showSuccess, showError } from "../../utils/toast";
import { debugAuth } from "../../utils/debug";
import ThemeToggle from "../../components/ThemeToggle";
import "../../styles/auth.css";
// import logo from "../../assets/clm-log.jpeg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password", "error");
      return;
    }

    setLoading(true);

    try {
      debugAuth('Login attempt for:', email.trim());

      const response = await apiRequest("auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      // Check if 2FA is required
      if (response.requires2FA) {
        // Navigate to 2FA verification page with userId
        navigate("/verify-2fa", { state: { userId: response.userId } });
        return;
      }

      // Store token and user data for regular login
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Update AuthContext with user data and token
      login(response.user, response.token);

      showToast("Login successful!", "success");

      // Navigate to dashboard based on role
      const role = response.user.role;
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/approver/dashboard");
      }

    } catch (error) {
      console.error('❌ LOGIN FAILED:', error);
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);

    try {
      debugAuth('Admin login attempt');

      const response = await apiRequest("auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@sclms.com",
          password: "admin123"
        })
      });

      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Update AuthContext with user data and token
      login(response.user, response.token);

      showToast("Admin login successful!", "success");

      // Navigate to admin dashboard
      navigate("/admin/dashboard");

    } catch (error) {
      console.error('❌ ADMIN LOGIN FAILED:', error);
      showToast(error.message || "Admin login failed", "error");
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

        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>


        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
