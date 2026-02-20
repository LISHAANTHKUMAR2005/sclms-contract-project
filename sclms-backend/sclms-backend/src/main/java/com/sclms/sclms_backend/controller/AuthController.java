package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.dto.RegisterRequest;
import com.sclms.sclms_backend.entity.Contract;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.ContractRepository;
import com.sclms.sclms_backend.repository.UserRepository;
import com.sclms.sclms_backend.security.JwtUtil;
import com.sclms.sclms_backend.service.SecurityService;
import com.sclms.sclms_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final UserService userService;
    private final SecurityService securityService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, ContractRepository contractRepository, UserService userService,
            SecurityService securityService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.contractRepository = contractRepository;
        this.userService = userService;
        this.securityService = securityService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostConstruct
    public void initDefaultUsers() {
        try {
            // ==========================================
            // GUARANTEED ADMIN CREATION / RESET
            // ==========================================
            String adminEmail = "admin@sclms.com";

            User admin = userRepository.findByEmail(adminEmail).orElse(new User());

            admin.setName("System Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123")); // Always reset password
            admin.setRole("ADMIN");
            admin.setStatus("APPROVED");
            admin.setOrganization("SCLMS");
            admin.setCreatedDate(java.time.LocalDate.now().toString());

            // Security defaults
            admin.setAccountLocked(false);
            admin.setLoginAttempts(0);
            admin.setForcePasswordReset(false);
            admin.setTwoFactorEnabled(false);

            userRepository.save(admin);
            System.out.println("✅ ADMIN USER SYNCED: " + adminEmail);

        } catch (Exception e) {
            System.err.println("Error initializing admin user: " + e.getMessage());
        }
    }

    private void createSampleContracts() {
        try {
            User admin = userRepository.findByEmail("admin@sclms.com").orElse(null);
            User approver = userRepository.findByEmail("approver@sclms.com").orElse(null);
            User user = userRepository.findByEmail("user@sclms.com").orElse(null);

            if (admin != null && approver != null && user != null) {
                // Create sample pending contract
                Contract pendingContract = new Contract();
                pendingContract.setTitle("IT Infrastructure Upgrade");
                pendingContract.setDescription(
                        "Complete upgrade of company IT infrastructure including servers, networking equipment, and software licenses.");
                pendingContract.setContractType("SERVICE");
                pendingContract.setFromOrg("TechCorp");
                pendingContract.setToOrg("SCLMS");
                pendingContract.setStartDate(LocalDateTime.parse("2026-02-01T00:00:00"));
                pendingContract.setEndDate(LocalDateTime.parse("2026-12-31T23:59:59"));
                pendingContract.setStatus("PENDING");
                pendingContract.setCreatedDate(LocalDateTime.now().minusDays(2));
                pendingContract.setCreatedBy(user.getId());
                contractRepository.save(pendingContract);
                System.out.println("✅ Sample pending contract created");

                // Create sample approved contract
                Contract approvedContract = new Contract();
                approvedContract.setTitle("Office Maintenance Services");
                approvedContract.setDescription(
                        "Monthly maintenance services for office facilities including cleaning, security, and equipment servicing.");
                approvedContract.setContractType("MAINTENANCE");
                approvedContract.setFromOrg("TechCorp");
                approvedContract.setToOrg("SCLMS");
                approvedContract.setStartDate(LocalDateTime.parse("2026-01-15T00:00:00"));
                approvedContract.setEndDate(LocalDateTime.parse("2026-12-31T23:59:59"));
                approvedContract.setStatus("APPROVED");
                approvedContract.setCreatedDate(LocalDateTime.now().minusDays(5));
                approvedContract.setApprovedDate(LocalDateTime.now().minusDays(3));
                approvedContract.setCreatedBy(user.getId());
                approvedContract.setApprovedBy(approver.getId());
                approvedContract.setApproverComments("Approved after reviewing service terms");
                contractRepository.save(approvedContract);
                System.out.println("✅ Sample approved contract created");

                // Create sample rejected contract
                Contract rejectedContract = new Contract();
                rejectedContract.setTitle("Marketing Campaign Services");
                rejectedContract.setDescription(
                        "Comprehensive digital marketing campaign including social media, content creation, and analytics.");
                rejectedContract.setContractType("SERVICE");
                rejectedContract.setFromOrg("TechCorp");
                rejectedContract.setToOrg("SCLMS");
                rejectedContract.setStartDate(LocalDateTime.parse("2026-03-01T00:00:00"));
                rejectedContract.setEndDate(LocalDateTime.parse("2026-08-31T23:59:59"));
                rejectedContract.setStatus("REJECTED");
                rejectedContract.setCreatedDate(LocalDateTime.now().minusDays(1));
                rejectedContract.setApprovedDate(LocalDateTime.now().minusHours(12));
                rejectedContract.setCreatedBy(user.getId());
                rejectedContract.setApprovedBy(approver.getId());
                rejectedContract.setApproverComments("Budget constraints");
                rejectedContract.setRejectionReason("Insufficient budget allocation for this fiscal year");
                contractRepository.save(rejectedContract);
                System.out.println("✅ Sample rejected contract created");

                System.out.println("✅ All sample contracts created successfully!");
            }
        } catch (Exception e) {
            System.err.println("Error creating sample contracts: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        try {
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                for (FieldError error : bindingResult.getFieldErrors()) {
                    errors.put(error.getField(), error.getDefaultMessage());
                }
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Validation failed",
                        "fieldErrors", errors));
            }

            // Create user entity from validated request
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setOrganization(request.getOrganization());

            // Set default values for registration
            user.setRole("USER");
            user.setStatus("PENDING");
            user.setCreatedDate(java.time.LocalDate.now().toString());

            // Set default notification preferences
            user.setBrowserNotifications(true);
            user.setEmailNotifications(true);
            user.setSystemNotifications(true);
            user.setContractAlerts(true);
            user.setExpirationReminders(true);
            user.setTwoFactorEnabled(false);

            // Set account security defaults
            user.setAccountLocked(false);
            user.setLoginAttempts(0);
            user.setForcePasswordReset(false);

            User savedUser = userService.createUser(user);

            // Create a safe response object without sensitive data
            Map<String, Object> userResponse = Map.of(
                    "id", savedUser.getId(),
                    "name", savedUser.getName(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole(),
                    "status", savedUser.getStatus(),
                    "organization", savedUser.getOrganization(),
                    "createdDate", savedUser.getCreatedDate());

            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful. Please wait for approval.",
                    "user", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        System.out.println("🔥 LOGIN ENDPOINT HIT for: " + loginRequest.getEmail());

        // ================= EMERGENCY ADMIN LOGIN =================
        // TEMPORARY - REMOVE AFTER RECOVERY
        if (loginRequest.getEmail() != null &&
                "admin@sclms.com".equalsIgnoreCase(loginRequest.getEmail().trim())
                && "admin123".equals(loginRequest.getPassword())) {

            System.out.println("🔥 EMERGENCY ADMIN LOGIN TRIPPED");

            User admin = userRepository.findByEmail("admin@sclms.com")
                    .orElseGet(() -> {
                        System.out.println("🔥 RE-CREATING MISSING ADMIN");
                        User newAdmin = new User();

                        newAdmin.setName("System Administrator");
                        newAdmin.setEmail("admin@sclms.com");
                        newAdmin.setPassword(passwordEncoder.encode("admin123"));
                        newAdmin.setRole("ADMIN");
                        newAdmin.setStatus("APPROVED");
                        newAdmin.setOrganization("SCLMS");

                        newAdmin.setAccountLocked(false);
                        newAdmin.setLoginAttempts(0);
                        newAdmin.setForcePasswordReset(false);
                        newAdmin.setTwoFactorEnabled(false);

                        newAdmin.setCreatedDate(java.time.LocalDate.now().toString());

                        return userRepository.save(newAdmin);
                    });

            // Ensure Approved
            if (!"APPROVED".equals(admin.getStatus())) {
                admin.setStatus("APPROVED");
                userRepository.save(admin);
            }

            // Reset lock if any
            admin.setAccountLocked(false);
            admin.setLoginAttempts(0);
            admin.setLockoutUntil(null);
            admin.setLastFailedLoginAt(null);

            userRepository.save(admin);

            String token = jwtUtil.generateToken(
                    admin.getEmail(),
                    admin.getRole(),
                    admin.getId());

            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", admin.getId());
            userResponse.put("name", admin.getName());
            userResponse.put("email", admin.getEmail());
            userResponse.put("role", admin.getRole());
            userResponse.put("status", admin.getStatus());
            userResponse.put("organization", admin.getOrganization());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", userResponse,
                    "message", "Emergency admin login success"));
        }
        // ================= END EMERGENCY LOGIN =================

        try {
            System.out.println("🔍 LOGIN REQUEST: email=" + loginRequest.getEmail());

            User user = userService.getUserByEmail(loginRequest.getEmail());
            System.out.println("🔍 USER FOUND: "
                    + (user != null ? user.getEmail() + " role=" + user.getRole() + " status=" + user.getStatus()
                            : "null"));

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }

            // Check if account is locked
            if (securityService.isAccountLocked(user)) {
                System.out.println("❌ ACCOUNT LOCKED for user: " + user.getEmail());

                // Calculate remaining lockout time
                long remainingMinutes = 0;
                if (user.getLockoutUntil() != null) {
                    java.time.Duration duration = java.time.Duration.between(LocalDateTime.now(),
                            user.getLockoutUntil());
                    remainingMinutes = Math.max(0, duration.toMinutes());
                }

                String errorMessage = remainingMinutes > 0
                        ? String.format("Account locked. Try again in %d minutes.", remainingMinutes)
                        : "Account locked. Try again after 15 minutes.";

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", errorMessage));
            }

            // Check password
            boolean passwordValid = securityService.validatePassword(loginRequest.getPassword(), user.getPassword());
            System.out.println("🔍 PASSWORD VALIDATION: " + passwordValid);

            if (!passwordValid) {
                // Record failed login attempt
                securityService.recordFailedLogin(user);
                System.out.println("❌ INVALID PASSWORD for user: " + user.getEmail());

                // Check if account got locked after this attempt
                if (securityService.isAccountLocked(user)) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Account locked due to too many failed login attempts"));
                }

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }

            // Password is valid - clear any previous failed attempts
            securityService.clearLoginAttempts(user);

            // Check if password has expired
            if (securityService.isPasswordExpired(user)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Password has expired. Please change your password."));
            }

            // Check if force password reset is required
            if (user.getForcePasswordReset() != null && user.getForcePasswordReset()) {
                Map<String, Object> response = new HashMap<>();
                response.put("requiresPasswordChange", true);
                response.put("userId", user.getId());
                response.put("message", "Password reset required. Please change your password.");

                return ResponseEntity.ok(response);
            }

            // Check if account is approved
            String userStatus = user.getStatus();
            System.out.println("🔍 USER STATUS: " + userStatus);

            if (!"APPROVED".equals(userStatus)) {
                System.out.println("❌ USER NOT APPROVED: " + user.getEmail() + " status=" + userStatus);
                // CHANGE: Return 401 instead of 403 to differentiate from Security Layer
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Account not approved yet. Please wait for admin approval."));
            }

            // Check if 2FA is required
            if (securityService.isTwoFactorRequired(user)) {
                System.out.println("🔍 2FA REQUIRED for user: " + user.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("requires2FA", true);
                response.put("userId", user.getId());
                response.put("message", "Enter your 2FA code to complete login");

                return ResponseEntity.ok(response);
            }

            // Generate JWT token
            String userRole = user.getRole();
            Long userId = user.getId();
            System.out.println("🔍 GENERATING JWT: email=" + user.getEmail() + " role=" + userRole + " id=" + userId);

            String token = jwtUtil.generateToken(user.getEmail(), userRole, userId);
            System.out.println("🔍 JWT GENERATED: " + (token != null ? "SUCCESS" : "FAILED"));

            // Return user info without password
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("name", user.getName());
            userResponse.put("email", user.getEmail());
            userResponse.put("role", user.getRole());
            userResponse.put("status", user.getStatus());
            userResponse.put("organization", user.getOrganization());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", userResponse,
                    "message", "Login successful"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In JWT, logout is handled client-side by removing the token
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestAttribute("userId") Long userId) {
        try {
            User user = userService.getUserById(userId);
            user.setPassword(null); // Don't return password
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwordRequest,
            org.springframework.security.core.Authentication auth) {
        try {
            // Get user - either from authentication or from request body for force reset
            User user;
            boolean isForceReset = false;

            if (auth != null && auth.getPrincipal() instanceof User) {
                user = (User) auth.getPrincipal();
            } else {
                // For force reset scenarios - get user by ID
                String userIdStr = passwordRequest.get("userId");
                if (userIdStr != null) {
                    Long userId = Long.valueOf(userIdStr);
                    user = userService.getUserById(userId);
                    isForceReset = true;
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "User authentication required"));
                }
            }

            String currentPassword = passwordRequest.get("currentPassword");
            String newPassword = passwordRequest.get("newPassword");

            // Validate new password
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password is required"));
            }

            // Validate new password against security policy
            try {
                securityService.validatePasswordPolicy(newPassword);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }

            // For non-force reset, verify current password
            if (!isForceReset) {
                if (currentPassword == null || currentPassword.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Current password is required"));
                }

                if (!securityService.validatePassword(currentPassword, user.getPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
                }
            }

            // Hash new password and update user
            user.setPassword(securityService.hashPassword(newPassword));
            user.setLastPasswordChangedAt(java.time.LocalDateTime.now());

            // Clear force password reset flag if it was set
            user.setForcePasswordReset(false);

            userService.updateUser(user.getId(), user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestAttribute("userId") Long userId, @RequestBody User profileData) {
        try {
            User updatedUser = userService.updateUser(userId, profileData);
            updatedUser.setPassword(null); // Don't return password
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
