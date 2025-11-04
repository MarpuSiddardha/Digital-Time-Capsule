package com.siddardha.digital_time_capsule.Controller;
import com.siddardha.digital_time_capsule.Model.Capsule;
import com.siddardha.digital_time_capsule.Model.User;
import com.siddardha.digital_time_capsule.Service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/capsules")
    public List<Capsule> getAllCapsules() {
        return adminService.getAllCapsules();
    }

    @GetMapping("/capsules/unlocked")
    public List<Capsule> getUnlockedCapsules() {
        return adminService.getUnlockedCapsules();
    }

    @GetMapping("/capsules/locked")
    public List<Capsule> getLockedCapsules() {
        return adminService.getLockedCapsules();
    }

    @GetMapping("/capsules/stats")
    public Map<String, Long> getCapsuleCountPerUser() {
        return adminService.getCapsuleCountPerUser();
    }
}