package com.sclms.sclms_backend.config;

import com.sclms.sclms_backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
            // Disable CSRF (JWT based auth)
            .csrf(csrf -> csrf.disable())

            // Stateless session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

                // ✅ Allow CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ✅ Public auth APIs
                .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/debug/**",
                        "/api/admin/users/debug-auth"
                ).permitAll()

                // 🔐 Authenticated users
                .requestMatchers("/api/auth/change-password").authenticated()

                // 👤 User / Approver / Admin
                .requestMatchers(
                        "/api/contracts/my/**",
                        "/api/contracts/create/**",
                        "/api/notifications/**",
                        "/api/2fa/**",
                        "/api/contracts/file/**",
                        "/api/organizations/**"
                ).hasAnyAuthority("ROLE_USER", "ROLE_APPROVER", "ROLE_ADMIN")

                // 👨‍⚖️ Approver + Admin
                .requestMatchers(
                        "/api/contracts/approver/**",
                        "/api/contracts/activity/approver/**",
                        "/api/contracts/history/**",
                        "/api/users/**"
                ).hasAnyAuthority("ROLE_APPROVER", "ROLE_ADMIN")

                // 👑 Admin only
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                // 🔒 Everything else
                .anyRequest().authenticated()
            )

            // JWT filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
