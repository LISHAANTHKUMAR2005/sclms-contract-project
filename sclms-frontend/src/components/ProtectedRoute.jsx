import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createLogger } from "../utils/logger";

const logger = createLogger('ProtectedRoute');

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, loading } = useContext(AuthContext);
  const location = useLocation();

  // CRITICAL: Wait for AuthContext loading to complete
  // AuthContext blocks app rendering until loading === false
  // So this should never be true in normal operation
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  // Step 1 — Check if we have valid auth from context
  // By this point, AuthContext has already restored from localStorage
  const hasValidAuth = token && user;

  // 🚧 If no valid auth → redirect to login
  if (!hasValidAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔐 Role-based access enforcement
  // ADMIN users can access everything, others are restricted by allowedRoles
  if (allowedRoles.length > 0 && user && user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
    // Show friendly message instead of redirecting
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            You don't have permission to access this page. Your role ({user.role}) doesn't allow access to this section.
          </p>
          <p style={{
            color: '#6c757d',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            Please navigate to your appropriate dashboard:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.href = user.role === 'APPROVER' ? '/approver/dashboard' : '/dashboard'}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
