package com.sclms.sclms_backend.repository;

import com.sclms.sclms_backend.entity.ContractDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContractDocumentRepository extends JpaRepository<ContractDocument, Long> {

    List<ContractDocument> findByContractIdOrderByVersionDesc(Long contractId);

    ContractDocument findTopByContractIdOrderByVersionDesc(Long contractId);
}
