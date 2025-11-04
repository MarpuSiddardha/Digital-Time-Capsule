package com.siddardha.digital_time_capsule.Repository;

import com.siddardha.digital_time_capsule.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    // Find by email (unique)
    Optional<User> findByEmail(String email);
}