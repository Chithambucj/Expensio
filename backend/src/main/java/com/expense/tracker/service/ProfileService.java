package com.expense.tracker.service;

import com.expense.tracker.dto.UserProfileDTO;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    public UserProfileDTO getCurrentUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return UserProfileDTO.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profileImage(user.getProfileImage())
                .build();
    }

    public UserProfileDTO updateProfile(UserProfileDTO profileDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        user.setFullName(profileDTO.getFullName());
        if (profileDTO.getProfileImage() != null) {
            user.setProfileImage(profileDTO.getProfileImage());
        }

        userRepository.save(user);

        return UserProfileDTO.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profileImage(user.getProfileImage())
                .build();
    }
}
