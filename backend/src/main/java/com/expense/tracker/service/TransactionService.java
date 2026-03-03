package com.expense.tracker.service;

import com.expense.tracker.model.Transaction;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.TransactionRepository;
import com.expense.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByUser(getCurrentUser());
    }

    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getId() == null || transaction.getId().isEmpty()) {
            transaction.setId(UUID.randomUUID().toString());
        }
        transaction.setUser(getCurrentUser());
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(String id, Transaction transaction) {
        User currentUser = getCurrentUser();
        return transactionRepository.findByIdAndUser(id, currentUser)
                .map(existing -> {
                    transaction.setId(id);
                    transaction.setUser(currentUser);
                    return transactionRepository.save(transaction);
                })
                .orElseThrow(() -> new RuntimeException("Transaction not found or not owned by user"));
    }

    public void deleteTransaction(String id) {
        User currentUser = getCurrentUser();
        transactionRepository.findByIdAndUser(id, currentUser)
                .ifPresent(transactionRepository::delete);
    }

    public void saveAll(List<Transaction> transactions) {
        User currentUser = getCurrentUser();
        transactions.forEach(t -> t.setUser(currentUser));
        transactionRepository.saveAll(transactions);
    }
}
