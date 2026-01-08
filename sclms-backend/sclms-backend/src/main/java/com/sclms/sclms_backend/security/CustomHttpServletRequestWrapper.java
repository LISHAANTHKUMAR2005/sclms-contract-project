package com.sclms.sclms_backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.HashMap;
import java.util.Map;

public class CustomHttpServletRequestWrapper extends HttpServletRequestWrapper {

    private final Map<String, String> additionalHeaders = new HashMap<>();

    public CustomHttpServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    public void addHeader(String name, String value) {
        additionalHeaders.put(name, value);
    }

    @Override
    public String getHeader(String name) {
        // Check additional headers first
        String headerValue = additionalHeaders.get(name);
        if (headerValue != null) {
            return headerValue;
        }
        // Fall back to original headers
        return super.getHeader(name);
    }
}
