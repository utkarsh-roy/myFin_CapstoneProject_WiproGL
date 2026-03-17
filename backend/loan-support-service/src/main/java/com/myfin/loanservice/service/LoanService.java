package com.myfin.loanservice.service;

import com.myfin.loanservice.dto.LoanRequest;
import com.myfin.loanservice.dto.LoanResponse;
import com.myfin.loanservice.dto.LoanTimelineResponse;
import java.util.List;

public interface LoanService {

    LoanResponse applyLoan(LoanRequest request);

    List<LoanResponse> getLoansByUser(Long userId);

    LoanResponse getLoanById(Long loanId);

    void cancelLoan(Long loanId);

    List<LoanResponse> getAllLoans();

    List<LoanResponse> getPendingLoans();

    LoanResponse approveLoan(Long loanId);

    LoanResponse denyLoan(Long loanId);

    // ✅ New - Get timeline for a loan
    List<LoanTimelineResponse> getLoanTimeline(Long loanId);
}
