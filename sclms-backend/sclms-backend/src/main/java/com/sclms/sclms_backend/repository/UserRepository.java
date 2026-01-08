package com.sclms.sclms_backend.repository;

import com.sclms.sclms_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    List<User> findByStatus(String status);

    List<User> findByOrganization(String organization);

    List<User> findByOrganizationAndRole(String organization, String role);

    @Query("SELECT u FROM User u WHERE u.organization = :org AND u.role IN ('USER', 'APPROVER') AND u.status = 'APPROVED'")
    List<User> findActiveUsersByOrganization(@Param("org") String organization);

    @Query("SELECT u FROM User u WHERE u.role = 'APPROVER' AND u.status = 'APPROVED'")
    List<User> findAllActiveApprovers();

    boolean existsByEmail(String email);

    long countByRole(String role);

    long countByStatus(String status);
}
