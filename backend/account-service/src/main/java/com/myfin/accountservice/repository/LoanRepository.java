package com.myfin.accountservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.myfin.accountservice.entity.Loan;

public interface LoanRepository extends JpaRepository<Loan, Long> {
}
