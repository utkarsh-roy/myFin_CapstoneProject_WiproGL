package com.myfin.loanservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.myfin.loanservice.dto.LoanRequest;
import com.myfin.loanservice.dto.LoanResponse;
import com.myfin.loanservice.service.LoanService;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@CrossOrigin
public class LoanController {

    private final LoanService loanService;

    // ✅ Apply loan
    @PostMapping("/apply")
    public ResponseEntity<LoanResponse> applyLoan(
            @RequestBody LoanRequest request) {
        return ResponseEntity.ok(loanService.applyLoan(request));
    }

    // ✅ Get user loans
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<LoanResponse>> getUserLoans(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            loanService.getLoansByUser(userId));
    }

    // ✅ Get loan by id with timeline
    @GetMapping("/{loanId}")
    public ResponseEntity<LoanResponse> getLoan(
            @PathVariable Long loanId) {
        return ResponseEntity.ok(
            loanService.getLoanById(loanId));
    }

    // ✅ Get timeline for loan
    @GetMapping("/{loanId}/timeline")
    public ResponseEntity<?> getLoanTimeline(
            @PathVariable Long loanId) {
        return ResponseEntity.ok(
            loanService.getLoanTimeline(loanId));
    }

    // ✅ Cancel loan
    @DeleteMapping("/cancel/{loanId}")
    public ResponseEntity<String> cancelLoan(
            @PathVariable Long loanId) {
        loanService.cancelLoan(loanId);
        return ResponseEntity.ok("Loan cancelled successfully");
    }

    // ✅ Admin - Get all loans
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    // ✅ Admin - Get pending loans
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<LoanResponse>> getPendingLoans() {
        return ResponseEntity.ok(loanService.getPendingLoans());
    }

    // ✅ Admin - Approve loan
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/approve/{id}")
    public ResponseEntity<LoanResponse> approveLoan(
            @PathVariable Long id) {
        return ResponseEntity.ok(loanService.approveLoan(id));
    }

    // ✅ Admin - Deny loan
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/deny/{id}")
    public ResponseEntity<LoanResponse> denyLoan(
            @PathVariable Long id) {
        return ResponseEntity.ok(loanService.denyLoan(id));
    }
}
