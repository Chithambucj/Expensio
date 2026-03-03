package com.expense.tracker.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendPasswordResetEmail(String toInfo, String resetLink) {
        if (toInfo == null || fromEmail == null)
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(java.util.Objects.requireNonNull(fromEmail));
            helper.setTo(java.util.Objects.requireNonNull(toInfo));
            helper.setSubject("Password Reset Request - Expensio");

            String htmlContent = buildResetEmailHtml(resetLink);
            helper.setText(String.valueOf(htmlContent), true);

            mailSender.send(message);

        } catch (MessagingException e) {
            // Silently fail or use a proper logger in production
        } catch (Exception e) {
            // Silently fail or use a proper logger in production
        }
    }

    private String buildResetEmailHtml(String resetLink) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;\">"
                +
                "<div style=\"background-color: #8b5cf6; padding: 20px; text-align: center;\">" +
                "<h1 style=\"color: white; margin: 0;\">Expensio</h1>" +
                "</div>" +
                "<div style=\"padding: 30px; background-color: #ffffff;\">" +
                "<h2 style=\"color: #333; margin-top: 0;\">Password Reset Request</h2>" +
                "<p style=\"color: #555; font-size: 16px; line-height: 1.5;\">Hello,</p>" +
                "<p style=\"color: #555; font-size: 16px; line-height: 1.5;\">We received a request to reset your password for your Expensio account. Click the button below to set a new password. This link will expire in 30 minutes.</p>"
                +
                "<div style=\"text-align: center; margin: 30px 0;\">" +
                "<a href=\"" + resetLink
                + "\" style=\"background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Reset Password</a>"
                +
                "</div>" +
                "<p style=\"color: #555; font-size: 16px; line-height: 1.5;\">If you didn't request a password reset, you can safely ignore this email.</p>"
                +
                "</div>" +
                "<div style=\"background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;\">"
                +
                "&copy; 2026 Expensio. All rights reserved." +
                "</div>" +
                "</div>";
    }
}
