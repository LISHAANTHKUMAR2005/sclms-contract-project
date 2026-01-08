package com.sclms.sclms_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(nullable = false)
    private String action; // CREATED, APPROVED, REJECTED, MODIFIED

    @Column(nullable = false)
    private String actor; // Name of the person who performed the action

    @Column(name = "actor_role", nullable = false)
    private String actorRole; // USER, APPROVER, ADMIN

    @Column(nullable = false)
    private String comment; // Action description or reason

    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Optional: Link to contract for easier queries
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    @JsonIgnore
    private Contract contract;
}
