import React, { useState, useEffect } from "react";
import { FiSettings, FiShield, FiKey, FiBell, FiLock, FiUnlock, FiCheckCircle, FiXCircle, FiSave, FiRefreshCw, FiAlertTriangle, FiInfo, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    // General Settings
    organizationName: 'SCLMS Corporation',
    organizationLogo: '',
    contactEmail: 'admin@sclms.com',
    supportLink: 'https://sclms.com/support',
    timezone: 'UTC+5:30',
    systemName: 'SCLMS',
    systemDescription: 'Contract Lifecycle Management System',
    defaultLanguage: 'en',
    maintenanceMode: false,
    debugMode: false,

    // Security Settings
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    passwordExpiryDays: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15,
    twoFactorEnabled: false,
    twoFactorRequired: false,

    // Notification Settings
    systemAlertsEnabled: true,
    adminNotificationsEnabled: true,
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    pushNotifications: false,
    contractExpiryReminders: true,
    approvalNotifications: true,
    weeklyReports: false,
  });



  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from kept tabs only
      const [
        generalSettings,
        securitySettings,
        notificationSettings,
        databaseSettings
      ] = await Promise.allSettled([
        adminService.getGeneralSettings(),
        adminService.getSecuritySettings(),
        adminService.getNotificationSettings(),
        adminService.getDatabaseSettings()
      ]);

      // Merge all settings into one object
      const loadedSettings = {};

      if (generalSettings.status === 'fulfilled') {
        Object.assign(loadedSettings, generalSettings.value);
      }
      if (securitySettings.status === 'fulfilled') {
        Object.assign(loadedSettings, securitySettings.value);
      }
      if (notificationSettings.status === 'fulfilled') {
        Object.assign(loadedSettings, notificationSettings.value);
      }
      if (databaseSettings.status === 'fulfilled') {
        // Map maintenanceModeEnabled to maintenanceMode
        const dbSettings = databaseSettings.value;
        if (dbSettings.maintenanceModeEnabled !== undefined) {
          loadedSettings.maintenanceMode = dbSettings.maintenanceModeEnabled;
        }
      }

      setSettings(prev => ({
        ...prev,
        ...loadedSettings
      }));
    } catch (error) {
      console.warn("Backend not available, using default settings:", error.message);
      // Continue with default settings if loading fails - no error shown to user
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings for all tabs using individual APIs
      const savePromises = [];

      // General settings
      savePromises.push(
        adminService.updateGeneralSettings({
          organizationName: settings.organizationName,
          systemDescription: settings.systemDescription,
          organizationLogo: settings.organizationLogo,
          contactEmail: settings.contactEmail,
          supportLink: settings.supportLink,
          defaultLanguage: settings.defaultLanguage,
          timezone: settings.timezone,
        }).catch(err => ({ tab: 'general', error: err }))
      );

      // Database settings (for maintenance mode)
      savePromises.push(
        adminService.updateDatabaseSettings({
          maintenanceModeEnabled: settings.maintenanceMode,
        }).catch(err => ({ tab: 'database', error: err }))
      );

      // Security settings
      savePromises.push(
        adminService.updateSecuritySettings({
          passwordMinLength: settings.passwordMinLength,
          passwordRequireUppercase: settings.passwordRequireUppercase,
          passwordRequireNumbers: settings.passwordRequireNumbers,
          passwordRequireSpecialChars: settings.passwordRequireSpecialChars,
          passwordExpiryDays: settings.passwordExpiryDays,
          sessionTimeout: settings.sessionTimeout,
          maxLoginAttempts: settings.maxLoginAttempts,
          accountLockoutDuration: settings.accountLockoutDuration,
        }).catch(err => ({ tab: 'security', error: err }))
      );

      // 2FA settings
      savePromises.push(
        adminService.updateTwoFactorSettings({
          twoFactorEnabled: settings.twoFactorEnabled,
        }).catch(err => ({ tab: '2fa', error: err }))
      );



      // Notification settings
      savePromises.push(
        adminService.updateNotificationSettings({
          systemAlertsEnabled: settings.systemAlertsEnabled,
          adminNotificationsEnabled: settings.adminNotificationsEnabled,
          emailNotificationsEnabled: settings.emailNotificationsEnabled,
          inAppNotificationsEnabled: settings.inAppNotificationsEnabled,
        }).catch(err => ({ tab: 'notifications', error: err }))
      );



      // Wait for all save operations to complete
      const results = await Promise.allSettled(savePromises);

      // Check for errors
      const errors = results.filter(result =>
        result.status === 'rejected' || (result.value && result.value.error)
      );

      if (errors.length > 0) {
        console.warn('Some settings failed to save:', errors);
        alert(`Settings partially saved. ${errors.length} section(s) had issues.`);
      } else {
        alert('All settings saved successfully!');
      }

      // Refresh settings after save
      await loadSettings();

    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <div className="settings-header">
              <FiSettings className="section-icon" />
              <div>
                <h2>General Settings</h2>
                <p>Basic system configuration and preferences</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-group">
                  <h4>System Information</h4>
                  <div className="setting-item">
                    <label>System Name</label>
                    <input
                      type="text"
                      value={settings.organizationName}
                      onChange={(e) => handleSettingChange('organizationName', e.target.value)}
                      className="setting-input"
                    />
                  </div>

                  <div className="setting-item">
                    <label>System Description</label>
                    <textarea
                      value={settings.systemDescription || ''}
                      onChange={(e) => handleSettingChange('systemDescription', e.target.value)}
                      className="setting-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-group">
                  <h4>Localization</h4>
                  <div className="setting-item">
                    <label>Default Language</label>
                    <select
                      value={settings.defaultLanguage ?? 'en'}
                      onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                      className="setting-select"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <label>Timezone</label>
                    <select
                      value={settings.timezone ?? 'UTC+5:30'}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="setting-select"
                    >
                      <option value="UTC+5:30">IST (UTC+5:30)</option>
                      <option value="UTC+0">GMT (UTC+0)</option>
                      <option value="UTC-5">EST (UTC-5)</option>
                      <option value="UTC-8">PST (UTC-8)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-group">
                  <h4>System Mode</h4>
                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Maintenance Mode</span>
                        <span className="toggle-description">Put system in maintenance mode</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.maintenanceMode ? 'active' : ''}`}
                        onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                      >
                        {settings.maintenanceMode ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Debug Mode</span>
                        <span className="toggle-description">Enable detailed error logging</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.debugMode ? 'active' : ''}`}
                        onClick={() => handleSettingChange('debugMode', !settings.debugMode)}
                      >
                        {settings.debugMode ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <div className="settings-header">
              <FiShield className="section-icon" />
              <div>
                <h2>Security Settings</h2>
                <p>Configure password policies and security measures</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-group">
                  <h4>Password Policy</h4>
                  <div className="setting-item">
                    <label>Minimum Password Length</label>
                    <input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', e.target.value)}
                      className="setting-input"
                      min="6"
                      max="32"
                    />
                  </div>

                  <div className="setting-item">
                    <label>Password Expiry (Days)</label>
                    <input
                      type="number"
                      value={settings.passwordExpiryDays}
                      onChange={(e) => handleSettingChange('passwordExpiryDays', e.target.value)}
                      className="setting-input"
                      min="30"
                      max="365"
                    />
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-group">
                  <h4>Password Requirements</h4>
                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Require Uppercase Letters</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.passwordRequireUppercase ? 'active' : ''}`}
                        onClick={() => handleSettingChange('passwordRequireUppercase', !settings.passwordRequireUppercase)}
                      >
                        {settings.passwordRequireUppercase ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Require Numbers</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.passwordRequireNumbers ? 'active' : ''}`}
                        onClick={() => handleSettingChange('passwordRequireNumbers', !settings.passwordRequireNumbers)}
                      >
                        {settings.passwordRequireNumbers ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Require Special Characters</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.passwordRequireSpecialChars ? 'active' : ''}`}
                        onClick={() => handleSettingChange('passwordRequireSpecialChars', !settings.passwordRequireSpecialChars)}
                      >
                        {settings.passwordRequireSpecialChars ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Require Two-Factor Authentication</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.twoFactorRequired ? 'active' : ''}`}
                        onClick={() => handleSettingChange('twoFactorRequired', !settings.twoFactorRequired)}
                      >
                        {settings.twoFactorRequired ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-group">
                  <h4>Account Security</h4>
                  <div className="setting-item">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                      className="setting-input"
                      min="5"
                      max="480"
                    />
                  </div>

                  <div className="setting-item">
                    <label>Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
                      className="setting-input"
                      min="3"
                      max="10"
                    />
                  </div>

                  <div className="setting-item">
                    <label>Account Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      value={settings.accountLockoutDuration}
                      onChange={(e) => handleSettingChange('accountLockoutDuration', e.target.value)}
                      className="setting-input"
                      min="5"
                      max="1440"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );



      case 'notifications':
        return (
          <div className="settings-section">
            <div className="settings-header">
              <FiBell className="section-icon" />
              <div>
                <h2>Notification Settings</h2>
                <p>Configure system-wide notification preferences</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-group">
                  <h4>Email Notifications</h4>
                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Email Notifications</span>
                        <span className="toggle-description">Send system emails to users</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.emailNotifications ? 'active' : ''}`}
                        onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                      >
                        {settings.emailNotifications ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Contract Expiry Reminders</span>
                        <span className="toggle-description">Notify users about expiring contracts</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.contractExpiryReminders ? 'active' : ''}`}
                        onClick={() => handleSettingChange('contractExpiryReminders', !settings.contractExpiryReminders)}
                      >
                        {settings.contractExpiryReminders ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Approval Notifications</span>
                        <span className="toggle-description">Notify approvers of pending contracts</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.approvalNotifications ? 'active' : ''}`}
                        onClick={() => handleSettingChange('approvalNotifications', !settings.approvalNotifications)}
                      >
                        {settings.approvalNotifications ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-group">
                  <h4>System Alerts</h4>
                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Push Notifications</span>
                        <span className="toggle-description">Browser push notifications</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.pushNotifications ? 'active' : ''}`}
                        onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                      >
                        {settings.pushNotifications ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">System Alerts</span>
                        <span className="toggle-description">Critical system notifications</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.systemAlertsEnabled ? 'active' : ''}`}
                        onClick={() => handleSettingChange('systemAlertsEnabled', !settings.systemAlertsEnabled)}
                      >
                        {settings.systemAlertsEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Weekly Reports</span>
                        <span className="toggle-description">Send weekly system reports</span>
                      </div>
                      <button
                        className={`toggle-btn ${settings.weeklyReports ? 'active' : ''}`}
                        onClick={() => handleSettingChange('weeklyReports', !settings.weeklyReports)}
                      >
                        {settings.weeklyReports ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  return (
    <div className="admin-settings-dashboard">
      {/* Header */}
      <div className="settings-dashboard-header">
        <div className="header-content">
          <div className="header-icon">
            <FiSettings />
          </div>
          <div className="header-text">
            <h1>System Administration</h1>
            <p>Configure and manage system-wide settings</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? <FiRefreshCw className="spinning" /> : <FiSave />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FiSettings />
          General
        </button>
        <button
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FiShield />
          Security
        </button>

        <button
          className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <FiBell />
          Notifications
        </button>

      </div>

      {/* Content */}
      <div className="settings-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AdminSettings;
