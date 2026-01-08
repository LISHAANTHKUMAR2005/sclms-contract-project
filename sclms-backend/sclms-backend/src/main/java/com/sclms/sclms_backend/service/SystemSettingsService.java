package com.sclms.sclms_backend.service;

import com.sclms.sclms_backend.entity.SystemSettings;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.SystemSettingsRepository;
import com.sclms.sclms_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class SystemSettingsService {

    @Autowired
    private SystemSettingsRepository systemSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    // Get or create system settings (singleton pattern)
    public SystemSettings getSystemSettings() {
        return systemSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    SystemSettings defaultSettings = new SystemSettings();
                    return systemSettingsRepository.save(defaultSettings);
                });
    }

    // Update general settings
    @Transactional
    public SystemSettings updateGeneralSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("organizationName")) {
            settings.setOrganizationName((String) updates.get("organizationName"));
        }
        if (updates.containsKey("systemDescription")) {
            settings.setSystemDescription((String) updates.get("systemDescription"));
        }
        if (updates.containsKey("organizationLogo")) {
            settings.setOrganizationLogo((String) updates.get("organizationLogo"));
        }
        if (updates.containsKey("contactEmail")) {
            settings.setContactEmail((String) updates.get("contactEmail"));
        }
        if (updates.containsKey("supportLink")) {
            settings.setSupportLink((String) updates.get("supportLink"));
        }
        if (updates.containsKey("defaultLanguage")) {
            settings.setDefaultLanguage((String) updates.get("defaultLanguage"));
        }
        if (updates.containsKey("timezone")) {
            settings.setTimezone((String) updates.get("timezone"));
        }

        // Only set updatedBy if provided (may be null for permitAll endpoints)
        if (updatedBy != null) {
            settings.setUpdatedBy(updatedBy);
        }
        return systemSettingsRepository.save(settings);
    }

    // Update security settings
    @Transactional
    public SystemSettings updateSecuritySettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("passwordMinLength")) {
            settings.setPasswordMinLength((Integer) updates.get("passwordMinLength"));
        }
        if (updates.containsKey("passwordRequireUppercase")) {
            settings.setPasswordRequireUppercase((Boolean) updates.get("passwordRequireUppercase"));
        }
        if (updates.containsKey("passwordRequireNumbers")) {
            settings.setPasswordRequireNumbers((Boolean) updates.get("passwordRequireNumbers"));
        }
        if (updates.containsKey("passwordRequireSpecialChars")) {
            settings.setPasswordRequireSpecialChars((Boolean) updates.get("passwordRequireSpecialChars"));
        }
        if (updates.containsKey("passwordExpiryDays")) {
            settings.setPasswordExpiryDays((Integer) updates.get("passwordExpiryDays"));
        }
        if (updates.containsKey("sessionTimeout")) {
            settings.setSessionTimeout((Integer) updates.get("sessionTimeout"));
        }
        if (updates.containsKey("maxLoginAttempts")) {
            settings.setMaxLoginAttempts((Integer) updates.get("maxLoginAttempts"));
        }
        if (updates.containsKey("accountLockoutDuration")) {
            settings.setAccountLockoutDuration((Integer) updates.get("accountLockoutDuration"));
        }

        // Only set updatedBy if provided (may be null for permitAll endpoints)
        if (updatedBy != null) {
            settings.setUpdatedBy(updatedBy);
        }
        return systemSettingsRepository.save(settings);
    }

    // Update password policy
    @Transactional
    public SystemSettings updatePasswordPolicy(Map<String, Object> updates, Long updatedBy) {
        return updateSecuritySettings(updates, updatedBy);
    }

    // Update 2FA settings
    @Transactional
    public SystemSettings updateTwoFactorSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("twoFactorEnabled")) {
            settings.setTwoFactorEnabled((Boolean) updates.get("twoFactorEnabled"));
        }

        // Only set updatedBy if provided (may be null for permitAll endpoints)
        if (updatedBy != null) {
            settings.setUpdatedBy(updatedBy);
        }
        return systemSettingsRepository.save(settings);
    }

    // Update email settings
    @Transactional
    public SystemSettings updateEmailSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("smtpHost")) {
            settings.setSmtpHost((String) updates.get("smtpHost"));
        }
        if (updates.containsKey("smtpPort")) {
            settings.setSmtpPort((Integer) updates.get("smtpPort"));
        }
        if (updates.containsKey("smtpUsername")) {
            settings.setSmtpUsername((String) updates.get("smtpUsername"));
        }
        if (updates.containsKey("smtpPassword")) {
            settings.setSmtpPassword((String) updates.get("smtpPassword"));
        }
        if (updates.containsKey("smtpEncryption")) {
            settings.setSmtpEncryption((String) updates.get("smtpEncryption"));
        }
        if (updates.containsKey("emailFromAddress")) {
            settings.setEmailFromAddress((String) updates.get("emailFromAddress"));
        }
        if (updates.containsKey("emailFromName")) {
            settings.setEmailFromName((String) updates.get("emailFromName"));
        }

        settings.setUpdatedBy(updatedBy);
        return systemSettingsRepository.save(settings);
    }

    // Update notification settings
    @Transactional
    public SystemSettings updateNotificationSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("systemAlertsEnabled")) {
            settings.setSystemAlertsEnabled((Boolean) updates.get("systemAlertsEnabled"));
        }
        if (updates.containsKey("adminNotificationsEnabled")) {
            settings.setAdminNotificationsEnabled((Boolean) updates.get("adminNotificationsEnabled"));
        }
        if (updates.containsKey("emailNotificationsEnabled")) {
            settings.setEmailNotificationsEnabled((Boolean) updates.get("emailNotificationsEnabled"));
        }
        if (updates.containsKey("inAppNotificationsEnabled")) {
            settings.setInAppNotificationsEnabled((Boolean) updates.get("inAppNotificationsEnabled"));
        }

        settings.setUpdatedBy(updatedBy);
        return systemSettingsRepository.save(settings);
    }

    // Update database settings
    @Transactional
    public SystemSettings updateDatabaseSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("backupFrequency")) {
            settings.setBackupFrequency((String) updates.get("backupFrequency"));
        }
        if (updates.containsKey("backupRetentionDays")) {
            settings.setBackupRetentionDays((Integer) updates.get("backupRetentionDays"));
        }
        if (updates.containsKey("cleanupRetentionDays")) {
            settings.setCleanupRetentionDays((Integer) updates.get("cleanupRetentionDays"));
        }
        if (updates.containsKey("maintenanceModeEnabled")) {
            settings.setMaintenanceModeEnabled((Boolean) updates.get("maintenanceModeEnabled"));
        }
        if (updates.containsKey("autoOptimizeEnabled")) {
            settings.setAutoOptimizeEnabled((Boolean) updates.get("autoOptimizeEnabled"));
        }
        if (updates.containsKey("maintenanceWindow")) {
            settings.setMaintenanceWindow((String) updates.get("maintenanceWindow"));
        }
        if (updates.containsKey("maxConnections")) {
            settings.setMaxConnections((Integer) updates.get("maxConnections"));
        }

        settings.setUpdatedBy(updatedBy);
        return systemSettingsRepository.save(settings);
    }

    // Update user management settings
    @Transactional
    public SystemSettings updateUserSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("defaultUserRole")) {
            settings.setDefaultUserRole((String) updates.get("defaultUserRole"));
        }
        if (updates.containsKey("userAutoApprovalEnabled")) {
            settings.setUserAutoApprovalEnabled((Boolean) updates.get("userAutoApprovalEnabled"));
        }
        if (updates.containsKey("requireEmailVerification")) {
            settings.setRequireEmailVerification((Boolean) updates.get("requireEmailVerification"));
        }
        if (updates.containsKey("allowRegistration")) {
            settings.setAllowRegistration((Boolean) updates.get("allowRegistration"));
        }
        if (updates.containsKey("maxUsersPerOrg")) {
            settings.setMaxUsersPerOrg((Integer) updates.get("maxUsersPerOrg"));
        }
        if (updates.containsKey("onboardingEnabled")) {
            settings.setOnboardingEnabled((Boolean) updates.get("onboardingEnabled"));
        }

        settings.setUpdatedBy(updatedBy);
        return systemSettingsRepository.save(settings);
    }

    // Update API settings
    @Transactional
    public SystemSettings updateApiSettings(Map<String, Object> updates, Long updatedBy) {
        SystemSettings settings = getSystemSettings();

        if (updates.containsKey("apiBaseUrl")) {
            settings.setApiBaseUrl((String) updates.get("apiBaseUrl"));
        }
        if (updates.containsKey("apiRateLimit")) {
            settings.setApiRateLimit((Integer) updates.get("apiRateLimit"));
        }
        if (updates.containsKey("apiTimeout")) {
            settings.setApiTimeout((Integer) updates.get("apiTimeout"));
        }
        if (updates.containsKey("corsEnabled")) {
            settings.setCorsEnabled((Boolean) updates.get("corsEnabled"));
        }
        if (updates.containsKey("apiLoggingEnabled")) {
            settings.setApiLoggingEnabled((Boolean) updates.get("apiLoggingEnabled"));
        }
        if (updates.containsKey("webhookEnabled")) {
            settings.setWebhookEnabled((Boolean) updates.get("webhookEnabled"));
        }

        settings.setUpdatedBy(updatedBy);
        return systemSettingsRepository.save(settings);
    }

    // Get user by ID for updatedBy field
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
