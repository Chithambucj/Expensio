package com.expense.tracker.security;

import com.expense.tracker.dto.AuthenticationRequest;
import com.expense.tracker.dto.AuthenticationResponse;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.model.Role;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final EmailService emailService;

        public AuthenticationResponse register(RegisterRequest request) {
                String sanitizedMobile = sanitizeMobileNumber(request.getMobileNumber());
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already in use");
                }
                if (userRepository.existsByMobileNumber(sanitizedMobile)) {
                        throw new RuntimeException("Mobile number already in use");
                }
                var user = User.builder()
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .mobileNumber(sanitizedMobile)
                                .role(Role.USER)
                                .build();
                userRepository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public void forgotPassword(String email, String mobileNumber) {
                if (email != null && !email.isEmpty()) {
                        userRepository.findByEmail(email).ifPresent(user -> {
                                String token = UUID.randomUUID().toString();
                                user.setResetToken(token);
                                user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
                                userRepository.save(user);

                                String resetLink = "http://localhost:4200/auth/reset-password?token=" + token;
                                emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
                        });
                }
        }


        public void resetPassword(String token, String newPassword) {
                User user = userRepository.findByResetToken(token)
                                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

                if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Reset token has expired");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                userRepository.save(user);
        }

        private String sanitizeMobileNumber(String mobileNumber) {
                if (mobileNumber == null) {
                        return null;
                }
                return mobileNumber.replaceAll("[^\\d]", "");
        }
}
