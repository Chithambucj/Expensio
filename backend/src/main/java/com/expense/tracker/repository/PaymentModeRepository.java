package com.expense.tracker.repository;

import com.expense.tracker.model.PaymentMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.expense.tracker.model.User;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentModeRepository extends JpaRepository<PaymentMode, String> {
    List<PaymentMode> findAllByUser(User user);

    Optional<PaymentMode> findByIdAndUser(String id, User user);
}
