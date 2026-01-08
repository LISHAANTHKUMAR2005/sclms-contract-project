package com.sclms.sclms_backend.security;

import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        final String method = request.getMethod();
        final String authHeader = request.getHeader("Authorization");

        // =========================
        // Log basic request context
        // =========================
        String username = "anonymous";

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                username = jwtUtil.extractUsername(authHeader.substring(7));
            } catch (Exception ignored) {
                username = "invalid-token";
            }
        }

        log.info("🔎 REQUEST: {} {} | user={} | path={}", method, requestURI, username, requestURI);

        // =========================
        // If no token → skip auth
        // =========================
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            username = jwtUtil.extractUsername(token);

            boolean notAlreadyAuthenticated =
                    SecurityContextHolder.getContext().getAuthentication() == null;

            if (username != null && notAlreadyAuthenticated && jwtUtil.validateToken(token, username)) {

                Optional<User> userOpt = userRepository.findByEmail(username);

                if (userOpt.isEmpty()) {
                    log.warn("❌ JWT user not found in DB: {}", username);
                } else {

                    User user = userOpt.get();

                    // ===========================================
                    // READ ROLES — support multiple claim formats
                    // ===========================================
                    Set<String> roles = new HashSet<>();

                    // 1) roles[]
                    List<String> claimRoles = jwtUtil.extractClaim(token, claims ->
                            claims.get("roles", List.class));

                    if (claimRoles != null) {
                        roles.addAll(claimRoles);
                    }

                    // 2) role (single)
                    String singleRole = jwtUtil.extractClaim(token, claims ->
                            claims.get("role", String.class));

                    if (singleRole != null) {
                        roles.add(singleRole);
                    }

                    // 3) authorities[]
                    List<String> authorities = jwtUtil.extractClaim(token, claims ->
                            claims.get("authorities", List.class));

                    if (authorities != null) {
                        roles.addAll(authorities);
                    }

                    // 4) Fallback to DB role
                    if (roles.isEmpty() && user.getRole() != null) {
                        roles.add(user.getRole());
                    }

                    // Normalize → ensure ROLE_ prefix
                    Set<SimpleGrantedAuthority> grantedAuthorities =
                            roles.stream()
                                    .filter(Objects::nonNull)
                                    .map(String::trim)
                                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                                    .map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toSet());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    grantedAuthorities
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.info("✅ AUTH OK | user={} | roles={} | endpoint={}",
                            user.getEmail(),
                            grantedAuthorities,
                            requestURI
                    );
                }

            } else {
                log.warn("⚠️ JWT rejected | user={} | validToken={} | endpoint={}",
                        username,
                        jwtUtil.validateToken(token, username),
                        requestURI
                );
            }

        } catch (Exception ex) {
            log.error("❌ JWT processing failed [{} {}]: {}", method, requestURI, ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
