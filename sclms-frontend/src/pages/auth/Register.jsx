import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/api";
import "../../styles/auth.css";
import logo from "../../assets/clm-log.jpeg";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    organization: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("auth/register", form);
      alert("Registration successful! Your account has been created and is pending admin approval. You will be able to login once approved.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);

      // Check if it's actually a success but treated as error
      if (err.message && err.message.includes("Registration successful")) {
        alert("Registration successful! Your account has been created and is pending admin approval.");
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
      <div className="auth-card">
        <img src={logo} alt="CLM Logo" className="auth-logo" />

        <h2>Create Account</h2>

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

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="USER">College</option>
            <option value="APPROVER">Company</option>
          </select>

          <input
            name="organization"
            placeholder="College / Company Name"
            value={form.organization}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
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
