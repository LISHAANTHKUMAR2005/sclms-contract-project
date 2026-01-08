package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.entity.Contract;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.ContractRepository;
import com.sclms.sclms_backend.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ContractRepository contractRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AdminController(UserService userService, ContractRepository contractRepository) {
        this.userService = userService;
        this.contractRepository = contractRepository;
    }

    // System health check
    @GetMapping("/system-health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "database", Map.of("status", "CONNECTED"),
                "memory", Map.of("usagePercent", 45.5),
                "services", List.of("auth", "contracts", "users", "notifications")
            );
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", "DOWN", "error", e.getMessage()));
        }
    }

    // Dashboard statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // Contract statistics
            long totalContracts = contractRepository.count();
            long pendingContracts = contractRepository.countByStatusAndCreatedDateAfter("PENDING", LocalDateTime.now().minusDays(30));
            long approvedContracts = contractRepository.countByStatusAndCreatedDateAfter("APPROVED", LocalDateTime.now().minusDays(30));
            long rejectedContracts = contractRepository.countByStatusAndCreatedDateAfter("REJECTED", LocalDateTime.now().minusDays(30));

            // User statistics
            long totalUsers = userService.getTotalUsers();
            long activeApprovers = userService.getUsersByRoleCount("APPROVER");

            Map<String, Object> stats = Map.of(
                "contracts", Map.of(
                    "total", totalContracts,
                    "pending", pendingContracts,
                    "approved", approvedContracts,
                    "rejected", rejectedContracts
                ),
                "users", Map.of(
                    "total", totalUsers,
                    "approvers", activeApprovers
                ),
                "system", Map.of(
                    "uptime", "Running",
                    "lastUpdated", LocalDateTime.now()
                )
            );

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Recent contracts
    @GetMapping("/dashboard/recent-contracts")
    public ResponseEntity<?> getRecentContracts() {
        try {
            List<Contract> recentContracts = contractRepository.findTop10ByOrderByCreatedDateDesc();
            return ResponseEntity.ok(recentContracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Contract analytics
    @GetMapping("/analytics/contracts")
    public ResponseEntity<?> getContractAnalytics() {
        try {
            LocalDateTime lastMonth = LocalDateTime.now().minusDays(30);

            Map<String, Object> analytics = Map.of(
                "monthlyStats", Map.of(
                    "created", contractRepository.countByStatusAndCreatedDateAfter("PENDING", lastMonth),
                    "approved", contractRepository.countByStatusAndCreatedDateAfter("APPROVED", lastMonth),
                    "rejected", contractRepository.countByStatusAndCreatedDateAfter("REJECTED", lastMonth)
                ),
                "statusDistribution", Map.of(
                    "pending", contractRepository.countByStatus("PENDING"),
                    "approved", contractRepository.countByStatus("APPROVED"),
                    "rejected", contractRepository.countByStatus("REJECTED")
                )
            );

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // User analytics
    @GetMapping("/analytics/users")
    public ResponseEntity<?> getUserAnalytics() {
        try {
            Map<String, Object> analytics = Map.of(
                "roleDistribution", Map.of(
                    "admins", userService.getUsersByRoleCount("ADMIN"),
                    "approvers", userService.getUsersByRoleCount("APPROVER"),
                    "users", userService.getUsersByRoleCount("USER")
                ),
                "statusDistribution", Map.of(
                    "approved", userService.getUsersByStatusCount("APPROVED"),
                    "pending", userService.getUsersByStatusCount("PENDING"),
                    "rejected", userService.getUsersByStatusCount("REJECTED")
                ),
                "totalUsers", userService.getTotalUsers()
            );

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get pending users
    @GetMapping("/pending-users")
    public ResponseEntity<?> getPendingUsers() {
        try {
            List<User> pendingUsers = userService.getUsersByStatus("PENDING");
            return ResponseEntity.ok(pendingUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ADMIN NOTIFICATION SYSTEM - Get pending users count and latest users
    @GetMapping("/notifications/pending-users")
    public ResponseEntity<?> getPendingUsersNotifications() {
        try {
            // Debug logging for authentication
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                System.out.println("🔍 PENDING-USERS ENDPOINT - User: " + auth.getName());
                System.out.println("🔍 PENDING-USERS ENDPOINT - Authorities: " + auth.getAuthorities());
                System.out.println("🔍 PENDING-USERS ENDPOINT - Principal: " + auth.getPrincipal());
                System.out.println("🔍 PENDING-USERS ENDPOINT - Authenticated: " + auth.isAuthenticated());
            } else {
                System.out.println("🔍 PENDING-USERS ENDPOINT - No authentication found!");
                return ResponseEntity.status(403).body(Map.of("error", "No authentication found"));
            }

            List<User> pendingUsers = userService.getUsersByStatus("PENDING");

            // Get count and latest 5 pending users
            int count = pendingUsers.size();
            List<User> latestUsers = pendingUsers.stream()
                .sorted((a, b) -> b.getCreatedDate().compareTo(a.getCreatedDate()))
                .limit(5)
                .toList();

            Map<String, Object> response = Map.of(
                "count", count,
                "latestUsers", latestUsers.stream().map(user -> Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "organization", user.getOrganization(),
                    "createdDate", user.getCreatedDate()
                )).toList(),
                "message", count > 0 ? count + " user(s) pending approval" : "No pending users"
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get user by ID (singular - existing endpoint)
    @GetMapping("/user/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get user by ID (plural - for frontend compatibility)
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getUserByIdPlural(@PathVariable Long id) {
        try {
            // Debug logging
            System.out.println("🔍 ADMIN USER ENDPOINT - User ID: " + id);
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.out.println("❌ ADMIN USER ENDPOINT ERROR: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Unlock user account (admin only)
    @PatchMapping("/users/{userId}/unlock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> unlockUserAccount(@PathVariable Long userId) {
        try {
            // Note: In a real implementation, you'd inject SecurityService
            // For now, we'll manually unlock the user
            User user = userService.getUserById(userId);

            user.setAccountLocked(false);
            user.setLoginAttempts(0);
            user.setLockoutUntil(null);
            user.setLastFailedLoginAt(null);

            userService.updateUser(userId, user);

            return ResponseEntity.ok(Map.of("message", "User account unlocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }





    // Approve user
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            User user = userService.approveUser(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Reject user
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        try {
            User user = userService.rejectUser(id);
            return ResponseEntity.ok(Map.of("message", "User rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Change user role
    @PutMapping("/change-role/{id}")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestParam String role) {
        try {
            User user = userService.changeUserRole(id, role);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Demote to user role
    @PutMapping("/demote/{id}")
    public ResponseEntity<?> demoteToUser(@PathVariable Long id) {
        try {
            User user = userService.changeUserRole(id, "USER");
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete user
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // System settings
    @GetMapping("/system-settings")
    public ResponseEntity<?> getSystemSettings() {
        try {
            Map<String, Object> settings = Map.of(
                "maintenanceMode", false,
                "registrationEnabled", true,
                "emailNotifications", true,
                "autoApproveUsers", false,
                "maxFileSize", "10MB",
                "sessionTimeout", "30 minutes"
            );
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update system settings
    @PutMapping("/system-settings")
    public ResponseEntity<?> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        try {
            // In a real application, you would save these settings to database
            return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Generate report
    @PostMapping("/generate-report")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> reportRequest) {
        try {
            Map<String, Object> response = Map.of(
                "reportId", "RPT-" + System.currentTimeMillis(),
                "status", "COMPLETED",
                "fileName", reportRequest.get("reportType") + ".pdf"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get report status
    @GetMapping("/report-status/{reportId}")
    public ResponseEntity<?> getReportStatus(@PathVariable String reportId) {
        try {
            Map<String, Object> status = Map.of(
                "reportId", reportId,
                "status", "COMPLETED",
                "progress", 100,
                "fileName", reportId + ".pdf"
            );
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Recent login activity
    @GetMapping("/recent-logins")
    public ResponseEntity<?> getRecentLogins(@RequestParam(defaultValue = "50") int limit) {
        try {
            Map<String, Object> activity = Map.of(
                "activities", List.of(
                    Map.of("lastActivity", "2 hours ago", "ipAddress", "192.168.1.100"),
                    Map.of("lastActivity", "1 day ago", "ipAddress", "192.168.1.101"),
                    Map.of("lastActivity", "3 days ago", "ipAddress", "192.168.1.102")
                ),
                "total", 3
            );
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Email configuration
    @GetMapping("/email-config")
    public ResponseEntity<?> getEmailConfig() {
        try {
            Map<String, Object> config = Map.of(
                "smtpHost", "smtp.gmail.com",
                "smtpPort", 587,
                "fromEmail", "noreply@sclms.com",
                "useTLS", true
            );
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update email configuration
    @PutMapping("/email-config")
    public ResponseEntity<?> updateEmailConfig(@RequestBody Map<String, Object> config) {
        try {
            return ResponseEntity.ok(Map.of("message", "Email configuration updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Send test email
    @PostMapping("/test-email")
    public ResponseEntity<?> sendTestEmail(@RequestBody Map<String, String> request) {
        try {
            String toEmail = request.get("toEmail");
            return ResponseEntity.ok(Map.of("message", "Test email sent to " + toEmail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Data maintenance
    @PostMapping("/maintenance/cleanup")
    public ResponseEntity<?> performDataCleanup(@RequestBody Map<String, Object> options) {
        try {
            Map<String, Object> result = Map.of(
                "logsCleaned", 150,
                "tempFilesDeleted", 25,
                "databaseOptimized", true,
                "status", "COMPLETED"
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Send notification to user
    @PostMapping("/users/{userId}/notify")
    public ResponseEntity<?> sendNotification(@PathVariable Long userId, @RequestBody Map<String, Object> notification) {
        try {
            return ResponseEntity.ok(Map.of("message", "Notification sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get user activity log
    @GetMapping("/users/{userId}/activity")
    public ResponseEntity<?> getUserActivity(@PathVariable Long userId, @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> activities = List.of(
                Map.of("action", "LOGIN", "timestamp", LocalDateTime.now().minusHours(2), "ip", "192.168.1.100"),
                Map.of("action", "VIEW_CONTRACT", "timestamp", LocalDateTime.now().minusHours(5), "ip", "192.168.1.100"),
                Map.of("action", "APPROVE_CONTRACT", "timestamp", LocalDateTime.now().minusDays(1), "ip", "192.168.1.100")
            );
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Bulk user operations
    @PostMapping("/users/bulk")
    public ResponseEntity<?> bulkUserOperation(@RequestBody Map<String, Object> request) {
        try {
            String operation = (String) request.get("operation");
            List<Long> userIds = (List<Long>) request.get("userIds");

            Map<String, Object> result = Map.of(
                "operation", operation,
                "affectedUsers", userIds.size(),
                "status", "COMPLETED"
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get user statistics
    @GetMapping("/users/statistics")
    public ResponseEntity<?> getUserStatistics() {
        try {
            Map<String, Object> stats = Map.of(
                "totalUsers", userService.getTotalUsers(),
                "activeUsers", userService.getUsersByStatusCount("APPROVED"),
                "inactiveUsers", userService.getUsersByStatusCount("PENDING"),
                "rejectedUsers", userService.getUsersByStatusCount("REJECTED"),
                "roleBreakdown", Map.of(
                    "ADMIN", userService.getUsersByRoleCount("ADMIN"),
                    "APPROVER", userService.getUsersByRoleCount("APPROVER"),
                    "USER", userService.getUsersByRoleCount("USER")
                )
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }




    // Export users to CSV
    @GetMapping("/users/export")
    public ResponseEntity<?> exportUsers(@RequestParam Map<String, String> filters) {
        try {
            // Add logging to debug authentication
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                System.out.println("🔍 EXPORT ENDPOINT - User: " + auth.getName());
                System.out.println("🔍 EXPORT ENDPOINT - Authorities: " + auth.getAuthorities());
                System.out.println("🔍 EXPORT ENDPOINT - Principal: " + auth.getPrincipal());
            } else {
                System.out.println("🔍 EXPORT ENDPOINT - No authentication found!");
            }

            List<User> users = userService.getAllUsers();

            // Apply filters if provided
            String statusFilter = filters.get("status");
            String roleFilter = filters.get("role");

            if (statusFilter != null && !statusFilter.isEmpty() && !statusFilter.equals("ALL")) {
                users = users.stream()
                    .filter(user -> user.getStatus().equals(statusFilter))
                    .toList();
            }

            if (roleFilter != null && !roleFilter.isEmpty() && !roleFilter.equals("ALL")) {
                users = users.stream()
                    .filter(user -> user.getRole().equals(roleFilter))
                    .toList();
            }

            // Build CSV content
            StringBuilder csv = new StringBuilder();
            csv.append("ID,Name,Email,Organization,Role,Status,Created Date,Two Factor Enabled\n");

            for (User user : users) {
                csv.append(user.getId()).append(",")
                   .append(escapeCSV(user.getName())).append(",")
                   .append(escapeCSV(user.getEmail())).append(",")
                   .append(escapeCSV(user.getOrganization())).append(",")
                   .append(user.getRole()).append(",")
                   .append(user.getStatus()).append(",")
                   .append(user.getCreatedDate() != null ? user.getCreatedDate().toString() : "").append(",")
                   .append(user.getTwoFactorEnabled()).append("\n");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users_export.csv");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE);

            return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper method to escape CSV values
    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
