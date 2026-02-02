package com.sclms.sclms_backend.config;

import com.sclms.sclms_backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // ===============================
    // MAIN SECURITY CONFIG
    // ===============================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http

            // Disable CSRF (JWT Based)
            .csrf(csrf -> csrf.disable())

            // Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Authorization
            .authorizeHttpRequests(auth -> auth

                // Preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ==========================
                // PUBLIC ENDPOINTS (NO JWT)
                // ==========================
                .requestMatchers(
                        "/",
                        "/api/auth/**",
                        "/api/debug/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**"
                ).permitAll()

                // ==========================
                // AUTHENTICATED USERS
                // ==========================
                .requestMatchers("/api/auth/change-password")
                .authenticated()

                // ==========================
                // USER / APPROVER / ADMIN
                // ==========================
                .requestMatchers(
                        "/api/contracts/my/**",
                        "/api/contracts/create/**",
                        "/api/notifications/**",
                        "/api/2fa/**",
                        "/api/contracts/file/**",
                        "/api/organizations/**"
                )
                .hasAnyAuthority("ROLE_USER", "ROLE_APPROVER", "ROLE_ADMIN")

                // ==========================
                // APPROVER + ADMIN
                // ==========================
                .requestMatchers(
                        "/api/contracts/approver/**",
                        "/api/contracts/activity/approver/**",
                        "/api/contracts/history/**",
                        "/api/users/**"
                )
                .hasAnyAuthority("ROLE_APPROVER", "ROLE_ADMIN")

                // ==========================
                // ADMIN ONLY
                // ==========================
                .requestMatchers("/api/admin/**")
                .hasAuthority("ROLE_ADMIN")

                // ==========================
                // EVERYTHING ELSE
                // ==========================
                .anyRequest().authenticated()
            )

            // JWT Filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // ===============================
    // CORS CONFIG (VERY IMPORTANT)
    // ===============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);

        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://sclms-contract-project.vercel.app"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // ===============================
    // AUTH MANAGER
    // ===============================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    // ===============================
    // PASSWORD ENCODER
    // ===============================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
