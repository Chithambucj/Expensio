package com.expense.tracker.controller;

import com.expense.tracker.dto.UserProfileDTO;
import com.expense.tracker.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getCurrentProfile() {
        return ResponseEntity.ok(profileService.getCurrentUserProfile());
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody UserProfileDTO profileDTO) {
        return ResponseEntity.ok(profileService.updateProfile(profileDTO));
    }
}
