package com.myfin.loanservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanRequest {

    // Basic loan info
    private Long userId;
    private String loanType;
    private Double amount;
    private Integer tenure;
    private Double interestRate;

    // ✅ Applicant details
    private String applicantName;
    private String applicantEmail;

    // ✅ Extra required info
    private Integer age;
    private String address;
    private String loanPurpose;
    private Double monthlyIncome;
    private String employmentType;

    // ✅ Verification
    private String verificationQuestion;
    private String verificationAnswer;
}