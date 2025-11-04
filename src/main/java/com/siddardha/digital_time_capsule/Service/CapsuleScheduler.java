package com.siddardha.digital_time_capsule.Service;

import com.siddardha.digital_time_capsule.Model.Capsule;
import com.siddardha.digital_time_capsule.Repository.CapsuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CapsuleScheduler {

    private final CapsuleRepository capsuleRepository;

    @Autowired
    private final EmailService emailService;

    @Scheduled(cron = "0 * * * * ?")
    public void unlockCapsules() {
        List<Capsule> capsules = capsuleRepository.findAll();

        for (Capsule capsule : capsules) {
            try {
                if (capsule.getUnlockDateTime() != null &&
                        !capsule.isUnlocked() &&
                        capsule.getUnlockDateTime().isBefore(LocalDateTime.now())) {

                    capsule.setUnlocked(true);
                    capsuleRepository.save(capsule);

                    // Send email
                    String email = capsule.getUser().getEmail();
                    emailService.sendUnlockNotification(email, capsule.getTitle());

                    log.info("Capsule unlocked and email sent: {}", capsule.getTitle());
                }
            } catch (Exception e) {
                log.error("Error processing capsule ID {}: {}", capsule.getId(), e.getMessage());
            }
        }
    }
}