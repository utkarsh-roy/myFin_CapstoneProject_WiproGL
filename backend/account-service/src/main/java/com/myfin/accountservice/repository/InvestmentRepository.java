package com.myfin.accountservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.myfin.accountservice.entity.Investment;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

}