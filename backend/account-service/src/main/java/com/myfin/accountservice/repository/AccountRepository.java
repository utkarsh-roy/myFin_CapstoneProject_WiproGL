package com.myfin.accountservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.myfin.accountservice.entity.Account;

public interface AccountRepository
        extends JpaRepository<Account, Long> {

    Account findByUserId(Long userId);

    Account findByAccountNumber(String accountNumber);
}
