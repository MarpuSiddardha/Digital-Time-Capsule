package com.siddardha.digital_time_capsule.Repository;


import com.siddardha.digital_time_capsule.Model.Capsule;
import com.siddardha.digital_time_capsule.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CapsuleRepository extends JpaRepository<Capsule, Long> {
    List<Capsule> findByUser(User user);
    List<Capsule> findByUserAndUnlockDateTimeBefore(User user, LocalDateTime dateTime);

    List<Capsule> findByUserAndUnlockDateTimeAfter(User user, LocalDateTime now);

    Optional<Capsule> findByIdAndUser(Long id, User user);


    @Query("SELECT c FROM Capsule c WHERE c.id = :id AND c.user.username = :username")
    Optional<Capsule> findByIdAndUser_Username(@Param("id") Long id, @Param("username") String username);
}

