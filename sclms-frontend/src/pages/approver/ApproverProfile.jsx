import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Mail, Building2, Shield, Calendar } from "lucide-react";
import "../../styles/approver-profile.css";

export default function ApproverProfile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-content">
        {/* Profile Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-circle">
            <User size={48} />
          </div>
          <div className="avatar-info">
            <h3>{user?.name}</h3>
            <span className="role-badge">{user?.role}</span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-group">
            <h4>Personal Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <User size={18} />
                <div>
                  <label>Full Name</label>
                  <p>{user?.name}</p>
                </div>
              </div>
              <div className="detail-item">
                <Mail size={18} />
                <div>
                  <label>Email Address</label>
                  <p>{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-group">
            <h4>Professional Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <Building2 size={18} />
                <div>
                  <label>Organization</label>
                  <p>{user?.organization}</p>
                </div>
              </div>
              <div className="detail-item">
                <Shield size={18} />
                <div>
                  <label>Role</label>
                  <p>{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-group">
            <h4>Account Status</h4>
            <div className="status-info">
              <div className="status-item">
                <span className="status-dot active"></span>
                <span>Active Account</span>
              </div>
              <div className="status-item">
                <Calendar size={16} />
                <span>Member since 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
