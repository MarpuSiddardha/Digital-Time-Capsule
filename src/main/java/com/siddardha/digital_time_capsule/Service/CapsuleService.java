package com.siddardha.digital_time_capsule.Service;
import com.siddardha.digital_time_capsule.DTO.CapsuleRequest;
import com.siddardha.digital_time_capsule.DTO.CapsuleResponse;
import com.siddardha.digital_time_capsule.DTO.UpdateCapsuleRequest;
import com.siddardha.digital_time_capsule.Exception.ResourceNotFoundException;
import com.siddardha.digital_time_capsule.Model.Capsule;
import com.siddardha.digital_time_capsule.Model.User;
import com.siddardha.digital_time_capsule.Repository.CapsuleRepository;
import com.siddardha.digital_time_capsule.Repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CapsuleService {

    private final CapsuleRepository capsuleRepository;
    private final UserRepository userRepository;

    public CapsuleResponse createCapsule(CapsuleRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate unlock date is in the future
        LocalDateTime unlockDateTime = request.getUnlockDateTime()  != null
                ? request.getUnlockDateTime()
                : LocalDateTime.now().plusYears(1);
        if (unlockDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Unlock date and time must be in the future");
        }
        Capsule capsule = new Capsule();
        capsule.setTitle(request.getTitle());
        capsule.setMessage(request.getMessage());
        capsule.setUnlockDateTime(unlockDateTime);
        capsule.setUser(user);
        capsule.setUnlocked(false);
        capsuleRepository.save(capsule);

        CapsuleResponse response = new CapsuleResponse();
        response.setId(capsule.getId());
        response.setTitle(capsule.getTitle());
        response.setMessage("Locked until " + capsule.getUnlockDateTime());
        response.setUnlocked(false);
        response.setUnlockDateTime(capsule.getUnlockDateTime().toString());
        return response;
    }

    public Capsule getCapsuleByIdAndUser(Long id, String username) {
        return capsuleRepository.findByIdAndUser_Username(id, username)
                .orElseThrow(() -> new ResourceNotFoundException("Capsule not found with id: " + id));
    }


    public CapsuleResponse createCapsuleWithFile(CapsuleRequest request, String username, String filePath) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Capsule capsule = new Capsule();
        capsule.setTitle(request.getTitle());
        capsule.setMessage(request.getMessage());
        // Set unlockDateTime to 1 year from now if not provided in request
        LocalDateTime unlockDateTime = request.getUnlockDateTime() != null
                ? request.getUnlockDateTime()
                : LocalDateTime.now().plusYears(1);
        capsule.setUnlockDateTime(unlockDateTime);
        capsule.setUser(user);
        capsule.setUnlocked(false);
        capsule.setFilePath(filePath);
        capsuleRepository.save(capsule);

        CapsuleResponse response = new CapsuleResponse();
        response.setId(capsule.getId());
        response.setTitle(capsule.getTitle());
        response.setMessage("Locked until " + capsule.getUnlockDateTime());
        response.setUnlocked(false);
        response.setUnlockDateTime(capsule.getUnlockDateTime().toString());
        return response;
    }

    public List<CapsuleResponse> getUnlockedCapsules(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<Capsule> capsules = capsuleRepository.findByUserAndUnlockDateTimeBefore(user, LocalDateTime.now());

        return capsules.stream().map(capsule -> {
            CapsuleResponse response = new CapsuleResponse();
            response.setId(capsule.getId());
            response.setTitle(capsule.getTitle());
            response.setMessage(capsule.getMessage());
            response.setUnlocked(true);
            response.setUnlockDateTime(capsule.getUnlockDateTime().toString());
            return response;
        }).collect(Collectors.toList());
    }

    public List<CapsuleResponse> getLockedCapsules(String name) {
        User user = userRepository.findByUsername(name).orElseThrow();
        List<Capsule> capsules = capsuleRepository.findByUserAndUnlockDateTimeAfter(user, LocalDateTime.now());

        return capsules.stream().map(capsule -> {
            CapsuleResponse response = new CapsuleResponse();
            response.setId(capsule.getId());
            response.setTitle(capsule.getTitle());
            response.setMessage(capsule.getMessage());
            response.setUnlocked(false);
            response.setUnlockDateTime(capsule.getUnlockDateTime().toString());
            return response;
        }).collect(Collectors.toList());
    }


    @Transactional
    public void deleteCapsule(Long id, String username) {
        Capsule capsule = capsuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Capsule not found"));

        if (!capsule.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You are not authorized to delete this capsule");
        }

        capsuleRepository.delete(capsule);
    }

    // Add this method to your existing CapsuleService class
    @Transactional
    public Capsule updateCapsule(Long id, UpdateCapsuleRequest updateRequest, User user) {
        Capsule capsule = (Capsule) capsuleRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new EntityNotFoundException("Capsule not found or you don't have permission to update it"));

        // Only allow updates to locked capsules
        if (capsule.isUnlocked()) {
            throw new IllegalStateException("Cannot update an unlocked capsule");
        }

        // Update fields if they're provided in the request
        if (updateRequest.getTitle() != null) {
            capsule.setTitle(updateRequest.getTitle());
        }
        if (updateRequest.getMessage() != null) {
            capsule.setMessage(updateRequest.getMessage());
        }
        if (updateRequest.getUnlockDateTime() != null) {
            capsule.setUnlockDateTime(updateRequest.getUnlockDateTime());
        }

        return capsuleRepository.save(capsule);
    }
}