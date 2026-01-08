import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";

function AdminNavbar({ onToggleSidebar, theme, toggleTheme }) {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <header className="admin-navbar">
        <div className="navbar-left">
          <button className="icon-btn" onClick={onToggleSidebar}>
            ☰
          </button>
          <span className="navbar-title">Admin Panel</span>
        </div>

        <div className="navbar-user">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <span>Admin</span>
          <div className="avatar">A</div>

          <button
            className="logout-btn"
            onClick={() => setShowLogout(true)}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogout && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>

              <button
                className="btn confirm"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNavbar;
