package com.expense.tracker.controller;

import com.expense.tracker.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @GetMapping("/email")
    public ResponseEntity<String> testEmail(@RequestParam String to) {
        emailService.sendSimpleEmail(to, "SMTP Test - Expensio", "This is a test email to verify Gmail SMTP configuration.");
        return ResponseEntity.ok("Test email triggered. Check the backend logs for status.");
    }
}
