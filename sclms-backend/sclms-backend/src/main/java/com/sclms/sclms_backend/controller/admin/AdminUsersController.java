package com.sclms.sclms_backend.controller.admin;

import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUsersController {

    // TEMPORARY: Test endpoint without admin restriction
    @PatchMapping("/test-reset-password")
    public ResponseEntity<?> testResetPassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of("message", "Test endpoint works"));
    }

    // TEMPORARY: Debug endpoint to check authentication
    @GetMapping("/debug-auth")
    public ResponseEntity<?> debugAuth() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            return ResponseEntity.ok(Map.of(
                "authenticated", auth.isAuthenticated(),
                "name", auth.getName(),
                "authorities", auth.getAuthorities().toString(),
                "principal", auth.getPrincipal().toString()
            ));
        } else {
            return ResponseEntity.ok(Map.of("authenticated", false, "message", "No authentication found"));
        }
    }

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserStatsForAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(
            Map.of(
                "contracts", 12,
                "approvals", 5,
                "rejections", 2
            )
        );
    }
}