package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.dto.OrganizationDto;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.service.OrganizationService;
import com.sclms.sclms_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final OrganizationService organizationService;

    public UserController(UserService userService, OrganizationService organizationService) {
        this.userService = userService;
        this.organizationService = organizationService;
    }

    // =============================
    // USER MANAGEMENT (ADMIN ONLY)
    // =============================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','APPROVER')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User updated = userService.updateUser(id, userDetails);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }


    // =============================
    // ROLE & APPROVAL ACTIONS
    // =============================

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String role = request.get("role");
        User user = userService.changeUserRole(id, role);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','APPROVER')")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        User user = userService.approveUser(id);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','APPROVER')")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        User user = userService.rejectUser(id);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }


    // =============================
    // USER STATISTICS (ADMIN ONLY)
    // =============================

    @GetMapping("/stats/total")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTotalUsers() {
        return ResponseEntity.ok(Map.of("totalUsers", userService.getTotalUsers()));
    }

    @GetMapping("/stats/by-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRoleStats() {
        return ResponseEntity.ok(Map.of(
            "admins", userService.getUsersByRoleCount("ADMIN"),
            "approvers", userService.getUsersByRoleCount("APPROVER"),
            "users", userService.getUsersByRoleCount("USER")
        ));
    }

    @GetMapping("/stats/by-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByStatusStats() {
        return ResponseEntity.ok(Map.of(
            "approved", userService.getUsersByStatusCount("APPROVED"),
            "pending", userService.getUsersByStatusCount("PENDING"),
            "rejected", userService.getUsersByStatusCount("REJECTED")
        ));
    }






    // =============================
    // NOTIFICATIONS & PROFILE
    // (ADMIN, APPROVER, OR SELF)
    // =============================

    @PutMapping("/{id}/notifications")
    @PreAuthorize("hasAnyRole('ADMIN','APPROVER') or #id == authentication.principal.id")
    public ResponseEntity<?> updateUserNotifications(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> notifications) {

        User user = userService.getUserById(id);

        user.setEmailNotifications(notifications.getOrDefault("email", user.getEmailNotifications()));
        user.setBrowserNotifications(notifications.getOrDefault("browser", user.getBrowserNotifications()));
        user.setContractAlerts(notifications.getOrDefault("contracts", user.getContractAlerts()));
        user.setExpirationReminders(notifications.getOrDefault("expiration", user.getExpirationReminders()));
        user.setSystemNotifications(notifications.getOrDefault("system", user.getSystemNotifications()));

        userService.updateUser(id, user);
        return ResponseEntity.ok(Map.of("message", "Notifications updated successfully"));
    }


    // =============================
    // PASSWORD / 2FA (SELF ONLY)
    // =============================

    @PutMapping("/{id}/password")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> data) {
        User user = userService.getUserById(id);
        user.setPassword(data.get("newPassword")); // hash in production
        userService.updateUser(id, user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/{id}/2fa/setup")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> setup2FA(@PathVariable Long id) {
        User user = userService.getUserById(id);
        String secret = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        user.setTwoFactorSecret(secret);
        userService.updateUser(id, user);
        return ResponseEntity.ok(Map.of("secret", secret));
    }

    @PostMapping("/{id}/2fa/enable")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> enable2FA(@PathVariable Long id, @RequestBody Map<String, String> data) {
        User user = userService.getUserById(id);
        user.setTwoFactorEnabled(true);
        userService.updateUser(id, user);
        return ResponseEntity.ok(Map.of("message", "2FA enabled successfully"));
    }

    @PostMapping("/{id}/2fa/disable")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> disable2FA(@PathVariable Long id) {
        User user = userService.getUserById(id);
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userService.updateUser(id, user);
        return ResponseEntity.ok(Map.of("message", "2FA disabled successfully"));
    }

    // =============================
    // FEEDBACK SYSTEM
    // =============================

    @PostMapping("/{userId}/feedback")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> feedbackData) {
        try {
            // In a real implementation, you would save this to a feedback table
            // For now, we'll just acknowledge receipt
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Feedback submitted successfully");
            response.put("feedbackId", "FB-" + System.currentTimeMillis());
            response.put("submittedAt", LocalDateTime.now());
            response.put("status", "received");

            // Log the feedback for admin review
            System.out.println("Feedback received from user " + userId + ": " + feedbackData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/feedback")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> getUserFeedback(@PathVariable Long userId) {
        try {
            // In a real implementation, you would query the feedback table
            // For now, return empty array since we don't persist feedback
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
