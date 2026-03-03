package com.expense.tracker.service;

import com.expense.tracker.model.PaymentMode;
import com.expense.tracker.repository.PaymentModeRepository;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentModeService {

    private final PaymentModeRepository paymentModeRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "User not found"));
    }

    public List<PaymentMode> getAllPaymentModes() {
        return paymentModeRepository.findAllByUser(getCurrentUser());
    }

    public PaymentMode addPaymentMode(PaymentMode paymentMode) {
        paymentMode.generateId();
        paymentMode.setUser(getCurrentUser());
        return paymentModeRepository.save(paymentMode);
    }

    public PaymentMode updatePaymentMode(String id, PaymentMode paymentMode) {
        User currentUser = getCurrentUser();
        return paymentModeRepository.findByIdAndUser(id, currentUser)
                .map(existing -> {
                    paymentMode.setId(id);
                    paymentMode.setUser(currentUser);
                    return paymentModeRepository.save(paymentMode);
                })
                .orElse(null);
    }

    public void deletePaymentMode(String id) {
        User currentUser = getCurrentUser();
        paymentModeRepository.findByIdAndUser(id, currentUser)
                .ifPresent(paymentModeRepository::delete);
    }

    public Optional<PaymentMode> getPaymentModeById(String id) {
        return paymentModeRepository.findByIdAndUser(id, getCurrentUser());
    }
}
