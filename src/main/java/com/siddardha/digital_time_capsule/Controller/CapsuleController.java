package com.siddardha.digital_time_capsule.Controller;
import com.siddardha.digital_time_capsule.DTO.CapsuleRequest;
import com.siddardha.digital_time_capsule.DTO.CapsuleResponse;
import com.siddardha.digital_time_capsule.DTO.UpdateCapsuleRequest;
import com.siddardha.digital_time_capsule.Model.Capsule;
import com.siddardha.digital_time_capsule.Model.User;
import com.siddardha.digital_time_capsule.Repository.UserRepository;
import com.siddardha.digital_time_capsule.Service.CapsuleService;
import com.siddardha.digital_time_capsule.Service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/capsules")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CapsuleController {

    private final CapsuleService capsuleService;

    private final FileStorageService fileStorageService;

    private final UserRepository userRepository;

    @PostMapping("/create")
    public CapsuleResponse createCapsule(@RequestBody CapsuleRequest request, Authentication auth) {
        return capsuleService.createCapsule(request, auth.getName());
    }

    @GetMapping("/unlocked")
    public List<CapsuleResponse> getUnlockedCapsules(Authentication auth) {
        return capsuleService.getUnlockedCapsules(auth.getName());
    }

    @GetMapping("/locked")
    public List<CapsuleResponse> getLockedCapsules(Authentication auth) {
        return capsuleService.getLockedCapsules(auth.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCapsule(@PathVariable Long id, Authentication auth) {
        capsuleService.deleteCapsule(id, auth.getName());
        return ResponseEntity.ok("Capsule deleted successfully");
    }

    // Add this method to your CapsuleController
    @PutMapping("/{id}")
    public ResponseEntity<CapsuleResponse> updateCapsule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCapsuleRequest updateRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Capsule updatedCapsule = capsuleService.updateCapsule(id, updateRequest, user);
        return ResponseEntity.ok(convertToResponse(updatedCapsule));
    }

    // Helper method to convert entity to DTO
    private CapsuleResponse convertToResponse(Capsule capsule) {
        CapsuleResponse response = new CapsuleResponse();
        response.setId(capsule.getId());
        response.setTitle(capsule.getTitle());
        response.setMessage(capsule.getMessage());
        response.setUnlockDateTime(capsule.getUnlockDateTime().toString());
        response.setUnlocked(capsule.isUnlocked());
        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCapsuleById(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            Capsule capsule = capsuleService.getCapsuleByIdAndUser(id, username);
            return ResponseEntity.ok(capsule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Capsule not found or access denied"));
        }
    }

    // controller/CapsuleController.java
    @PostMapping("/create-with-file")
    public CapsuleResponse createCapsuleWithFile(
            @RequestPart("data") CapsuleRequest request,
            @RequestPart("file") MultipartFile file,
            Authentication auth) throws IOException {

        String filePath = fileStorageService.storeFile(file);
        return capsuleService.createCapsuleWithFile(request, auth.getName(), filePath);
    }

}