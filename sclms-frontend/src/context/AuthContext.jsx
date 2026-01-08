import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLogger } from "../utils/logger";

const logger = createLogger('AuthContext');

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load auth data on startup - BLOCKS APP RENDERING
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (error) {
        logger.error("Failed to parse saved auth data", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    // CRITICAL: This setLoading(false) happens AFTER auth restoration
    // App will NOT render until this completes
    setLoading(false);
  }, []);

  // Persist user + token to localStorage whenever they change
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else if (!loading) {
      // Only clear if not loading (prevents clearing during initial load)
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token, loading]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    // Check if password reset is required
    if (userData && userData.requiresPasswordChange) {
      // Store the userId for password reset
      localStorage.setItem("forcePasswordResetUserId", userData.userId || userData.id);
      // Navigate to change password page
      navigate("/change-password");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setUser,
    setToken
  };

  // CRITICAL: App does NOT render until loading === false
  // This ensures auth restoration completes BEFORE any component renders
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#64748b',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>Loading application...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
