package com.myfin.accountservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.myfin.accountservice.entity.Transaction;
import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccount(Long accountId);

    List<Transaction> findByFromAccountOrToAccount(
        Long fromAccount, Long toAccount);

    List<Transaction> findTop5ByFromAccountOrToAccountOrderByTimestampDesc(
        Long fromAccount, Long toAccount);
}
