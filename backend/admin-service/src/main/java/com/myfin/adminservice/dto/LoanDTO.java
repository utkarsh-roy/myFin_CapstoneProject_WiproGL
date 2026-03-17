package com.myfin.adminservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoanDTO {
    private Long id;
    private Long userId;
    private String loanType;      
    private double amount;
    private Integer tenure;       
    private double interestRate;  
    private double emi;
    private String status;

    private String applicantName;
    private String applicantEmail;
    private Integer age;
    private String address;
    private String loanPurpose;
    private Double monthlyIncome;
    private String employmentType;
    private String verificationQuestion;
    private String verificationAnswer;
    private java.time.LocalDateTime appliedAt;
}
