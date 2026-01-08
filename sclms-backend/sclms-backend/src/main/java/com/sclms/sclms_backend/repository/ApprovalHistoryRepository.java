package com.sclms.sclms_backend.repository;

import com.sclms.sclms_backend.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {

    // Basic queries
    List<ApprovalHistory> findByContractIdOrderByTimestampAsc(Long contractId);
    List<ApprovalHistory> findByContractIdOrderByTimestampDesc(Long contractId);

    // Actor-based queries
    List<ApprovalHistory> findByActor(String actor);
    List<ApprovalHistory> findByActorRole(String actorRole);
    List<ApprovalHistory> findByActorRoleAndActorOrderByTimestampDesc(String actorRole, String actor);

    // Action-based queries
    List<ApprovalHistory> findByAction(String action);
    List<ApprovalHistory> findByActionOrderByTimestampDesc(String action);

    // Time-based queries
    List<ApprovalHistory> findByTimestampAfter(LocalDateTime timestamp);
    List<ApprovalHistory> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    // Combined queries for analytics
    @Query("SELECT COUNT(h) FROM ApprovalHistory h WHERE h.actorRole = :role AND h.action = :action AND h.timestamp >= :since")
    long countByActorRoleAndActionAndTimestampAfter(@Param("role") String role, @Param("action") String action, @Param("since") LocalDateTime since);

    @Query("SELECT h FROM ApprovalHistory h WHERE h.actorRole = :role AND h.timestamp >= :since ORDER BY h.timestamp DESC")
    List<ApprovalHistory> findRecentByActorRole(@Param("role") String role, @Param("since") LocalDateTime since);

    // Additional methods for analytics
    @Query("SELECT COUNT(h) FROM ApprovalHistory h WHERE h.actor = :actor AND h.timestamp >= :since")
    long countByActorAndTimestampAfter(@Param("actor") String actor, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(h) FROM ApprovalHistory h WHERE h.actor = :actor AND h.action = :action")
    long countByActorAndAction(@Param("actor") String actor, @Param("action") String action);

    // Recent activities
    List<ApprovalHistory> findTop50ByOrderByTimestampDesc();
    List<ApprovalHistory> findTop20ByActorRoleOrderByTimestampDesc(String actorRole);
}
