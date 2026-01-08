package com.sclms.sclms_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String contractType; // SERVICE, SUPPLY, MAINTENANCE, etc.

    @Column(nullable = false)
    private String fromOrg;

    @Column(nullable = false)
    private String toOrg;

    @Column(nullable = false)
    private String startDate;

    @Column(nullable = false)
    private String endDate;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approver_comments")
    private String approverComments;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    // File attachment
    @Column(name = "document_name")
    private String documentName;

    @Column(name = "document_url")
    private String documentUrl;

    // Contract value (optional)
    @Column(name = "contract_value")
    private Double value;

    // Auto-generated fields
    @Column(name = "contract_number")
    private String contractNumber;

    @Column(name = "days_until_expiry")
    private Integer daysUntilExpiry;
}
