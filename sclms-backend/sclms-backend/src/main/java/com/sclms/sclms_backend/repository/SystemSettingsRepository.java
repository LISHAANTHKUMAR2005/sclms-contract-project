package com.sclms.sclms_backend.repository;

import com.sclms.sclms_backend.entity.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
    // Custom query methods can be added here if needed
}
