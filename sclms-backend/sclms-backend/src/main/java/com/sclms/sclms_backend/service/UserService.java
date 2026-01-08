package com.sclms.sclms_backend.service;

import com.sclms.sclms_backend.entity.User;
import com.sclms.sclms_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityService securityService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, SecurityService securityService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityService = securityService;
    }

    // User CRUD operations
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Validate password against security policy
        if (user.getPassword() != null) {
            try {
                securityService.validatePasswordPolicy(user.getPassword());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Password does not meet security requirements: " + e.getMessage());
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userDetails.getName());
        user.setOrganization(userDetails.getOrganization());
        user.setStatus(userDetails.getStatus());
        user.setRole(userDetails.getRole());

        // Update notification preferences
        user.setBrowserNotifications(userDetails.getBrowserNotifications());
        user.setEmailNotifications(userDetails.getEmailNotifications());
        user.setSystemNotifications(userDetails.getSystemNotifications());
        user.setContractAlerts(userDetails.getContractAlerts());
        user.setExpirationReminders(userDetails.getExpirationReminders());

        // Update 2FA settings
        user.setTwoFactorEnabled(userDetails.getTwoFactorEnabled());
        user.setTwoFactorSecret(userDetails.getTwoFactorSecret());

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public List<User> getUsersByStatus(String status) {
        return userRepository.findByStatus(status);
    }

    public List<User> getUsersByOrganization(String organization) {
        return userRepository.findByOrganization(organization);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    // Authentication methods
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    // Statistics
    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getUsersByRoleCount(String role) {
        return userRepository.countByRole(role);
    }

    public long getUsersByStatusCount(String status) {
        return userRepository.countByStatus(status);
    }

    // Role management
    public User changeUserRole(Long userId, String newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User approveUser(Long userId) {
        User user = getUserById(userId);
        user.setStatus("APPROVED");
        return userRepository.save(user);
    }

    public User rejectUser(Long userId) {
        User user = getUserById(userId);
        user.setStatus("REJECTED");
        return userRepository.save(user);
    }

    // Admin password reset
    @Transactional
    public void resetPasswordAsAdmin(Long id, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setAccountLocked(false);
        user.setLoginAttempts(0);

        userRepository.save(user);
    }
}
