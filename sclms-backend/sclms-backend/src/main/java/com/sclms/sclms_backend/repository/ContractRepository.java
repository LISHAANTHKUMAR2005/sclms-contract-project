package com.sclms.sclms_backend.repository;

import com.sclms.sclms_backend.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    // Basic queries
    List<Contract> findByStatus(String status);
    long countByStatus(String status);
    List<Contract> findByCreatedBy(Long userId);
    List<Contract> findByApprovedBy(Long userId);

    // Organization-based queries
    List<Contract> findByFromOrg(String fromOrg);
    List<Contract> findByToOrg(String toOrg);
    List<Contract> findByFromOrgOrToOrgOrderByCreatedDateDesc(String fromOrg, String toOrg);

    // Status and organization combined
    List<Contract> findByToOrgAndStatusOrderByCreatedDateDesc(String toOrg, String status);
    List<Contract> findByFromOrgAndStatusOrderByCreatedDateDesc(String fromOrg, String status);

    // Contract type queries
    List<Contract> findByContractType(String contractType);
    List<Contract> findByContractTypeAndStatus(String contractType, String status);

    // Date-based queries
    List<Contract> findByCreatedDateBetween(LocalDateTime start, LocalDateTime end);
    List<Contract> findByEndDateBefore(LocalDateTime date);

    // Search queries
    @Query("SELECT c FROM Contract c WHERE " +
           "LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.contractType) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Contract> searchContracts(@Param("search") String search);

    // Dashboard analytics queries
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.status = :status AND c.createdDate >= :since")
    long countByStatusAndCreatedDateAfter(@Param("status") String status, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.toOrg = :org AND c.status = :status")
    long countByToOrgAndStatus(@Param("org") String org, @Param("status") String status);

    // Expiring contracts
    @Query("SELECT c FROM Contract c WHERE c.endDate <= :futureDate AND c.status = 'APPROVED'")
    List<Contract> findExpiringContracts(@Param("futureDate") LocalDateTime futureDate);

    // Recent contracts
    List<Contract> findTop10ByOrderByCreatedDateDesc();
    List<Contract> findTop20ByStatusOrderByCreatedDateDesc(String status);
}
