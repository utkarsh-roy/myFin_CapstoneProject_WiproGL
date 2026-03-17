package com.myfin.accountservice.service;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.myfin.accountservice.entity.Investment;
import com.myfin.accountservice.repository.InvestmentRepository;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository repo;

    @Autowired
    private AccountService accountService;

    // Create investment
    @Transactional
    public Investment create(Investment investment) {
        System.out.println(">>> INVESTMENT SERVICE: Creating investment for user " + investment.getUserId() + " amount " + investment.getAmount());
        // 1. Deduct balance first (will throw exception if insufficient)
        accountService.deductForInvestment(investment.getUserId(), investment.getAmount());

        // 2. Set dates
        investment.setCreatedAt(LocalDateTime.now());
        
        // Maturity date: Start date + duration in months (if duration exists)
        if (investment.getDuration() > 0) {
            investment.setMaturityDate(LocalDateTime.now().plusMonths(investment.getDuration()));
        }
        
        return repo.save(investment);
    }

    // Get all investments
    public List<Investment> getAll() {
        List<Investment> investments = repo.findAll();
        
        boolean modified = false;
        for (Investment inv : investments) {
            if (inv.getCreatedAt() == null) {
                // If missing, assume it was created 1 day ago for display
                inv.setCreatedAt(LocalDateTime.now().minusDays(1));
                modified = true;
            }
            if (inv.getMaturityDate() == null && inv.getDuration() > 0) {
                inv.setMaturityDate(inv.getCreatedAt().plusMonths(inv.getDuration()));
                modified = true;
            }
        }
        
        if (modified) {
            repo.saveAll(investments);
        }
        
        return investments;
    }
}
