package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.dto.OrganizationDto;
import com.sclms.sclms_backend.service.OrganizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private static final Logger log = LoggerFactory.getLogger(OrganizationController.class);

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getOrganizations(Authentication auth) {

        if (auth != null) {
            log.info("Fetching organizations | user={} | roles={}",
                    auth.getName(),
                    auth.getAuthorities()
            );
        } else {
            log.warn("Fetching organizations | unauthenticated request");
        }

        List<OrganizationDto> organizations = organizationService.getAllOrganizations();
        return ResponseEntity.ok(organizations);
    }
}
