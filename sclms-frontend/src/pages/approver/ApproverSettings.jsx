import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { Palette, Bell, Shield, Globe, Monitor, Moon, Sun, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { showToast } from "../../utils/toast";
import "../../styles/approver-settings.css";

export default function ApproverSettings() {
  const { user } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("ap-theme") || "light");
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    contracts: true,
    system: false,
    expiration: true
  });
  const [language, setLanguage] = useState("en");

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("ap-theme", newTheme);
  };

  const handleNotificationChange = async (type, value) => {
    if (!user?.id) {
      showToast("User not found. Please log in again.", "error");
      return;
    }

    const newNotifications = { ...notifications, [type]: value };
    setNotifications(newNotifications);

    try {
      await apiRequest(`users/${user.id}/notifications`, {
        method: "PUT",
        body: newNotifications
      });

      showToast("Notification settings updated", "success");
    } catch (error) {
      showToast("Failed to update notifications", "error");
      console.error(error);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // TODO: Implement language switching
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      showToast("User not found. Please log in again.", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords don't match", "error");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      // Debug: Log what we're sending
      console.log("Sending password change request:");
      console.log("User ID:", user.id);
      console.log("Current password length:", passwordForm.currentPassword.length);
      console.log("New password length:", passwordForm.newPassword.length);

      await apiRequest("auth/change-password", {
        method: "PUT",
        body: {
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }
      });

      showToast("Password changed successfully", "success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      showToast("Network error occurred. Please try again.", "error");
      console.error("Password change error:", error);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorCode.trim()) {
      showToast("Please enter the 2FA code", "error");
      return;
    }

    setEnabling2FA(true);
    try {
      await apiRequest("2fa/enable", {
        method: "POST",
        body: { code: parseInt(twoFactorCode) }
      });

      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorCode("");
      showToast("2FA enabled successfully", "success");
    } catch (error) {
      showToast("Invalid 2FA code", "error");
      console.error(error);
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await apiRequest("2fa/disable", {
        method: "POST",
        body: { password: prompt("Enter your password to disable 2FA:"), code: parseInt(prompt("Enter your 2FA code:")) }
      });

      setTwoFactorEnabled(false);
      showToast("2FA disabled successfully", "success");
    } catch (error) {
      showToast("Failed to disable 2FA", "error");
      console.error(error);
    }
  };

  const setup2FA = async () => {
    try {
      const data = await apiRequest("2fa/setup", { method: "POST" });
      setTwoFactorSecret(data.secret);
      setShow2FASetup(true);
    } catch (error) {
      showToast("Failed to setup 2FA", "error");
      console.error(error);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your account preferences and application settings</p>
      </div>

      <div className="settings-content">
        {/* Appearance Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={20} />
            <h3>Appearance</h3>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Theme</label>
              <p>Choose your preferred color scheme</p>
            </div>
            <div className="theme-options">
              <button
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => handleThemeChange("light")}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => handleThemeChange("dark")}
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                className={`theme-option ${theme === "system" ? "active" : ""}`}
                onClick={() => handleThemeChange("system")}
              >
                <Monitor size={16} />
                System
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Email Notifications</label>
              <p>Receive contract updates via email</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => handleNotificationChange("email", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Browser Notifications</label>
              <p>Show desktop notifications for new contracts</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.browser}
                onChange={(e) => handleNotificationChange("browser", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Contract Alerts</label>
              <p>Get notified about contract status changes</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.contracts}
                onChange={(e) => handleNotificationChange("contracts", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Contract Approval Alerts</label>
              <p>Get notified when contracts are approved or rejected</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.contracts}
                onChange={(e) => handleNotificationChange("contracts", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Contract Expiration Reminders</label>
              <p>Receive alerts when contracts are about to expire</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.expiration}
                onChange={(e) => handleNotificationChange("expiration", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>System Updates</label>
              <p>Receive notifications about system maintenance</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.system}
                onChange={(e) => handleNotificationChange("system", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Language Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Globe size={20} />
            <h3>Language & Region</h3>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Language</label>
              <p>Select your preferred language</p>
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h3>Account & Security</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Account Status</label>
              <p>Your account is active and verified</p>
            </div>
            <span className="status-badge active">
              <CheckCircle size={14} />
              Active
            </span>
          </div>

          {/* Password Change Form - Hidden for Approvers */}
          {user?.role !== 'APPROVER' && (
            <div className="password-section">
              <h4>Change Password</h4>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                      className="password-toggle"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                      className="password-toggle"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                      className="password-toggle"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={changingPassword}>
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>

                {/* Development: Reset Password Button */}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={async () => {
                    try {
                      const data = await apiRequest(`admin/users/${user.id}/reset-password`, {
                        method: "PUT"
                      });
                      showToast(`Password reset to: ${data.newPassword}`, "success");
                    } catch (error) {
                      showToast("Failed to reset password", "error");
                      console.error(error);
                    }
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  🔧 Reset Password (Dev)
                </button>

                {/* Development: Fix Password Hashing Button */}
                <button
                  type="button"
                  className="btn-warning"
                  onClick={async () => {
                    try {
                      const data = await apiRequest(`admin/users/${user.id}/fix-password`, {
                        method: "PUT"
                      });
                      showToast(`Password hashing fixed! Original: ${data.originalPassword}`, "success");
                    } catch (error) {
                      showToast("Failed to fix password hashing", "error");
                      console.error(error);
                    }
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  🔐 Fix Password Hash (Dev)
                </button>

                {/* Development: Check User Info Button */}
                <button
                  type="button"
                  className="btn-info"
                  onClick={async () => {
                    try {
                      const data = await apiRequest(`admin/users/${user.id}/user-info`);
                      console.log("User Info:", data);
                      alert(`User Info:\nID: ${data.id}\nName: ${data.name}\nEmail: ${data.email}\nPassword: ${data.password}\nRole: ${data.role}\nStatus: ${data.status}`);
                    } catch (error) {
                      showToast("Failed to get user info", "error");
                      console.error(error);
                    }
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  👤 Check User Info (Dev)
                </button>
              </form>
            </div>
          )}

          {/* Two-Factor Authentication - Hidden for Approvers */}
          {user?.role !== 'APPROVER' && (
            <>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Two-Factor Authentication</label>
                  <p>Add an extra layer of security to your account</p>
                </div>
                {twoFactorEnabled ? (
                  <button className="btn-danger" onClick={handleDisable2FA}>
                    Disable 2FA
                  </button>
                ) : (
                  <button className="btn-outline" onClick={setup2FA}>
                    Enable 2FA
                  </button>
                )}
              </div>

              {/* 2FA Setup Modal */}
              {show2FASetup && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Enable Two-Factor Authentication</h3>
                      <button onClick={() => setShow2FASetup(false)} className="modal-close">×</button>
                    </div>
                    <div className="modal-body">
                      <p>Scan this QR code with your authenticator app:</p>
                      <div className="qr-placeholder">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/SCLMS:${user?.email}?secret=${twoFactorSecret}&issuer=SCLMS`} alt="2FA QR Code" />
                      </div>
                      <p className="qr-text">Or enter this code manually: <strong>{twoFactorSecret}</strong></p>

                      <div className="form-group">
                        <label>Enter 6-digit code from your app:</label>
                        <input
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button onClick={() => setShow2FASetup(false)} className="btn-secondary">Cancel</button>
                      <button onClick={handleEnable2FA} disabled={enabling2FA || twoFactorCode.length !== 6} className="btn-primary">
                        {enabling2FA ? "Enabling..." : "Enable 2FA"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Save Settings */}
        <div className="settings-actions">
          <button className="btn-primary">Save Changes</button>
          <button className="btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}
