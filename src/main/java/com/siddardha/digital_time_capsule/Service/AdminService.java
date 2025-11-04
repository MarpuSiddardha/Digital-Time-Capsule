package com.siddardha.digital_time_capsule.Service;

import com.siddardha.digital_time_capsule.Model.Capsule;
import com.siddardha.digital_time_capsule.Model.User;
import com.siddardha.digital_time_capsule.Repository.CapsuleRepository;
import com.siddardha.digital_time_capsule.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CapsuleRepository capsuleRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Capsule> getAllCapsules() {
        return capsuleRepository.findAll();
    }

    public Map<String, Long> getCapsuleCountPerUser() {
        Map<String, Long> stats = new HashMap<>();
        List<User> users = userRepository.findAll();
        for (User user : users) {
            long count = capsuleRepository.findByUser(user).size();
            stats.put(user.getUsername(), count);
        }
        return stats;
    }

    public List<Capsule> getUnlockedCapsules() {
        return capsuleRepository.findAll().stream()
                .filter(c-> c.getUnlockDateTime() != null)
                .filter(c -> c.getUnlockDateTime().isBefore(java.time.LocalDateTime.now()))
                .toList();
    }

    public List<Capsule> getLockedCapsules() {
        return capsuleRepository.findAll().stream()
                .filter(c -> c.getUnlockDateTime() != null)
                .filter(c -> c.getUnlockDateTime().isAfter(LocalDateTime.now()))
                .toList();
    }
}