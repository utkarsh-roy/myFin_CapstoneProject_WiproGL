package com.myfin.accountservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.myfin.accountservice.entity.TransactionLimit;
import java.util.Optional;

@Repository
public interface TransactionLimitRepository
        extends JpaRepository<TransactionLimit, Long> {

    // Get limit for specific user
    Optional<TransactionLimit> findByUserId(Long userId);

    // Get global limit (userId = null)
    Optional<TransactionLimit> findByUserIdIsNull();
}