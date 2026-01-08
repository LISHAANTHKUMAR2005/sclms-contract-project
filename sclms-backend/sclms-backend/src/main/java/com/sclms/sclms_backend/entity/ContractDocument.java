package com.sclms.sclms_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_documents")
public class ContractDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contractId;
    private String fileName;
    private String storageType;   // FILE or DB
    private String filePath;      // used when stored as file
    private Integer version;

    @Lob
    private byte[] fileData;      // used when stored in DB

    private LocalDateTime uploadedAt;
    private Long uploadedBy;

    // Getters & Setters...
}
