import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth.css";
import logo from "../../assets/clm-log.jpeg";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Password reset link has been sent to your email.");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* LOGO */}
        <img src={logo} alt="CLM Logo" className="auth-logo" />

        <h2>Forgot Password</h2>

        {message && <p className="success">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Send Reset Link</button>
        </form>

        <p className="auth-link">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
