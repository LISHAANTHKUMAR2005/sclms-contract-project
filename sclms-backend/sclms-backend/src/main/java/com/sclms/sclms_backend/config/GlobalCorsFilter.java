package com.sclms.sclms_backend.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
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

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");

        // Allow ONLY the Vercel frontend origin
        if (ALLOWED_ORIGIN.equals(origin)) {
            res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,X-Requested-With");
            res.setHeader("Access-Control-Expose-Headers", "Authorization");
            res.setHeader("Access-Control-Max-Age", "3600");
        }

        // CRITICAL: Handle OPTIONS preflight requests
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return; // DO NOT continue filter chain for OPTIONS
        }

        chain.doFilter(request, response);
    }
}
