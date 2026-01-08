package com.sclms.sclms_backend.repository;

import com.sclms.sclms_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Basic queries
    List<Notification> findByUserId(Long userId);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);
    List<Notification> findByType(String type);
    List<Notification> findByContractId(Long contractId);

    // User-specific queries
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, String type);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Time-based queries
    List<Notification> findByCreatedAtAfter(LocalDateTime timestamp);
    List<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Combined queries
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // Count queries
    long countByUserIdAndIsReadFalse(Long userId);
    long countByUserId(Long userId);
    long countByType(String type);

    // Custom count method for unread notifications
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);

    // Bulk operations
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate")
    int deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);

    // Recent notifications
    List<Notification> findTop50ByOrderByCreatedAtDesc();
    List<Notification> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
