import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import {
  FiSettings, FiBell, FiShield, FiEye, FiLock,
  FiSave, FiRefreshCw, FiSmartphone, FiKey, FiToggleRight, FiToggleLeft
} from "react-icons/fi";
import "../../styles/settings.css";

function Settings() {
  const { user, logout } = useContext(AuthContext);

  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    contracts: true,
    system: false,
    expiration: true
  });

  const [theme, setTheme] = useState("light");
  const [twoFactor, setTwoFactor] = useState({
    enabled: false,
    secret: null,
    qrUrl: null,
    setupMode: false,
    verificationCode: ""
  });

  const [passwordChange, setPasswordChange] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load settings on mount
  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load notification settings from user object
      setNotifications({
        email: user.emailNotifications || false,
        browser: user.browserNotifications || false,
        contracts: user.contractAlerts || false,
        system: user.systemNotifications || false,
        expiration: user.expirationReminders || false
      });

      // Load 2FA status
      setTwoFactor(prev => ({ ...prev, enabled: user.twoFactorEnabled || false }));

      // Load theme from localStorage
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

    } catch (error) {
      console.error("Failed to load settings:", error);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  // Theme handling
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showSuccess(`Theme changed to ${newTheme} mode`);
  };

  // Notification settings
  const handleNotificationChange = async (key, value) => {
    try {
      setSaving(true);
      const newNotifications = { ...notifications, [key]: value };
      setNotifications(newNotifications);

      // Map frontend keys to backend keys
      const backendMapping = {
        email: 'emailNotifications',
        browser: 'browserNotifications',
        contracts: 'contractAlerts',
        system: 'systemNotifications',
        expiration: 'expirationReminders'
      };

      const backendKey = backendMapping[key];
      const backendValue = value;

      await apiRequest(`users/${user.id}/notifications`, {
        method: 'PUT',
        body: { [backendKey]: backendValue }
      });

      showSuccess("Notification settings updated");
    } catch (error) {
      console.error("Failed to update notifications:", error);
      showError("Failed to update notification settings");
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordChange.new !== passwordChange.confirm) {
      showError("New passwords don't match");
      return;
    }

    if (passwordChange.new.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("auth/change-password", {
        method: 'PUT',
        body: {
          currentPassword: passwordChange.current,
          newPassword: passwordChange.new
        }
      });

      setPasswordChange({ current: "", new: "", confirm: "" });
      showSuccess("Password changed successfully");
    } catch (error) {
      console.error("Password change failed:", error);
      showError(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // 2FA Setup
  const setup2FA = async () => {
    try {
      setSaving(true);
      const data = await apiRequest("2fa/setup", { method: "POST" });

      setTwoFactor(prev => ({
        ...prev,
        secret: data.secret,
        qrUrl: data.qrUrl,
        setupMode: true,
        verificationCode: ""
      }));
    } catch (error) {
      console.error("2FA setup failed:", error);
      showError(error.message || "Failed to setup 2FA");
    } finally {
      setSaving(false);
    }
  };

  const enable2FA = async () => {
    try {
      setSaving(true);
      await apiRequest("2fa/enable", {
        method: "POST",
        body: { code: parseInt(twoFactor.verificationCode) }
      });

      setTwoFactor(prev => ({
        ...prev,
        enabled: true,
        setupMode: false,
        verificationCode: ""
      }));

      showSuccess("Two-factor authentication enabled successfully");
    } catch (error) {
      console.error("2FA enable failed:", error);
      showError(error.message || "Failed to enable 2FA");
    } finally {
      setSaving(false);
    }
  };

  const disable2FA = async () => {
    try {
      setSaving(true);

      // Get password from user
      const password = prompt("Enter your password to disable 2FA:");
      if (!password) return;

      // Get 2FA code from user
      const code = prompt("Enter your 2FA code:");
      if (!code) return;

      await apiRequest("2fa/disable", {
        method: "POST",
        body: { password, code: parseInt(code) }
      });

      setTwoFactor(prev => ({
        ...prev,
        enabled: false,
        secret: null,
        qrUrl: null,
        setupMode: false
      }));

      showSuccess("Two-factor authentication disabled successfully");
    } catch (error) {
      console.error("2FA disable failed:", error);
      showError(error.message || "Failed to disable 2FA");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">

      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <FiSettings className="header-icon" />
          <div>
            <h1>Account Settings</h1>
            <p>Manage your account preferences and security settings</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="alert alert-error">
          <FiShield />
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FiSave />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* Settings Sections */}
      <div className="settings-sections">

        {/* Appearance Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiEye className="section-icon" />
            <h2>Appearance</h2>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Theme</h4>
              <p>Choose your preferred color scheme</p>
            </div>
            <div className="setting-control">
              <div className="theme-options">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <div className="theme-preview light"></div>
                  <span>Light</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="theme-preview dark"></div>
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiBell className="section-icon" />
            <h2>Notifications</h2>
          </div>

          <div className="notification-settings">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'browser', label: 'Browser Notifications', desc: 'Show notifications in browser' },
              { key: 'contracts', label: 'Contract Alerts', desc: 'Get notified about contract updates' },
              { key: 'system', label: 'System Updates', desc: 'Important system announcements' },
              { key: 'expiration', label: 'Expiration Reminders', desc: 'Contract expiration alerts' }
            ].map(setting => (
              <div key={setting.key} className="setting-item">
                <div className="setting-info">
                  <h4>{setting.label}</h4>
                  <p>{setting.desc}</p>
                </div>
                <div className="setting-control">
                  <button
                    className={`toggle-btn ${notifications[setting.key] ? 'active' : ''}`}
                    onClick={() => handleNotificationChange(setting.key, !notifications[setting.key])}
                    disabled={saving}
                  >
                    {notifications[setting.key] ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiShield className="section-icon" />
            <h2>Security</h2>
          </div>

          {/* Password Change */}
          <div className="setting-item">
            <div className="setting-info">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
            <div className="setting-control">
              <form onSubmit={handlePasswordChange} className="password-form">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordChange.current}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, current: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordChange.new}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, new: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordChange.confirm}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, confirm: e.target.value }))}
                  required
                />
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <FiRefreshCw className="spinning" /> : <FiSave />}
                  Change Password
                </button>
              </form>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="setting-item">
            <div className="setting-info">
              <h4>Two-Factor Authentication</h4>
              <p>{twoFactor.enabled ? 'Extra security layer is active' : 'Add an extra layer of security'}</p>
            </div>
            <div className="setting-control">
              {twoFactor.enabled ? (
                <button
                  className="btn-danger"
                  onClick={disable2FA}
                  disabled={saving}
                >
                  {saving ? <FiRefreshCw className="spinning" /> : <FiShield />}
                  Disable 2FA
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={setup2FA}
                  disabled={loading}
                >
                  {loading ? <FiRefreshCw className="spinning" /> : <FiSmartphone />}
                  Enable 2FA
                </button>
              )}
            </div>
          </div>

          {/* 2FA Setup Modal */}
          {twoFactor.setupMode && (
            <div className="setting-item setup-2fa">
              <div className="setting-info">
                <h4>Setup Two-Factor Authentication</h4>
                <p>Scan the QR code with your authenticator app</p>
                {twoFactor.qrUrl && (
                  <div className="qr-code">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactor.qrUrl)}`} alt="2FA QR Code" />
                  </div>
                )}
              </div>
              <div className="setting-control">
                <div className="verification-form">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFactor.verificationCode}
                    onChange={(e) => setTwoFactor(prev => ({ ...prev, verificationCode: e.target.value }))}
                    maxLength="6"
                  />
                  <button
                    className="btn-success"
                    onClick={enable2FA}
                    disabled={saving || twoFactor.verificationCode.length !== 6}
                  >
                    {saving ? <FiRefreshCw className="spinning" /> : <FiKey />}
                    Verify & Enable
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setTwoFactor(prev => ({ ...prev, setupMode: false, verificationCode: "" }))}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="settings-section">
          <div className="section-header">
            <FiLock className="section-icon" />
            <h2>Account Actions</h2>
          </div>

          <div className="account-actions">
            <div className="action-item">
              <div className="action-info">
                <h4>Sign Out</h4>
                <p>Sign out of your account on this device</p>
              </div>
              <button className="btn-outline" onClick={logout}>
                <FiLock />
                Sign Out
              </button>
            </div>

            <div className="action-item danger">
              <div className="action-info">
                <h4>Danger Zone</h4>
                <p>Irreversible actions that affect your account</p>
              </div>
              <button className="btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Settings;
