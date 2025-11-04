package com.siddardha.digital_time_capsule.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendUnlockNotification(String to, String capsuleTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Time Capsule is Unlocked!");
        message.setText("🎉 Your capsule \"" + capsuleTitle + "\" is now unlocked. Visit the app to view it.");
        mailSender.send(message);
    }
}