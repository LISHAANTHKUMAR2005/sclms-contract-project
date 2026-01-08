package com.sclms.sclms_backend.service;

import com.sclms.sclms_backend.dto.OrganizationDto;
import com.sclms.sclms_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrganizationService {

    private static final Logger log = LoggerFactory.getLogger(OrganizationService.class);

    private final UserRepository userRepository;

    public OrganizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<OrganizationDto> getAllOrganizations() {
        return userRepository.findAll().stream()
            .map(user -> user.getOrganization())
            .filter(org -> org != null && !org.trim().isEmpty())
            .distinct()
            .map(OrganizationDto::new)
            .toList();
    }

    public List<OrganizationDto> getOrganizationsForUser(Authentication auth) {
        log.info("🔍 getOrganizationsForUser called with auth={}", auth);

        // ALWAYS return all organizations for debugging
        List<OrganizationDto> allOrgs = getAllOrganizations();
        log.info("✅ DEBUG MODE - returning all {} organizations: {}", allOrgs.size(),
                allOrgs.stream().map(OrganizationDto::getName).toList());
        return allOrgs;
    }
}
