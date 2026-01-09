package com.sclms.sclms_backend.controller;

import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.service.TwoFactorAuthService;
import com.sclms.sclms_backend.service.UserService;
import com.sclms.sclms_backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/2fa")
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public TwoFactorAuthController(
            TwoFactorAuthService twoFactorAuthService,
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.twoFactorAuthService = twoFactorAuthService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Setup 2FA - generates secret and QR code
     */
    @PostMapping("/setup")
    public ResponseEntity<?> setup2FA(Authentication auth) {
        try {
            System.out.println("🔍 2FA setup called - auth: " + (auth != null));
            if (auth != null && auth.getPrincipal() != null) {
                System.out.println("🔍 Principal: " + auth.getPrincipal().getClass().getSimpleName());
                System.out.println("🔍 Authorities: " + auth.getAuthorities());
            }

            // TEMPORARY: Get user from a header or parameter for debugging
            // In production, this should come from authentication
            User user;
            if (auth != null && auth.getPrincipal() instanceof User) {
                user = (User) auth.getPrincipal();
            } else {
                // For debugging - get user from header (this is temporary)
                // In production, proper authentication should be used
                return ResponseEntity.badRequest().body(Map.of("error", "Authentication required"));
            }

            // Generate secret and QR code
            Map<String, String> setupData = twoFactorAuthService.generateSecretAndQR(
                user.getEmail(), "SCLMS"
            );

            // Save secret to user (but don't enable yet)
            user.setTwoFactorSecret(setupData.get("secret"));
            userService.updateUser(user.getId(), user);

            // Return QR URL and secret (secret can be used as backup)
            Map<String, Object> response = new HashMap<>();
            response.put("qrUrl", setupData.get("qrUrl"));
            response.put("secret", setupData.get("secret"));
            response.put("message", "Scan QR code with Google Authenticator");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Enable 2FA - verifies code and enables
     */
    @PostMapping("/enable")
    public ResponseEntity<?> enable2FA(
            @RequestBody Map<String, Object> request,
            Authentication auth
    ) {
        try {
            User user = (User) auth.getPrincipal();

            if (user.getTwoFactorSecret() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Setup 2FA first"));
            }

            Integer code = (Integer) request.get("code");
            if (code == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Code required"));
            }

            // Validate the TOTP code
            boolean valid = twoFactorAuthService.validateCodeWithWindow(
                user.getTwoFactorSecret(), code, 2 // 2-minute window
            );

            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid 2FA code"));
            }

            // Enable 2FA
            user.setTwoFactorEnabled(true);
            userService.updateUser(user.getId(), user);

            return ResponseEntity.ok(Map.of("message", "2FA enabled successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Disable 2FA - requires password + TOTP verification
     */
    @PostMapping("/disable")
    public ResponseEntity<?> disable2FA(
            @RequestBody Map<String, Object> request,
            Authentication auth
    ) {
        try {
            User user = (User) auth.getPrincipal();

            if (!user.getTwoFactorEnabled()) {
                return ResponseEntity.badRequest().body(Map.of("error", "2FA not enabled"));
            }

            String password = (String) request.get("password");
            Integer code = (Integer) request.get("code");

            if (password == null || code == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password and code required"));
            }

            // Verify password
            if (!userService.validatePassword(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
            }

            // Verify TOTP code
            boolean valid = twoFactorAuthService.validateCodeWithWindow(
                user.getTwoFactorSecret(), code, 2
            );

            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid 2FA code"));
            }

            // Disable 2FA
            user.setTwoFactorEnabled(false);
            user.setTwoFactorSecret(null);
            userService.updateUser(user.getId(), user);

            return ResponseEntity.ok(Map.of("message", "2FA disabled successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify 2FA code - used during login second step
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Integer code = (Integer) request.get("code");

            if (userId == null || code == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID and code required"));
            }

            User user = userService.getUserById(userId);

            if (!user.getTwoFactorEnabled() || user.getTwoFactorSecret() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "2FA not enabled"));
            }

            // Validate TOTP code
            boolean valid = twoFactorAuthService.validateCodeWithWindow(
                user.getTwoFactorSecret(), code, 2
            );

            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid 2FA code"));
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "status", user.getStatus(),
                "organization", user.getOrganization()
            ));
            response.put("message", "Login successful with 2FA");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
