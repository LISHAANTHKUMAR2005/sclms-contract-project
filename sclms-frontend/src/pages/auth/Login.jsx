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
  const [showPassword, setShowPassword] = useState(false);

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

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.45703 12C3.73128 7.94291 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11.9992 15C13.6561 15 14.9992 13.6569 14.9992 12C14.9992 10.3431 13.6561 9 11.9992 9C10.3424 9 8.99924 10.3431 8.99924 12C8.99924 13.6569 10.3424 15 11.9992 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

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
