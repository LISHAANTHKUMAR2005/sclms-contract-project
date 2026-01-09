package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.entity.Contract;
import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.entity.ApprovalHistory;
import com.sclms.sclms_backend.repository.ContractRepository;
import com.sclms.sclms_backend.repository.UserRepository;
import com.sclms.sclms_backend.repository.ApprovalHistoryRepository;
import com.sclms.sclms_backend.service.FileStorageService;
import com.sclms.sclms_backend.service.NotificationService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:5173")
public class ContractController {

    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final ApprovalHistoryRepository historyRepository;
    private final FileStorageService fileService;
    private final NotificationService notificationService;

    public ContractController(
            ContractRepository contractRepository,
            UserRepository userRepository,
            ApprovalHistoryRepository historyRepository,
            FileStorageService fileService,
            NotificationService notificationService
    ) {
        this.contractRepository = contractRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.fileService = fileService;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE CONTRACT
    // =========================================================
    @PostMapping("/create/{userId}")
    public ResponseEntity<?> createContract(
            @PathVariable Long userId,
            @RequestBody CreateContractRequest request
    ) {
        try {
            // Log the request payload for debugging
            System.out.println("🔍 CONTRACT CREATION REQUEST:");
            System.out.println("userId: " + userId);
            System.out.println("title: " + request.getTitle());
            System.out.println("toOrg: " + request.getToOrg());
            System.out.println("contractType: " + request.getContractType());
            System.out.println("startDate: " + request.getStartDate());
            System.out.println("endDate: " + request.getEndDate());
            System.out.println("description: " + request.getDescription());

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Contract contract = new Contract();
            contract.setTitle(request.getTitle());
            contract.setFromOrg(user.getOrganization());
            contract.setToOrg(request.getToOrg());
            contract.setContractType(request.getContractType());
            contract.setStartDate(LocalDateTime.parse(request.getStartDate() + "T00:00:00"));
            contract.setEndDate(LocalDateTime.parse(request.getEndDate() + "T23:59:59"));
            contract.setDescription(request.getDescription());
            contract.setCreatedBy(user.getId());
            contract.setStatus("PENDING");
            contract.setCreatedDate(LocalDateTime.now());

            // TODO: Handle file upload later - for now, no document support
            // if (request.getDocument() != null) {
            //     String savedPath = fileService.saveFile(request.getDocument());
            //     contract.setDocumentName(request.getDocument().getOriginalFilename());
            //     contract.setDocumentUrl(savedPath);
            // }

            Contract saved = contractRepository.save(contract);

            // Create approval history
            ApprovalHistory history = new ApprovalHistory();
            history.setContractId(saved.getId());
            history.setAction("CREATED");
            history.setComment("Contract created & sent for approval");
            history.setActor(user.getName());
            history.setActorRole("USER");
            history.setTimestamp(LocalDateTime.now());
            historyRepository.save(history);

            // Notify approvers in target organization
            List<User> approvers = userRepository.findByOrganizationAndRole(request.getToOrg(), "APPROVER");
            for (User approver : approvers) {
                notificationService.notifyNewContract(
                        approver.getId(),
                        saved.getId(),
                        saved.getTitle(),
                        user.getOrganization()
                );
            }

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // GET SINGLE CONTRACT
    // =========================================================
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getContract(@PathVariable Long id) {
        try {
            Contract contract = contractRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Contract not found"));
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // USER — MY CONTRACTS
    // =========================================================
    @GetMapping("/my/{userId}")
    public ResponseEntity<?> getUserContracts(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Contract> contracts = contractRepository.findByFromOrgOrToOrgOrderByCreatedDateDesc(
                    user.getOrganization(), user.getOrganization()
            );

            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // APPROVER — ACTIVITY FEED
    // =========================================================
    @GetMapping("/activity/approver")
    public ResponseEntity<?> getApproverActivity(Authentication auth) {
        try {
            User approver = (User) auth.getPrincipal();

            List<ApprovalHistory> activities = historyRepository.findByActorRoleAndActorOrderByTimestampDesc(
                    "APPROVER", approver.getName()
            );

            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // APPROVER — PENDING / APPROVED / REJECTED CONTRACTS
    // =========================================================
    @GetMapping("/approver/pending")
    public ResponseEntity<?> getPendingContracts(Authentication auth) {
        try {
            User approver = (User) auth.getPrincipal();
            List<Contract> contracts = contractRepository.findByToOrgAndStatusOrderByCreatedDateDesc(
                    approver.getOrganization(), "PENDING"
            );
            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/approver/approved")
    public ResponseEntity<?> getApprovedContracts(Authentication auth) {
        try {
            User approver = (User) auth.getPrincipal();
            List<Contract> contracts = contractRepository.findByToOrgAndStatusOrderByCreatedDateDesc(
                    approver.getOrganization(), "APPROVED"
            );
            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/approver/rejected")
    public ResponseEntity<?> getRejectedContracts(Authentication auth) {
        try {
            User approver = (User) auth.getPrincipal();
            List<Contract> contracts = contractRepository.findByToOrgAndStatusOrderByCreatedDateDesc(
                    approver.getOrganization(), "REJECTED"
            );
            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // APPROVE CONTRACT
    // =========================================================
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveContract(
            @PathVariable Long id,
            @RequestBody ApprovalRequest req,
            Authentication auth
    ) {
        try {
            User approver = (User) auth.getPrincipal();

            Contract contract = contractRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Contract not found"));

            if (!"PENDING".equals(contract.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Contract already processed"));
            }

            contract.setStatus("APPROVED");
            contract.setApproverComments(req.getComment());
            contract.setApprovedBy(approver.getId());
            contract.setApprovedDate(LocalDateTime.now());
            contract.setRejectionReason(null);

            Contract saved = contractRepository.save(contract);

            // Create approval history
            ApprovalHistory history = new ApprovalHistory();
            history.setContractId(id);
            history.setAction("APPROVED");
            history.setComment(req.getComment() != null ? req.getComment() : "Approved");
            history.setActor(approver.getName());
            history.setActorRole("APPROVER");
            history.setTimestamp(LocalDateTime.now());
            historyRepository.save(history);

            // Notify contract creator
            notificationService.notifyContractApproved(contract.getCreatedBy(), id, contract.getTitle());

            // Add debug logging
            System.out.println("📩 Notification created for user: " + contract.getCreatedBy() + " - Contract approved");

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // REJECT CONTRACT
    // =========================================================
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectContract(
            @PathVariable Long id,
            @RequestBody ApprovalRequest req,
            Authentication auth
    ) {
        try {
            User approver = (User) auth.getPrincipal();

            Contract contract = contractRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Contract not found"));

            if (!"PENDING".equals(contract.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Contract already processed"));
            }

            if (req.getReason() == null || req.getReason().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason required"));
            }

            contract.setStatus("REJECTED");
            contract.setApproverComments(req.getComment());
            contract.setRejectionReason(req.getReason());
            contract.setApprovedBy(approver.getId());
            contract.setApprovedDate(LocalDateTime.now());

            Contract saved = contractRepository.save(contract);

            // Create approval history
            ApprovalHistory history = new ApprovalHistory();
            history.setContractId(id);
            history.setAction("REJECTED");
            history.setComment(req.getReason());
            history.setActor(approver.getName());
            history.setActorRole("APPROVER");
            history.setTimestamp(LocalDateTime.now());
            historyRepository.save(history);

            // Notify contract creator
            notificationService.notifyContractRejected(contract.getCreatedBy(), id, contract.getTitle(), req.getReason());

            // Add debug logging
            System.out.println("📩 Notification created for user: " + contract.getCreatedBy() + " - Contract rejected");

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // CONTRACT HISTORY TIMELINE
    // =========================================================
    @GetMapping("/history/{contractId}")
    public ResponseEntity<?> getContractHistory(@PathVariable Long contractId) {
        try {
            List<ApprovalHistory> history = historyRepository.findByContractIdOrderByTimestampAsc(contractId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // FILE DOWNLOAD
    // =========================================================
    @GetMapping("/file/{id}")
    public ResponseEntity<?> downloadContractFile(@PathVariable Long id, Authentication auth) {
        try {
            // PRINT AUTH DEBUG INFO
            System.out.println("AUTH USER: " + (auth != null ? auth.getName() : "NULL"));
            System.out.println("AUTHORITIES: " + (auth != null ? auth.getAuthorities() : "NULL"));

            // TEMPORARILY REMOVE ACCESS RESTRICTIONS TO TEST
            // User currentUser = (User) auth.getPrincipal();
            // Contract contract = contractRepository.findById(id)
            //         .orElseThrow(() -> new RuntimeException("Contract not found"));

            // // Check access permissions
            // boolean hasAccess = false;
            // // User created the contract
            // if (contract.getCreatedBy().equals(currentUser.getId())) {
            //     hasAccess = true;
            // }
            // // Approver is assigned to the target organization
            // else if ("APPROVER".equals(currentUser.getRole()) &&
            //          contract.getToOrg().equals(currentUser.getOrganization())) {
            //     hasAccess = true;
            // }
            // // Admin has access to all files
            // else if ("ADMIN".equals(currentUser.getRole())) {
            //     hasAccess = true;
            // }
            // if (!hasAccess) {
            //     return ResponseEntity.status(403).body(Map.of("error", "Access denied. You don't have permission to view this file."));
            // }

            Contract contract = contractRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Contract not found"));

            if (contract.getDocumentUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(contract.getDocumentUrl());
            byte[] fileBytes = Files.readAllBytes(filePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + contract.getDocumentName())
                    .header("Access-Control-Expose-Headers", "Content-Disposition")
                    .body(fileBytes);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "File not found"));
        }
    }

    // =========================================================
    // APPROVER KPI
    // =========================================================
    @GetMapping("/approver/kpi")
    public ResponseEntity<?> getApproverKPI(Authentication auth) {
        try {
            User approver = (User) auth.getPrincipal();

            LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime month = today.withDayOfMonth(1);

            long todayApproved = historyRepository.countByActorRoleAndActionAndTimestampAfter(
                    "APPROVER", "APPROVED", today);

            long todayRejected = historyRepository.countByActorRoleAndActionAndTimestampAfter(
                    "APPROVER", "REJECTED", today);

            long monthApproved = historyRepository.countByActorRoleAndActionAndTimestampAfter(
                    "APPROVER", "APPROVED", month);

            long monthRejected = historyRepository.countByActorRoleAndActionAndTimestampAfter(
                    "APPROVER", "REJECTED", month);

            Map<String, Long> kpi = new HashMap<>();
            kpi.put("todayApproved", todayApproved);
            kpi.put("todayRejected", todayRejected);
            kpi.put("monthApproved", monthApproved);
            kpi.put("monthRejected", monthRejected);

            return ResponseEntity.ok(kpi);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DTO for approval requests
    public static class ApprovalRequest {
        private String comment;
        private String reason;

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // DTO for contract creation
    public static class CreateContractRequest {
        private String title;
        private String description;
        private String contractType;
        private String toOrg;
        private String startDate;
        private String endDate;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getContractType() { return contractType; }
        public void setContractType(String contractType) { this.contractType = contractType; }

        public String getToOrg() { return toOrg; }
        public void setToOrg(String toOrg) { this.toOrg = toOrg; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }
}
