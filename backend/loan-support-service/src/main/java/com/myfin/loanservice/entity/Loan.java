package com.myfin.loanservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "loan_type")
    private String loanType;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Integer tenure;

    @Column(name = "interest_rate")
    private Double interestRate;

    private Double emi;
    private String status;

    // ✅ Applicant details - fetched from DB
    @Column(name = "applicant_name")
    private String applicantName;

    @Column(name = "applicant_email")
    private String applicantEmail;

    // ✅ Extra details - filled by user
    private Integer age;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "loan_purpose",
        columnDefinition = "TEXT")
    private String loanPurpose;

    @Column(name = "monthly_income")
    private Double monthlyIncome;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "verification_question")
    private String verificationQuestion;

    @Column(name = "verification_answer")
    private String verificationAnswer;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @PrePersist
    public void prePersist() {
        this.appliedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}