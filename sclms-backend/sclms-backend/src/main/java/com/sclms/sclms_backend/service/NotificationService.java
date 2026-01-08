package com.sclms.sclms_backend.service;

import com.sclms.sclms_backend.entity.Notification;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.NotificationRepository;
import com.sclms.sclms_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Create notifications
    public Notification createNotification(Long userId, String type, String title, String message) {
        return createNotification(userId, type, title, message, null);
    }

    public Notification createNotification(Long userId, String type, String title, String message, Long contractId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setContractId(contractId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    // Contract-related notifications
    public void notifyNewContract(Long approverId, Long contractId, String contractTitle, String fromOrg) {
        String title = "New Contract for Approval";
        String message = String.format("Contract '%s' from %s requires your approval", contractTitle, fromOrg);
        createNotification(approverId, "CONTRACT_CREATED", title, message, contractId);
    }

    public void notifyContractApproved(Long userId, Long contractId, String contractTitle) {
        String title = "Contract Approved";
        String message = String.format("Your contract '%s' has been approved", contractTitle);
        createNotification(userId, "CONTRACT_APPROVED", title, message, contractId);
    }

    public void notifyContractRejected(Long userId, Long contractId, String contractTitle, String reason) {
        String title = "Contract Rejected";
        String message = String.format("Your contract '%s' has been rejected. Reason: %s", contractTitle, reason);
        createNotification(userId, "CONTRACT_REJECTED", title, message, contractId);
    }

    public void notifyContractExpiring(Long userId, Long contractId, String contractTitle, int daysLeft) {
        String title = "Contract Expiring Soon";
        String message = String.format("Contract '%s' will expire in %d days", contractTitle, daysLeft);
        createNotification(userId, "CONTRACT_EXPIRING", title, message, contractId);
    }

    // Read operations
    public List<Notification> getUserNotifications(Long userId) {
        // For now, keep simple - will be updated for approver logic
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get notifications for user with approver logic
    public List<Notification> getUserNotificationsWithApproverLogic(Long userId, User user) {
        if ("APPROVER".equals(user.getRole())) {
            // For approvers, include notifications for contracts in their organization
            // This will be implemented with a custom query
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            // For regular users, just get their notifications
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getRecentNotifications(Long userId, LocalDateTime since) {
        return notificationRepository.findRecentByUserId(userId, since);
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    // Update operations
    public Notification markAsRead(Long notificationId) {
        Notification notification = getNotificationById(notificationId);
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadForUser(userId);
    }

    // Delete operations
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void deleteOldNotifications(LocalDateTime beforeDate) {
        notificationRepository.deleteOldNotifications(beforeDate);
    }

    // Statistics
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public long getTotalCount(Long userId) {
        return notificationRepository.countByUserId(userId);
    }

    // Bulk operations for all users in an organization
    public void notifyAllApproversInOrg(String organization, String type, String title, String message, Long contractId) {
        List<User> approvers = userRepository.findByOrganizationAndRole(organization, "APPROVER");
        for (User approver : approvers) {
            createNotification(approver.getId(), type, title, message, contractId);
        }
    }
}
