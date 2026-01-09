package com.sclms.sclms_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // General Settings
    @Column(name = "organization_name")
    private String organizationName = "SCLMS Corporation";

    @Column(name = "system_description")
    private String systemDescription = "Contract Lifecycle Management System";

    @Column(name = "organization_logo")
    private String organizationLogo;

    @Column(name = "contact_email")
    private String contactEmail = "admin@sclms.com";

    @Column(name = "support_link")
    private String supportLink = "https://sclms.com/support";

    @Column(name = "default_language")
    private String defaultLanguage = "en";

    @Column(name = "timezone")
    private String timezone = "UTC+5:30";

    // Security Settings
    @Column(name = "password_min_length")
    private Integer passwordMinLength = 8;

    @Column(name = "password_require_uppercase")
    private Boolean passwordRequireUppercase = true;

    @Column(name = "password_require_numbers")
    private Boolean passwordRequireNumbers = true;

    @Column(name = "password_require_special_chars")
    private Boolean passwordRequireSpecialChars = false;

    @Column(name = "password_expiry_days")
    private Integer passwordExpiryDays = 90;

    @Column(name = "session_timeout")
    private Integer sessionTimeout = 30;

    @Column(name = "max_login_attempts")
    private Integer maxLoginAttempts = 5;

    @Column(name = "account_lockout_duration")
    private Integer accountLockoutDuration = 15;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;

    // Email Settings
    @Column(name = "smtp_host")
    private String smtpHost = "smtp.gmail.com";

    @Column(name = "smtp_port")
    private Integer smtpPort = 587;

    @Column(name = "smtp_username")
    private String smtpUsername;

    @Column(name = "smtp_password")
    private String smtpPassword;

    @Column(name = "smtp_encryption")
    private String smtpEncryption = "tls";

    @Column(name = "email_from_address")
    private String emailFromAddress = "noreply@sclms.com";

    @Column(name = "email_from_name")
    private String emailFromName = "SCLMS System";

    // Notification Settings
    @Column(name = "system_alerts_enabled")
    private Boolean systemAlertsEnabled = true;

    @Column(name = "admin_notifications_enabled")
    private Boolean adminNotificationsEnabled = true;

    @Column(name = "email_notifications_enabled")
    private Boolean emailNotificationsEnabled = true;

    @Column(name = "in_app_notifications_enabled")
    private Boolean inAppNotificationsEnabled = true;

    // Database Settings
    @Column(name = "backup_frequency")
    private String backupFrequency = "daily";

    @Column(name = "backup_retention_days")
    private Integer backupRetentionDays = 30;

    @Column(name = "cleanup_retention_days")
    private Integer cleanupRetentionDays = 90;

    @Column(name = "maintenance_mode_enabled")
    private Boolean maintenanceModeEnabled = false;

    @Column(name = "auto_optimize_enabled")
    private Boolean autoOptimizeEnabled = true;

    @Column(name = "maintenance_window")
    private String maintenanceWindow = "02:00";

    @Column(name = "max_connections")
    private Integer maxConnections = 100;

    // User Management Settings
    @Column(name = "default_user_role")
    private String defaultUserRole = "USER";

    @Column(name = "user_auto_approval_enabled")
    private Boolean userAutoApprovalEnabled = false;

    @Column(name = "require_email_verification")
    private Boolean requireEmailVerification = true;

    @Column(name = "allow_registration")
    private Boolean allowRegistration = true;

    @Column(name = "max_users_per_org")
    private Integer maxUsersPerOrg = 100;

    @Column(name = "onboarding_enabled")
    private Boolean onboardingEnabled = true;

    // API Settings
    @Column(name = "api_base_url")
    private String apiBaseUrl = "http://localhost:8082/api";

    @Column(name = "api_rate_limit")
    private Integer apiRateLimit = 1000;

    @Column(name = "api_timeout")
    private Integer apiTimeout = 30;

    @Column(name = "cors_enabled")
    private Boolean corsEnabled = true;

    @Column(name = "api_logging_enabled")
    private Boolean apiLoggingEnabled = true;

    @Column(name = "webhook_enabled")
    private Boolean webhookEnabled = false;

    // Metadata
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Manual getters and setters for compilation compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getSystemDescription() { return systemDescription; }
    public void setSystemDescription(String systemDescription) { this.systemDescription = systemDescription; }

    public String getOrganizationLogo() { return organizationLogo; }
    public void setOrganizationLogo(String organizationLogo) { this.organizationLogo = organizationLogo; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getSupportLink() { return supportLink; }
    public void setSupportLink(String supportLink) { this.supportLink = supportLink; }

    public String getDefaultLanguage() { return defaultLanguage; }
    public void setDefaultLanguage(String defaultLanguage) { this.defaultLanguage = defaultLanguage; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Integer getPasswordMinLength() { return passwordMinLength; }
    public void setPasswordMinLength(Integer passwordMinLength) { this.passwordMinLength = passwordMinLength; }

    public Boolean getPasswordRequireUppercase() { return passwordRequireUppercase; }
    public void setPasswordRequireUppercase(Boolean passwordRequireUppercase) { this.passwordRequireUppercase = passwordRequireUppercase; }

    public Boolean getPasswordRequireNumbers() { return passwordRequireNumbers; }
    public void setPasswordRequireNumbers(Boolean passwordRequireNumbers) { this.passwordRequireNumbers = passwordRequireNumbers; }

    public Boolean getPasswordRequireSpecialChars() { return passwordRequireSpecialChars; }
    public void setPasswordRequireSpecialChars(Boolean passwordRequireSpecialChars) { this.passwordRequireSpecialChars = passwordRequireSpecialChars; }

    public Integer getPasswordExpiryDays() { return passwordExpiryDays; }
    public void setPasswordExpiryDays(Integer passwordExpiryDays) { this.passwordExpiryDays = passwordExpiryDays; }

    public Integer getSessionTimeout() { return sessionTimeout; }
    public void setSessionTimeout(Integer sessionTimeout) { this.sessionTimeout = sessionTimeout; }

    public Integer getMaxLoginAttempts() { return maxLoginAttempts; }
    public void setMaxLoginAttempts(Integer maxLoginAttempts) { this.maxLoginAttempts = maxLoginAttempts; }

    public Integer getAccountLockoutDuration() { return accountLockoutDuration; }
    public void setAccountLockoutDuration(Integer accountLockoutDuration) { this.accountLockoutDuration = accountLockoutDuration; }

    public Boolean getTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }

    public String getSmtpHost() { return smtpHost; }
    public void setSmtpHost(String smtpHost) { this.smtpHost = smtpHost; }

    public Integer getSmtpPort() { return smtpPort; }
    public void setSmtpPort(Integer smtpPort) { this.smtpPort = smtpPort; }

    public String getSmtpUsername() { return smtpUsername; }
    public void setSmtpUsername(String smtpUsername) { this.smtpUsername = smtpUsername; }

    public String getSmtpPassword() { return smtpPassword; }
    public void setSmtpPassword(String smtpPassword) { this.smtpPassword = smtpPassword; }

    public String getSmtpEncryption() { return smtpEncryption; }
    public void setSmtpEncryption(String smtpEncryption) { this.smtpEncryption = smtpEncryption; }

    public String getEmailFromAddress() { return emailFromAddress; }
    public void setEmailFromAddress(String emailFromAddress) { this.emailFromAddress = emailFromAddress; }

    public String getEmailFromName() { return emailFromName; }
    public void setEmailFromName(String emailFromName) { this.emailFromName = emailFromName; }

    public Boolean getSystemAlertsEnabled() { return systemAlertsEnabled; }
    public void setSystemAlertsEnabled(Boolean systemAlertsEnabled) { this.systemAlertsEnabled = systemAlertsEnabled; }

    public Boolean getAdminNotificationsEnabled() { return adminNotificationsEnabled; }
    public void setAdminNotificationsEnabled(Boolean adminNotificationsEnabled) { this.adminNotificationsEnabled = adminNotificationsEnabled; }

    public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }

    public Boolean getInAppNotificationsEnabled() { return inAppNotificationsEnabled; }
    public void setInAppNotificationsEnabled(Boolean inAppNotificationsEnabled) { this.inAppNotificationsEnabled = inAppNotificationsEnabled; }

    public String getBackupFrequency() { return backupFrequency; }
    public void setBackupFrequency(String backupFrequency) { this.backupFrequency = backupFrequency; }

    public Integer getBackupRetentionDays() { return backupRetentionDays; }
    public void setBackupRetentionDays(Integer backupRetentionDays) { this.backupRetentionDays = backupRetentionDays; }

    public Integer getCleanupRetentionDays() { return cleanupRetentionDays; }
    public void setCleanupRetentionDays(Integer cleanupRetentionDays) { this.cleanupRetentionDays = cleanupRetentionDays; }

    public Boolean getMaintenanceModeEnabled() { return maintenanceModeEnabled; }
    public void setMaintenanceModeEnabled(Boolean maintenanceModeEnabled) { this.maintenanceModeEnabled = maintenanceModeEnabled; }

    public Boolean getAutoOptimizeEnabled() { return autoOptimizeEnabled; }
    public void setAutoOptimizeEnabled(Boolean autoOptimizeEnabled) { this.autoOptimizeEnabled = autoOptimizeEnabled; }

    public String getMaintenanceWindow() { return maintenanceWindow; }
    public void setMaintenanceWindow(String maintenanceWindow) { this.maintenanceWindow = maintenanceWindow; }

    public Integer getMaxConnections() { return maxConnections; }
    public void setMaxConnections(Integer maxConnections) { this.maxConnections = maxConnections; }

    public String getDefaultUserRole() { return defaultUserRole; }
    public void setDefaultUserRole(String defaultUserRole) { this.defaultUserRole = defaultUserRole; }

    public Boolean getUserAutoApprovalEnabled() { return userAutoApprovalEnabled; }
    public void setUserAutoApprovalEnabled(Boolean userAutoApprovalEnabled) { this.userAutoApprovalEnabled = userAutoApprovalEnabled; }

    public Boolean getRequireEmailVerification() { return requireEmailVerification; }
    public void setRequireEmailVerification(Boolean requireEmailVerification) { this.requireEmailVerification = requireEmailVerification; }

    public Boolean getAllowRegistration() { return allowRegistration; }
    public void setAllowRegistration(Boolean allowRegistration) { this.allowRegistration = allowRegistration; }

    public Integer getMaxUsersPerOrg() { return maxUsersPerOrg; }
    public void setMaxUsersPerOrg(Integer maxUsersPerOrg) { this.maxUsersPerOrg = maxUsersPerOrg; }

    public Boolean getOnboardingEnabled() { return onboardingEnabled; }
    public void setOnboardingEnabled(Boolean onboardingEnabled) { this.onboardingEnabled = onboardingEnabled; }

    public String getApiBaseUrl() { return apiBaseUrl; }
    public void setApiBaseUrl(String apiBaseUrl) { this.apiBaseUrl = apiBaseUrl; }

    public Integer getApiRateLimit() { return apiRateLimit; }
    public void setApiRateLimit(Integer apiRateLimit) { this.apiRateLimit = apiRateLimit; }

    public Integer getApiTimeout() { return apiTimeout; }
    public void setApiTimeout(Integer apiTimeout) { this.apiTimeout = apiTimeout; }

    public Boolean getCorsEnabled() { return corsEnabled; }
    public void setCorsEnabled(Boolean corsEnabled) { this.corsEnabled = corsEnabled; }

    public Boolean getApiLoggingEnabled() { return apiLoggingEnabled; }
    public void setApiLoggingEnabled(Boolean apiLoggingEnabled) { this.apiLoggingEnabled = apiLoggingEnabled; }

    public Boolean getWebhookEnabled() { return webhookEnabled; }
    public void setWebhookEnabled(Boolean webhookEnabled) { this.webhookEnabled = webhookEnabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
}
