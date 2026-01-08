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
}
