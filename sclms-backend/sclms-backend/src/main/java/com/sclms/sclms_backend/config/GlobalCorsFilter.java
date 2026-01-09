package com.sclms.sclms_backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalCorsFilter implements Filter {

    private static final String ALLOWED_ORIGIN = "https://sclms-contract-project.vercel.app";
    private static final String ALLOWED_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    private static final String ALLOWED_HEADERS = "*";
    private static final String EXPOSED_HEADERS = "Authorization";
    private static final String MAX_AGE = "3600";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String origin = httpRequest.getHeader("Origin");

        // Set CORS headers for all responses
        if (ALLOWED_ORIGIN.equals(origin)) {
            httpResponse.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
            httpResponse.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
            httpResponse.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
            httpResponse.setHeader("Access-Control-Expose-Headers", EXPOSED_HEADERS);
            httpResponse.setHeader("Access-Control-Max-Age", MAX_AGE);
        }

        // Handle OPTIONS preflight requests
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return; // Do not continue the filter chain for OPTIONS
        }

        // Continue with the filter chain for other requests
        chain.doFilter(request, response);
    }
}}
