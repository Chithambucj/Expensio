package com.expense.tracker.controller;

import com.expense.tracker.model.PaymentMode;
import com.expense.tracker.service.PaymentModeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-modes")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular app
public class PaymentModeController {

    @Autowired
    private PaymentModeService paymentModeService;

    @GetMapping
    public List<PaymentMode> getAllPaymentModes() {
        return paymentModeService.getAllPaymentModes();
    }

    @PostMapping
    public PaymentMode addPaymentMode(@RequestBody PaymentMode paymentMode) {
        return paymentModeService.addPaymentMode(paymentMode);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMode> updatePaymentMode(@PathVariable String id,
            @RequestBody PaymentMode paymentMode) {
        PaymentMode updated = paymentModeService.updatePaymentMode(id, paymentMode);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMode(@PathVariable String id) {
        paymentModeService.deletePaymentMode(id);
        return ResponseEntity.noContent().build();
    }
}
