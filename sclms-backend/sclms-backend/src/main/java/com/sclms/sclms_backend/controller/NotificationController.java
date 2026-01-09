package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.entity.Notification;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<Notification> notifications = notificationService.getUserNotificationsWithApproverLogic(user.getId(), user);

            // Add debug logging
            System.out.println("📩 Getting notifications for user: " + user.getId() + ", role: " + user.getRole() + ", count: " + notifications.size());

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable Long userId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            if (!user.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            // Verify the notification belongs to the user
            Notification notification = notificationService.getNotificationById(id);
            if (!notification.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/mark-read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            // Verify the notification belongs to the user
            Notification notification = notificationService.getNotificationById(id);
            if (!notification.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            notificationService.markAllAsRead(user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllNotificationsAsRead(@PathVariable Long userId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            if (!user.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            long count = notificationService.getUnreadCount(user.getId());
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
