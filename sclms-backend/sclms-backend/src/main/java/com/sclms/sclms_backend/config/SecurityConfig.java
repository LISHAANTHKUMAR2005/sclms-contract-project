package com.sclms.sclms_backend.config;

import com.sclms.sclms_backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import java.util.Arrays;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // =====================
                // PUBLIC AUTH ENDPOINTS
                // =====================
                .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/debug/**",
                        "/api/admin/users/debug-auth"
                ).permitAll()

                // =====================
                // PASSWORD CHANGE (AUTH)
                // =====================
                .requestMatchers("/api/auth/change-password")
                    .authenticated()

                // =====================
                // USER AREA
                // =====================
                .requestMatchers(
                        "/api/contracts/my/**",
                        "/api/contracts/create/**",
                        "/api/notifications/**",
                        "/api/2fa/**",
                        "/api/contracts/file/**",
                        "/api/organizations/**"
                ).hasAnyAuthority("ROLE_USER","ROLE_APPROVER","ROLE_ADMIN")

                // =====================
                // APPROVER AREA
                // =====================
                .requestMatchers(
                        "/api/contracts/approver/**",
                        "/api/contracts/activity/approver/**",
                        "/api/contracts/history/**",
                        "/api/users/**"
                ).hasAnyAuthority("ROLE_APPROVER","ROLE_ADMIN")

                // =====================
                // ADMIN AREA
                // =====================
                .requestMatchers(
                        "/api/admin/**"
                ).hasAuthority("ROLE_ADMIN")

                // =====================
                // DEFAULT RULE
                // =====================
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.asList(
                "https://sclms-contract-project.vercel.app"
        ));
        cfg.setAllowedMethods(Arrays.asList(
                "GET","POST","PUT","DELETE","PATCH","OPTIONS"
        ));
        cfg.setAllowedHeaders(Arrays.asList("*"));
        cfg.setExposedHeaders(Arrays.asList("Authorization"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
}
