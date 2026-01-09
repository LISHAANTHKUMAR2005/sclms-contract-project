package com.sclms.sclms_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // USER | APPROVER | ADMIN
    @Column(nullable = false)
    private String role;

    // PENDING | APPROVED | REJECTED
    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String organization;

    @Column(name = "created_date")
    private String createdDate;

    // ==============================
    // DEFAULT VALUES ADDED HERE 🔥
    // ==============================

    @Column(name = "browser_notifications", nullable = false)
    private Boolean browserNotifications = true;

    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Column(name = "system_notifications", nullable = false)
    private Boolean systemNotifications = true;

    @Column(name = "contract_alerts", nullable = false)
    private Boolean contractAlerts = true;

    @Column(name = "expiration_reminders", nullable = false)
    private Boolean expirationReminders = true;

    @Column(name = "two_factor_enabled", nullable = false)
    private Boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "last_password_changed_at", nullable = true)
    private LocalDateTime lastPasswordChangedAt;

    // ==============================
    // ACCOUNT SECURITY FIELDS
    // ==============================

    @Column(name = "login_attempts", nullable = false)
    private Integer loginAttempts = 0;

    @Column(name = "account_locked", nullable = false)
    private Boolean accountLocked = false;

    @Column(name = "lockout_until")
    private LocalDateTime lockoutUntil;

    @Column(name = "last_failed_login_at")
    private LocalDateTime lastFailedLoginAt;

    @Column(name = "force_password_reset", nullable = false)
    private Boolean forcePasswordReset = false;

    // ==============================
    // SAFE DEFAULTS VIA @PrePersist
    // ==============================

    @PrePersist
    public void prePersist() {
        if (lastPasswordChangedAt == null) {
            lastPasswordChangedAt = LocalDateTime.now();
        }
        // 2FA fields already have defaults above
    }

    // Manual getters and setters for Lombok compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public Boolean getBrowserNotifications() { return browserNotifications; }
    public void setBrowserNotifications(Boolean browserNotifications) { this.browserNotifications = browserNotifications; }

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public Boolean getSystemNotifications() { return systemNotifications; }
    public void setSystemNotifications(Boolean systemNotifications) { this.systemNotifications = systemNotifications; }

    public Boolean getContractAlerts() { return contractAlerts; }
    public void setContractAlerts(Boolean contractAlerts) { this.contractAlerts = contractAlerts; }

    public Boolean getExpirationReminders() { return expirationReminders; }
    public void setExpirationReminders(Boolean expirationReminders) { this.expirationReminders = expirationReminders; }

    public Boolean getTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }

    public String getTwoFactorSecret() { return twoFactorSecret; }
    public void setTwoFactorSecret(String twoFactorSecret) { this.twoFactorSecret = twoFactorSecret; }

    public LocalDateTime getLastPasswordChangedAt() { return lastPasswordChangedAt; }
    public void setLastPasswordChangedAt(LocalDateTime lastPasswordChangedAt) { this.lastPasswordChangedAt = lastPasswordChangedAt; }

    public Integer getLoginAttempts() { return loginAttempts; }
    public void setLoginAttempts(Integer loginAttempts) { this.loginAttempts = loginAttempts; }

    public Boolean getAccountLocked() { return accountLocked; }
    public void setAccountLocked(Boolean accountLocked) { this.accountLocked = accountLocked; }

    public LocalDateTime getLockoutUntil() { return lockoutUntil; }
    public void setLockoutUntil(LocalDateTime lockoutUntil) { this.lockoutUntil = lockoutUntil; }

    public LocalDateTime getLastFailedLoginAt() { return lastFailedLoginAt; }
    public void setLastFailedLoginAt(LocalDateTime lastFailedLoginAt) { this.lastFailedLoginAt = lastFailedLoginAt; }

    public Boolean getForcePasswordReset() { return forcePasswordReset; }
    public void setForcePasswordReset(Boolean forcePasswordReset) { this.forcePasswordReset = forcePasswordReset; }
}
