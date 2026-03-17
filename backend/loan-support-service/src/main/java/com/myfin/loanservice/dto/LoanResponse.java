package com.myfin.loanservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponse {
    private Long id;
    private Long userId;
    private String loanType;
    private Double amount;
    private Integer tenure;
    private Double interestRate;
    private Double emi;
    private String status;
    private LocalDateTime appliedAt;

    // ✅ Applicant details
    private String applicantName;
    private String applicantEmail;
    private Integer age;
    private String address;
    private String loanPurpose;
    private Double monthlyIncome;
    private String employmentType;
    private String verificationQuestion;
    private String verificationAnswer;

    // Timeline
    private List<LoanTimelineResponse> timeline;
}