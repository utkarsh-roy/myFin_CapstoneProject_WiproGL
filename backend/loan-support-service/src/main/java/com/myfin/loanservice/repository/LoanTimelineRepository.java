package com.myfin.loanservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.myfin.loanservice.entity.LoanTimeline;
import java.util.List;

@Repository
public interface LoanTimelineRepository
        extends JpaRepository<LoanTimeline, Long> {

    // Get all timeline events for a loan ordered by time
    List<LoanTimeline> findByLoanIdOrderByTimestampAsc(
        Long loanId);
}
