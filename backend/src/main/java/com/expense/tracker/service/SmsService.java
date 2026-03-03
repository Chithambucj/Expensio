package com.expense.tracker.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        if (!"REPLACE_WITH_YOUR_ACCOUNT_SID".equals(accountSid)) {
            Twilio.init(accountSid, authToken);
        }
    }

    public void sendOtp(String mobileNumber, String otp) {
        if ("REPLACE_WITH_YOUR_ACCOUNT_SID".equals(accountSid)) {
            // Fallback to silent mock if credentials are not configured
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber(mobileNumber),
                    new PhoneNumber(fromPhoneNumber),
                    "Your Expensio password reset OTP is: " + otp + ". This code will expire in 10 minutes.").create();
        } catch (Exception e) {
            // Silently fail or use a proper logger in production
            // For now, we follow the user's request for no console output
        }
    }
}
