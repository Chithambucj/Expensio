package com.expense.tracker.controller;

import com.expense.tracker.dto.AuthenticationRequest;
import com.expense.tracker.dto.AuthenticationResponse;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.dto.ForgotPasswordRequest;
import com.expense.tracker.dto.ResetPasswordRequest;
import com.expense.tracker.security.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        service.forgotPassword(request.getEmail(), request.getMobileNumber());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<com.expense.tracker.dto.VerifyOtpResponse> verifyOtp(
            @RequestBody com.expense.tracker.dto.VerifyOtpRequest request) {
        String token = service.verifyOtp(request.getMobileNumber(), request.getOtp());
        return ResponseEntity.ok(com.expense.tracker.dto.VerifyOtpResponse.builder().token(token).build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
        service.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
