package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.entity.SystemSettings;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsService systemSettingsService;

    // Get current user from authentication (may be null for permitAll endpoints)
    private User getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    // GENERAL SETTINGS
    @GetMapping("/general")
    public ResponseEntity<?> getGeneralSettings(Authentication authentication) {
        System.out.println("🎯 SETTINGS CONTROLLER: getGeneralSettings called");
        try {
            User currentUser = getCurrentUser(authentication);
            System.out.println("🎯 SETTINGS CONTROLLER: User authenticated: " + currentUser.getEmail());
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("organizationName", settings.getOrganizationName());
            response.put("systemDescription", settings.getSystemDescription());
            response.put("organizationLogo", settings.getOrganizationLogo());
            response.put("contactEmail", settings.getContactEmail());
            response.put("supportLink", settings.getSupportLink());
            response.put("defaultLanguage", settings.getDefaultLanguage());
            response.put("timezone", settings.getTimezone());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load general settings"));
        }
    }

    @PutMapping("/general/update")
    public ResponseEntity<?> updateGeneralSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateGeneralSettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("organizationName", updatedSettings.getOrganizationName());
            response.put("systemDescription", updatedSettings.getSystemDescription());
            response.put("organizationLogo", updatedSettings.getOrganizationLogo());
            response.put("contactEmail", updatedSettings.getContactEmail());
            response.put("supportLink", updatedSettings.getSupportLink());
            response.put("defaultLanguage", updatedSettings.getDefaultLanguage());
            response.put("timezone", updatedSettings.getTimezone());
            response.put("message", "General settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update general settings"));
        }
    }

    // SECURITY SETTINGS
    @GetMapping("/security")
    public ResponseEntity<?> getSecuritySettings(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("passwordMinLength", settings.getPasswordMinLength());
            response.put("passwordRequireUppercase", settings.getPasswordRequireUppercase());
            response.put("passwordRequireNumbers", settings.getPasswordRequireNumbers());
            response.put("passwordRequireSpecialChars", settings.getPasswordRequireSpecialChars());
            response.put("passwordExpiryDays", settings.getPasswordExpiryDays());
            response.put("sessionTimeout", settings.getSessionTimeout());
            response.put("maxLoginAttempts", settings.getMaxLoginAttempts());
            response.put("accountLockoutDuration", settings.getAccountLockoutDuration());
            response.put("twoFactorEnabled", settings.getTwoFactorEnabled());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load security settings"));
        }
    }

    @PutMapping("/security/update")
    public ResponseEntity<?> updateSecuritySettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateSecuritySettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("passwordMinLength", updatedSettings.getPasswordMinLength());
            response.put("passwordRequireUppercase", updatedSettings.getPasswordRequireUppercase());
            response.put("passwordRequireNumbers", updatedSettings.getPasswordRequireNumbers());
            response.put("passwordRequireSpecialChars", updatedSettings.getPasswordRequireSpecialChars());
            response.put("passwordExpiryDays", updatedSettings.getPasswordExpiryDays());
            response.put("sessionTimeout", updatedSettings.getSessionTimeout());
            response.put("maxLoginAttempts", updatedSettings.getMaxLoginAttempts());
            response.put("accountLockoutDuration", updatedSettings.getAccountLockoutDuration());
            response.put("twoFactorEnabled", updatedSettings.getTwoFactorEnabled());
            response.put("message", "Security settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update security settings"));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePasswordPolicy(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updatePasswordPolicy(updates, currentUser.getId());

            return ResponseEntity.ok(Map.of("message", "Password policy updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update password policy"));
        }
    }

    @PutMapping("/2fa")
    public ResponseEntity<?> updateTwoFactorSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateTwoFactorSettings(updates, currentUser.getId());

            return ResponseEntity.ok(Map.of("message", "Two-factor authentication settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update 2FA settings"));
        }
    }

    // EMAIL SETTINGS
    @GetMapping("/email")
    public ResponseEntity<?> getEmailSettings(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("smtpHost", settings.getSmtpHost());
            response.put("smtpPort", settings.getSmtpPort());
            response.put("smtpUsername", settings.getSmtpUsername());
            response.put("smtpEncryption", settings.getSmtpEncryption());
            response.put("emailFromAddress", settings.getEmailFromAddress());
            response.put("emailFromName", settings.getEmailFromName());
            // Don't return password for security

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load email settings"));
        }
    }

    @PutMapping("/email/update")
    public ResponseEntity<?> updateEmailSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateEmailSettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("smtpHost", updatedSettings.getSmtpHost());
            response.put("smtpPort", updatedSettings.getSmtpPort());
            response.put("smtpUsername", updatedSettings.getSmtpUsername());
            response.put("smtpEncryption", updatedSettings.getSmtpEncryption());
            response.put("emailFromAddress", updatedSettings.getEmailFromAddress());
            response.put("emailFromName", updatedSettings.getEmailFromName());
            response.put("message", "Email settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update email settings"));
        }
    }

    // NOTIFICATION SETTINGS
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotificationSettings(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("systemAlertsEnabled", settings.getSystemAlertsEnabled());
            response.put("adminNotificationsEnabled", settings.getAdminNotificationsEnabled());
            response.put("emailNotificationsEnabled", settings.getEmailNotificationsEnabled());
            response.put("inAppNotificationsEnabled", settings.getInAppNotificationsEnabled());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load notification settings"));
        }
    }

    @PutMapping("/notifications/update")
    public ResponseEntity<?> updateNotificationSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateNotificationSettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("systemAlertsEnabled", updatedSettings.getSystemAlertsEnabled());
            response.put("adminNotificationsEnabled", updatedSettings.getAdminNotificationsEnabled());
            response.put("emailNotificationsEnabled", updatedSettings.getEmailNotificationsEnabled());
            response.put("inAppNotificationsEnabled", updatedSettings.getInAppNotificationsEnabled());
            response.put("message", "Notification settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update notification settings"));
        }
    }

    // DATABASE SETTINGS
    @GetMapping("/database")
    public ResponseEntity<?> getDatabaseSettings(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("backupFrequency", settings.getBackupFrequency());
            response.put("backupRetentionDays", settings.getBackupRetentionDays());
            response.put("cleanupRetentionDays", settings.getCleanupRetentionDays());
            response.put("maintenanceModeEnabled", settings.getMaintenanceModeEnabled());
            response.put("autoOptimizeEnabled", settings.getAutoOptimizeEnabled());
            response.put("maintenanceWindow", settings.getMaintenanceWindow());
            response.put("maxConnections", settings.getMaxConnections());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load database settings"));
        }
    }

    @PutMapping("/database/update")
    public ResponseEntity<?> updateDatabaseSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateDatabaseSettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("backupFrequency", updatedSettings.getBackupFrequency());
            response.put("backupRetentionDays", updatedSettings.getBackupRetentionDays());
            response.put("cleanupRetentionDays", updatedSettings.getCleanupRetentionDays());
            response.put("maintenanceModeEnabled", updatedSettings.getMaintenanceModeEnabled());
            response.put("autoOptimizeEnabled", updatedSettings.getAutoOptimizeEnabled());
            response.put("maintenanceWindow", updatedSettings.getMaintenanceWindow());
            response.put("maxConnections", updatedSettings.getMaxConnections());
            response.put("message", "Database settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update database settings"));
        }
    }

    // USER MANAGEMENT SETTINGS
    @GetMapping("/users/config")
    public ResponseEntity<?> getUserSettings(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("defaultUserRole", settings.getDefaultUserRole());
            response.put("userAutoApprovalEnabled", settings.getUserAutoApprovalEnabled());
            response.put("requireEmailVerification", settings.getRequireEmailVerification());
            response.put("allowRegistration", settings.getAllowRegistration());
            response.put("maxUsersPerOrg", settings.getMaxUsersPerOrg());
            response.put("onboardingEnabled", settings.getOnboardingEnabled());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load user management settings"));
        }
    }

    @PutMapping("/users/config/update")
    public ResponseEntity<?> updateUserSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateUserSettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("defaultUserRole", updatedSettings.getDefaultUserRole());
            response.put("userAutoApprovalEnabled", updatedSettings.getUserAutoApprovalEnabled());
            response.put("requireEmailVerification", updatedSettings.getRequireEmailVerification());
            response.put("allowRegistration", updatedSettings.getAllowRegistration());
            response.put("maxUsersPerOrg", updatedSettings.getMaxUsersPerOrg());
            response.put("onboardingEnabled", updatedSettings.getOnboardingEnabled());
            response.put("message", "User management settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user management settings"));
        }
    }

    // API SETTINGS
    @GetMapping("/api")
    public ResponseEntity<?> getApiSettings(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings settings = systemSettingsService.getSystemSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("apiBaseUrl", settings.getApiBaseUrl());
            response.put("apiRateLimit", settings.getApiRateLimit());
            response.put("apiTimeout", settings.getApiTimeout());
            response.put("corsEnabled", settings.getCorsEnabled());
            response.put("apiLoggingEnabled", settings.getApiLoggingEnabled());
            response.put("webhookEnabled", settings.getWebhookEnabled());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load API settings"));
        }
    }

    @PutMapping("/api/update")
    public ResponseEntity<?> updateApiSettings(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            SystemSettings updatedSettings = systemSettingsService.updateApiSettings(updates, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("apiBaseUrl", updatedSettings.getApiBaseUrl());
            response.put("apiRateLimit", updatedSettings.getApiRateLimit());
            response.put("apiTimeout", updatedSettings.getApiTimeout());
            response.put("corsEnabled", updatedSettings.getCorsEnabled());
            response.put("apiLoggingEnabled", updatedSettings.getApiLoggingEnabled());
            response.put("webhookEnabled", updatedSettings.getWebhookEnabled());
            response.put("message", "API settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update API settings"));
        }
    }
}
