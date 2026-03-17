package com.myfin.adminservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import com.myfin.adminservice.dto.*;
import com.myfin.adminservice.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin
public class AdminController {

    private final AdminService service;

    // ─────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody AdminRegisterRequest request) {
        return ResponseEntity.ok(
            service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(
            service.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(
            "Admin logged out successfully");
    }

    // ─────────────────────────────────────────────
    // AUDIT LOGS
    // ─────────────────────────────────────────────
    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs() {
        return ResponseEntity.ok(
            service.getAllAuditLogs());
    }

    @GetMapping("/logs/{adminId}")
    public ResponseEntity<?> getLogsByAdmin(
            @PathVariable Long adminId) {
        return ResponseEntity.ok(
            service.getAuditLogsByAdmin(adminId));
    }

    // ─────────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────────
    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(
            service.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            service.getUser(id));
    }

    @PutMapping("/users/activate/{id}")
    public ResponseEntity<?> activateUser(
            @PathVariable Long id,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.activateUser(
                id, authHeader.substring(7)));
    }

    @PutMapping("/users/deactivate/{id}")
    public ResponseEntity<?> deactivateUser(
            @PathVariable Long id,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.deactivateUser(
                id, authHeader.substring(7)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.deleteUser(
                id, authHeader.substring(7)));
    }

    // ✅ Admin reset user password only
    // Cannot change username or email
    @PutMapping("/users/reset-password/{userId}")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.resetUserPassword(
                userId,
                request.get("newPassword"),
                authHeader.substring(7)));
    }

    // ─────────────────────────────────────────────
    // ACCOUNT MANAGEMENT
    // ─────────────────────────────────────────────

    // ✅ Returns enriched data with username + email
    @GetMapping("/accounts/all")
    public ResponseEntity<?> getAllAccounts() {
        return ResponseEntity.ok(
            service.getAllAccountsEnriched());
    }

    @GetMapping("/accounts/{userId}")
    public ResponseEntity<?> getAccount(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            service.getAccount(userId));
    }

    @PutMapping("/accounts/reset-pin/{accountId}")
    public ResponseEntity<?> resetUserPin(
            @PathVariable Long accountId,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.resetUserPin(
                accountId,
                authHeader.substring(7)));
    }

    // ─────────────────────────────────────────────
    // TRANSACTION LIMITS
    // ─────────────────────────────────────────────

    // ✅ Set limits (global or per user)
    @PostMapping("/accounts/limits/set")
    public ResponseEntity<?> setTransactionLimit(
            @RequestBody
                TransactionLimitRequest request,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.setTransactionLimit(
                request,
                authHeader.substring(7)));
    }

    // ✅ MUST be before /user/{userId}
    // to avoid Spring URL conflict
    @GetMapping("/accounts/limits/global")
    public ResponseEntity<?> getGlobalLimits() {
        return ResponseEntity.ok(
            service.getTransactionLimits(null));
    }

    // ✅ Get limits for specific user
    @GetMapping("/accounts/limits/user/{userId}")
    public ResponseEntity<?> getLimitsForUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            service.getTransactionLimits(userId));
    }

    // ─────────────────────────────────────────────
    // LOAN MANAGEMENT
    // ─────────────────────────────────────────────
    @GetMapping("/loans/all")
    public ResponseEntity<?> getAllLoans() {
        return ResponseEntity.ok(
            service.getLoans());
    }

    @GetMapping("/loans/pending")
    public ResponseEntity<?> getPendingLoans() {
        return ResponseEntity.ok(
            service.getPendingLoans());
    }

    @PutMapping("/loans/approve/{id}")
    public ResponseEntity<?> approveLoan(
            @PathVariable Long id,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.approveLoan(
                id, authHeader.substring(7)));
    }

    @PutMapping("/loans/deny/{id}")
    public ResponseEntity<?> denyLoan(
            @PathVariable Long id,
            @RequestHeader("Authorization")
                String authHeader) {
        return ResponseEntity.ok(
            service.denyLoan(
                id, authHeader.substring(7)));
    }
}