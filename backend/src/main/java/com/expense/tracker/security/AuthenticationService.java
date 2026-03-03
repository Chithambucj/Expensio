package com.expense.tracker.security;

import com.expense.tracker.dto.AuthenticationRequest;
import com.expense.tracker.dto.AuthenticationResponse;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.model.Role;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.EmailService;
import com.expense.tracker.service.SmsService;
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
        private final SmsService smsService;

        public AuthenticationResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already in use");
                }
                var user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .mobileNumber(request.getMobileNumber())
                                .role(Role.USER)
                                .build();
                userRepository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                // ... (existing code omitted for brevity but should be kept if replacing the
                // whole block)
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();
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
                } else if (mobileNumber != null && !mobileNumber.isEmpty()) {
                        userRepository.findByMobileNumber(mobileNumber).ifPresent(user -> {
                                SecureRandom secureRandom = new SecureRandom();
                                String otp = String.format("%06d", secureRandom.nextInt(1000000));
                                user.setOtp(otp);
                                user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
                                userRepository.save(user);

                                smsService.sendOtp(mobileNumber, otp);
                        });
                }
        }

        public String verifyOtp(String mobileNumber, String otp) {
                User user = userRepository.findByMobileNumber(mobileNumber)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getOtp() == null || !user.getOtp().equals(otp)) {
                        throw new RuntimeException("Invalid OTP");
                }

                if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("OTP has expired");
                }

                // If valid, generate a reset token and clear OTP
                String token = UUID.randomUUID().toString();
                user.setResetToken(token);
                user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
                user.setOtp(null);
                user.setOtpExpiry(null);
                userRepository.save(user);

                return token;
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
}
