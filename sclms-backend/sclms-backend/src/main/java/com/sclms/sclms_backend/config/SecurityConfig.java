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

                                // ✅ Enable CORS (from bean below)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // ✅ Disable CSRF (JWT)
                                .csrf(csrf -> csrf.disable())

                                // ✅ Stateless
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // ✅ Authorization
                                .authorizeHttpRequests(auth -> auth

                                                // Preflight
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // ======================
                                                // PUBLIC
                                                // ======================
                                                .requestMatchers(
                                                                "/",
                                                                "/api/auth/**",
                                                                "/api/debug/**",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // ======================
                                                // AUTHENTICATED
                                                // ======================
                                                .requestMatchers("/api/auth/change-password")
                                                .authenticated()

                                                // ======================
                                                // USER / APPROVER / ADMIN
                                                // ======================
                                                .requestMatchers(
                                                                "/api/contracts/my/**",
                                                                "/api/contracts/create/**",
                                                                "/api/notifications/**",
                                                                "/api/2fa/**",
                                                                "/api/contracts/file/**",
                                                                "/api/organizations/**")
                                                .hasAnyAuthority("ROLE_USER", "ROLE_APPROVER", "ROLE_ADMIN")

                                                // ======================
                                                // APPROVER + ADMIN
                                                // ======================
                                                .requestMatchers(
                                                                "/api/contracts/approver/**",
                                                                "/api/contracts/activity/approver/**",
                                                                "/api/contracts/history/**",
                                                                "/api/users/**")
                                                .hasAnyAuthority("ROLE_APPROVER", "ROLE_ADMIN")

                                                // ======================
                                                // ADMIN
                                                // ======================
                                                .requestMatchers("/api/admin/**")
                                                .hasAuthority("ROLE_ADMIN")

                                                // ======================
                                                // OTHER
                                                // ======================
                                                .anyRequest().authenticated())

                                // ✅ JWT Filter
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // ===============================
        // CORS CONFIG (FINAL)
        // ===============================
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                config.setAllowCredentials(true);

                // ✅ Allow ALL Vercel + Local
                config.setAllowedOriginPatterns(List.of(
                                "http://localhost:*",
                                "https://*.vercel.app",
                                "https://sclms-contract-project.vercel.app"));

                config.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                config.setAllowedHeaders(List.of("*"));

                // ✅ Allow JWT header
                config.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

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

        // ===============================
        // GLOBAL CORS FILTER (Fixes 403s)
        // ===============================
        @Bean
        public org.springframework.boot.web.servlet.FilterRegistrationBean<org.springframework.web.filter.CorsFilter> corsFilter() {
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowCredentials(true);
                config.setAllowedOriginPatterns(List.of(
                                "http://localhost:*",
                                "https://*.vercel.app",
                                "https://sclms-contract-project.vercel.app"));
                config.addAllowedHeader("*");
                config.addAllowedMethod("*");
                source.registerCorsConfiguration("/**", config);

                org.springframework.boot.web.servlet.FilterRegistrationBean<org.springframework.web.filter.CorsFilter> bean = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(
                                new org.springframework.web.filter.CorsFilter(source));
                bean.setOrder(org.springframework.core.Ordered.HIGHEST_PRECEDENCE);
                return bean;
        }
}
