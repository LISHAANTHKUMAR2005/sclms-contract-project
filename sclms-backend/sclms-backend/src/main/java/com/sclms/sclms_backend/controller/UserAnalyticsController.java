package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.entity.Contract;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.ApprovalHistoryRepository;
import com.sclms.sclms_backend.repository.ContractRepository;
import com.sclms.sclms_backend.repository.NotificationRepository;
import com.sclms.sclms_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserAnalyticsController {

    private final ContractRepository contractRepository;
    private final ApprovalHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public UserAnalyticsController(
            ContractRepository contractRepository,
            ApprovalHistoryRepository historyRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService
    ) {
        this.contractRepository = contractRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    /**
     * Get user analytics data
     */
    @GetMapping("/{userId}/analytics")
    public ResponseEntity<?> getUserAnalytics(
            @PathVariable Long userId,
            Authentication auth
    ) {
        try {
            User currentUser = (User) auth.getPrincipal();

            // Check if user can access this analytics (own data or admin)
            // ADMIN can access any user's analytics, others can only access their own
            boolean isAdmin = "ADMIN".equals(currentUser.getRole()) || "ROLE_ADMIN".equals(currentUser.getRole());
            if (!currentUser.getId().equals(userId) && !isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Get user to access their organization
            User targetUser = new User();
            targetUser.setId(userId);

            // Calculate analytics based on contracts created by user OR in user's organization
            List<Contract> userContracts = contractRepository.findByCreatedBy(userId);
            List<Contract> orgContracts = contractRepository.findByToOrg(currentUser.getOrganization());

            // Combine and deduplicate contracts
            Map<Long, Contract> allContracts = new HashMap<>();
            userContracts.forEach(c -> allContracts.put(c.getId(), c));
            orgContracts.forEach(c -> allContracts.put(c.getId(), c));

            long totalContractsCreated = userContracts.size();
            long totalContractsApproved = userContracts.stream()
                    .filter(c -> "APPROVED".equals(c.getStatus()))
                    .count();
            long totalContractsRejected = userContracts.stream()
                    .filter(c -> "REJECTED".equals(c.getStatus()))
                    .count();
            long contractsPending = userContracts.stream()
                    .filter(c -> "PENDING".equals(c.getStatus()))
                    .count();

            // Mock last login time (in real app, this would come from audit logs)
            LocalDateTime lastLoginTime = LocalDateTime.now().minusDays(1);

            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalContractsCreated", totalContractsCreated);
            analytics.put("totalContractsApproved", totalContractsApproved);
            analytics.put("totalContractsRejected", totalContractsRejected);
            analytics.put("contractsPending", contractsPending);
            analytics.put("lastLoginTime", lastLoginTime);

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get dashboard statistics for user
     */
    @GetMapping("/{userId}/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(
            @PathVariable Long userId,
            Authentication auth
    ) {
        try {
            User currentUser = (User) auth.getPrincipal();

            // Check if user can access this data (own data or admin)
            // ADMIN can access any user's dashboard stats, others can only access their own
            boolean isAdmin = "ADMIN".equals(currentUser.getRole()) || "ROLE_ADMIN".equals(currentUser.getRole());
            if (!currentUser.getId().equals(userId) && !isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
            LocalDateTime monthStart = now.withDayOfMonth(1);

            // Today's activity count (approvals/rejections by this user)
            long todayActivityCount = historyRepository.countByActorAndTimestampAfter(
                    currentUser.getName(), todayStart);

            // Month's activity count
            long monthActivityCount = historyRepository.countByActorAndTimestampAfter(
                    currentUser.getName(), monthStart);

            // Notification counts
            long totalNotifications = notificationRepository.countByUserId(userId);
            long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(userId);

            // Approval statistics
            long approvalsCompleted = historyRepository.countByActorAndAction(
                    currentUser.getName(), "APPROVED");
            long approvalsPending = contractRepository.countByToOrgAndStatus(
                    currentUser.getOrganization(), "PENDING");

            Map<String, Object> stats = new HashMap<>();
            stats.put("todayActivityCount", todayActivityCount);
            stats.put("monthActivityCount", monthActivityCount);
            stats.put("totalNotifications", totalNotifications);
            stats.put("unreadNotifications", unreadNotifications);
            stats.put("approvalsCompleted", approvalsCompleted);
            stats.put("approvalsPending", approvalsPending);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
