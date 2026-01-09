package com.sclms.sclms_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.(com|org|edu|in|net|gov|mil|biz|info)$",
        message = "Email must end with a valid domain (.com, .org, .edu, .in, .net, .gov, .mil, .biz, .info)"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Organization is required")
    @Size(min = 2, max = 100, message = "Organization must be between 2 and 100 characters")
    private String organization;

    // Constructors
    public RegisterRequest() {}

    public RegisterRequest(String name, String email, String password, String organization) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.organization = organization;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
}