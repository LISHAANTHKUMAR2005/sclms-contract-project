package com.sclms.sclms_backend.service;

import com.sclms.sclms_backend.entity.SystemSettings;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.SystemSettingsRepository;
import com.sclms.sclms_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class SecurityService {

    @Autowired
    private SystemSettingsRepository systemSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get system security settings
    public SystemSettings getSecuritySettings() {
        return systemSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> systemSettingsRepository.save(new SystemSettings()));
    }

    // Validate password against policy
    public void validatePasswordPolicy(String password) throws IllegalArgumentException {
        SystemSettings settings = getSecuritySettings();

        // Check minimum length
        if (password.length() < settings.getPasswordMinLength()) {
            throw new IllegalArgumentException("Password must be at least " + settings.getPasswordMinLength() + " characters long");
        }

        // Check for uppercase letters
        if (settings.getPasswordRequireUppercase() &&
            !Pattern.compile("[A-Z]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }

        // Check for numbers
        if (settings.getPasswordRequireNumbers() &&
            !Pattern.compile("[0-9]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }

        // Check for special characters
        if (settings.getPasswordRequireSpecialChars() &&
            !Pattern.compile("[!@#$%^&*()_+-=\\[\\]{}|;':\",./<>?]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }

    // Check if password has expired
    public boolean isPasswordExpired(User user) {
        if (user.getLastPasswordChangedAt() == null) {
            return false; // Never changed, assume valid
        }

        SystemSettings settings = getSecuritySettings();
        LocalDateTime expiryDate = user.getLastPasswordChangedAt().plusDays(settings.getPasswordExpiryDays());
        return LocalDateTime.now().isAfter(expiryDate);
    }

    // Check if account is locked
    public boolean isAccountLocked(User user) {
        if (user.getAccountLocked() == null) return false;

        // Check if lockout period has expired
        if (user.getAccountLocked() && user.getLockoutUntil() != null) {
            if (LocalDateTime.now().isAfter(user.getLockoutUntil())) {
                // Lockout expired, unlock account
                unlockAccount(user);
                return false;
            }
        }
        return user.getAccountLocked();
    }

    // Record failed login attempt
    @Transactional
    public void recordFailedLogin(User user) {
        SystemSettings settings = getSecuritySettings();

        Integer attempts = user.getLoginAttempts() != null ? user.getLoginAttempts() : 0;
        attempts++;

        user.setLoginAttempts(attempts);
        user.setLastFailedLoginAt(LocalDateTime.now());

        // Check if max attempts reached
        if (attempts >= settings.getMaxLoginAttempts()) {
            lockAccount(user);
        }

        userRepository.save(user);
    }

    // Clear login attempts on successful login
    @Transactional
    public void clearLoginAttempts(User user) {
        user.setLoginAttempts(0);
        user.setLastFailedLoginAt(null);
        userRepository.save(user);
    }

    // Lock account
    @Transactional
    private void lockAccount(User user) {
        SystemSettings settings = getSecuritySettings();

        user.setAccountLocked(true);
        user.setLockoutUntil(LocalDateTime.now().plusMinutes(settings.getAccountLockoutDuration()));

        userRepository.save(user);
    }

    // Unlock account
    @Transactional
    public void unlockAccount(User user) {
        user.setAccountLocked(false);
        user.setLoginAttempts(0);
        user.setLockoutUntil(null);
        user.setLastFailedLoginAt(null);

        userRepository.save(user);
    }

    // Check if 2FA is required for user
    public boolean isTwoFactorRequired(User user) {
        SystemSettings settings = getSecuritySettings();

        // System-wide 2FA requirement
        if (settings.getTwoFactorEnabled() != null && settings.getTwoFactorEnabled()) {
            return true;
        }

        // User-specific 2FA setting
        return user.getTwoFactorEnabled() != null && user.getTwoFactorEnabled();
    }

    // Hash password
    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    // Validate password
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    // Check session timeout
    public boolean isSessionExpired(LocalDateTime lastActivity, int sessionTimeoutMinutes) {
        if (lastActivity == null) return false;

        LocalDateTime expiryTime = lastActivity.plusMinutes(sessionTimeoutMinutes);
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
