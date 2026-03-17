

package com.myfin.loanservice.service;

import com.myfin.loanservice.config.JwtUtil;
import com.myfin.loanservice.dto.AccountDTO;
import com.myfin.loanservice.dto.LoanRequest;
import com.myfin.loanservice.dto.LoanResponse;
import com.myfin.loanservice.dto.LoanTimelineResponse;
import com.myfin.loanservice.entity.Loan;
import com.myfin.loanservice.entity.LoanTimeline;
import com.myfin.loanservice.entity.Notification;
import com.myfin.loanservice.exception.LoanNotFoundException;
import com.myfin.loanservice.repository.LoanRepository;
import com.myfin.loanservice.repository.LoanTimelineRepository;
import com.myfin.loanservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final LoanTimelineRepository timelineRepository;
    private final NotificationRepository
        notificationRepository;
    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;

    private final String ACCOUNT_SERVICE =
        "http://account-service";

    // ─────────────────────────────────────────────
    // HELPER — Create HTTP headers
    // ─────────────────────────────────────────────
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        // ✅ Uses 2-arg generateToken
        String token = jwtUtil.generateToken(
            "system@myfin.com", "ADMIN");
        headers.set("Authorization",
            "Bearer " + token);
        headers.setContentType(
            MediaType.APPLICATION_JSON);
        return headers;
    }

    // ─────────────────────────────────────────────
    // HELPER — EMI calculation
    // ─────────────────────────────────────────────
    private double calculateEmi(double amount,
                                 double annualRate,
                                 int tenureMonths) {
        double R = annualRate / 12 / 100;
        return amount * R
            * Math.pow(1 + R, tenureMonths)
            / (Math.pow(1 + R, tenureMonths) - 1);
    }

    // ─────────────────────────────────────────────
    // HELPER — Save timeline event
    // ─────────────────────────────────────────────
    private void saveTimeline(Long loanId,
                               String status,
                               String description) {
        LoanTimeline timeline = LoanTimeline.builder()
                .loanId(loanId)
                .status(status)
                .description(description)
                .build();
        timelineRepository.save(timeline);
    }

    // ─────────────────────────────────────────────
    // APPLY LOAN — with all applicant details
    // ─────────────────────────────────────────────
    @Override
    public LoanResponse applyLoan(LoanRequest request) {
        double emi = calculateEmi(
            request.getAmount(),
            request.getInterestRate(),
            request.getTenure());

        Loan loan = Loan.builder()
                .userId(request.getUserId())
                .loanType(request.getLoanType())
                .amount(request.getAmount())
                .tenure(request.getTenure())
                .interestRate(request.getInterestRate())
                .emi(emi)
                .status("PENDING")
                // ✅ Applicant details
                .applicantName(
                    request.getApplicantName())
                .applicantEmail(
                    request.getApplicantEmail())
                .age(request.getAge())
                .address(request.getAddress())
                .loanPurpose(request.getLoanPurpose())
                .monthlyIncome(
                    request.getMonthlyIncome())
                .employmentType(
                    request.getEmploymentType())
                .verificationQuestion(
                    request.getVerificationQuestion())
                .verificationAnswer(
                    request.getVerificationAnswer())
                .build();

        loan = loanRepository.save(loan);

        saveTimeline(loan.getId(), "PENDING",
            "Loan application submitted by "
            + (request.getApplicantName() != null
                ? request.getApplicantName()
                : "User")
            + " for Rs." + request.getAmount());

        saveTimeline(loan.getId(), "UNDER_REVIEW",
            "Application is under review "
            + "by our team");

        Notification notification =
            Notification.builder()
                .userId(request.getUserId())
                .type("LOAN_APPLIED")
                .message("Your loan application "
                    + "of Rs." + request.getAmount()
                    + " submitted. EMI: Rs."
                    + String.format("%.2f", emi))
                .build();
        notificationRepository.save(notification);

        return mapToResponse(loan);
    }

    // ─────────────────────────────────────────────
    // GET LOANS BY USER
    // ─────────────────────────────────────────────
    @Override
    public List<LoanResponse> getLoansByUser(
            Long userId) {
        return loanRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseWithTimeline)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // GET LOAN BY ID
    // ─────────────────────────────────────────────
    @Override
    public LoanResponse getLoanById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() ->
                new LoanNotFoundException(
                    "Loan not found: " + loanId));
        return mapToResponseWithTimeline(loan);
    }

    // ─────────────────────────────────────────────
    // CANCEL LOAN
    // ─────────────────────────────────────────────
    @Override
    public void cancelLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() ->
                new LoanNotFoundException(
                    "Loan not found: " + loanId));

        if (!loan.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException(
                "Only PENDING loans can be cancelled!");
        }

        saveTimeline(loanId, "CANCELLED",
            "Loan application cancelled by user");

        loan.setStatus("CANCELLED");
        loanRepository.save(loan);
    }

    // ─────────────────────────────────────────────
    // GET ALL LOANS
    // ─────────────────────────────────────────────
    @Override
    public List<LoanResponse> getAllLoans() {
        return loanRepository.findAll()
                .stream()
                .map(this::mapToResponseWithTimeline)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // GET PENDING LOANS
    // ─────────────────────────────────────────────
    @Override
    public List<LoanResponse> getPendingLoans() {
        return loanRepository.findByStatus("PENDING")
                .stream()
                .map(this::mapToResponseWithTimeline)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // APPROVE LOAN — credits amount to account
    // ─────────────────────────────────────────────
    @Override
    public LoanResponse approveLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() ->
                new LoanNotFoundException(
                    "Loan not found: " + loanId));

        if ("APPROVED".equals(loan.getStatus())) {
            throw new IllegalArgumentException(
                "Loan is already approved!");
        }

        loan.setStatus("APPROVED");
        loanRepository.save(loan);

        saveTimeline(loanId, "APPROVED",
            "Congratulations! Loan approved. "
            + "Amount will be credited shortly.");

        // ✅ Credit loan amount to user account
        try {
            HttpEntity<String> entity =
                new HttpEntity<>(createHeaders());

            // Step 1 — Get account by userId
            ResponseEntity<AccountDTO> accountRes =
                restTemplate.exchange(
                    ACCOUNT_SERVICE
                    + "/api/accounts/"
                    + loan.getUserId(),
                    HttpMethod.GET,
                    entity,
                    AccountDTO.class);

            if (accountRes.getBody() != null) {
                Long accountId =
                    accountRes.getBody().getId();

                // Step 2 — Credit amount
                String url = ACCOUNT_SERVICE
                    + "/api/accounts/loan-credit/"
                    + accountId
                    + "?amount=" + loan.getAmount();

                restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(createHeaders()),
                    String.class);

                saveTimeline(loanId,
                    "AMOUNT_CREDITED",
                    "Rs." + loan.getAmount()
                    + " has been credited "
                    + "to your account!");

                System.out.println(
                    "✅ Loan credited: Rs."
                    + loan.getAmount()
                    + " → Account: " + accountId);
            }
        } catch (Exception e) {
            System.out.println(
                "⚠️ Credit failed: "
                + e.getMessage());
        }

        Notification notification =
            Notification.builder()
                .userId(loan.getUserId())
                .type("LOAN_APPROVED")
                .message("🎉 Your loan of Rs."
                    + loan.getAmount()
                    + " is approved! "
                    + "Amount credited to account.")
                .build();
        notificationRepository.save(notification);

        return mapToResponseWithTimeline(loan);
    }

    // ─────────────────────────────────────────────
    // DENY LOAN
    // ─────────────────────────────────────────────
    @Override
    public LoanResponse denyLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() ->
                new LoanNotFoundException(
                    "Loan not found: " + loanId));

        if ("DENIED".equals(loan.getStatus())) {
            throw new IllegalArgumentException(
                "Loan is already denied!");
        }

        loan.setStatus("DENIED");
        loanRepository.save(loan);

        saveTimeline(loanId, "DENIED",
            "Sorry, your loan request "
            + "has been denied.");

        Notification notification =
            Notification.builder()
                .userId(loan.getUserId())
                .type("LOAN_DENIED")
                .message("❌ Your loan of Rs."
                    + loan.getAmount()
                    + " has been denied.")
                .build();
        notificationRepository.save(notification);

        return mapToResponseWithTimeline(loan);
    }

    // ─────────────────────────────────────────────
    // GET TIMELINE
    // ─────────────────────────────────────────────
    @Override
    public List<LoanTimelineResponse> getLoanTimeline(
            Long loanId) {
        loanRepository.findById(loanId)
            .orElseThrow(() ->
                new LoanNotFoundException(
                    "Loan not found: " + loanId));

        return timelineRepository
            .findByLoanIdOrderByTimestampAsc(loanId)
            .stream()
            .map(this::mapTimelineToResponse)
            .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // MAP HELPERS
    // ─────────────────────────────────────────────
    private LoanResponse mapToResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .loanType(loan.getLoanType())
                .amount(loan.getAmount())
                .tenure(loan.getTenure())
                .interestRate(loan.getInterestRate())
                .emi(loan.getEmi())
                .status(loan.getStatus())
                .appliedAt(loan.getAppliedAt())
                .applicantName(
                    loan.getApplicantName())
                .applicantEmail(
                    loan.getApplicantEmail())
                .age(loan.getAge())
                .address(loan.getAddress())
                .loanPurpose(loan.getLoanPurpose())
                .monthlyIncome(
                    loan.getMonthlyIncome())
                .employmentType(
                    loan.getEmploymentType())
                .verificationQuestion(
                    loan.getVerificationQuestion())
                .verificationAnswer(
                    loan.getVerificationAnswer())
                .build();
    }

    private LoanResponse mapToResponseWithTimeline(
            Loan loan) {
        List<LoanTimelineResponse> timeline =
            timelineRepository
                .findByLoanIdOrderByTimestampAsc(
                    loan.getId())
                .stream()
                .map(this::mapTimelineToResponse)
                .collect(Collectors.toList());

        return LoanResponse.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .loanType(loan.getLoanType())
                .amount(loan.getAmount())
                .tenure(loan.getTenure())
                .interestRate(loan.getInterestRate())
                .emi(loan.getEmi())
                .status(loan.getStatus())
                .appliedAt(loan.getAppliedAt())
                .applicantName(
                    loan.getApplicantName())
                .applicantEmail(
                    loan.getApplicantEmail())
                .age(loan.getAge())
                .address(loan.getAddress())
                .loanPurpose(loan.getLoanPurpose())
                .monthlyIncome(
                    loan.getMonthlyIncome())
                .employmentType(
                    loan.getEmploymentType())
                .verificationQuestion(
                    loan.getVerificationQuestion())
                .verificationAnswer(
                    loan.getVerificationAnswer())
                .timeline(timeline)
                .build();
    }

    private LoanTimelineResponse mapTimelineToResponse(
            LoanTimeline t) {
        return LoanTimelineResponse.builder()
                .id(t.getId())
                .loanId(t.getLoanId())
                .status(t.getStatus())
                .description(t.getDescription())
                .timestamp(t.getTimestamp())
                .build();
    }
}
