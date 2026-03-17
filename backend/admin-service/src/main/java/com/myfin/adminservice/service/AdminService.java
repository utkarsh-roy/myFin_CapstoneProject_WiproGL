package com.myfin.adminservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.myfin.adminservice.config.JwtUtil;
import com.myfin.adminservice.dto.*;
import com.myfin.adminservice.entity.Admin;
import com.myfin.adminservice.entity.AuditLog;
import com.myfin.adminservice.exception.AdminNotFoundException;
import com.myfin.adminservice.repository.AdminRepository;
import com.myfin.adminservice.repository.AuditLogRepository;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository repo;
    private final AuditLogRepository auditLogRepo;
    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    private final String USER_SERVICE =
        "http://user-service";
    private final String ACCOUNT_SERVICE =
        "http://account-service";
    private final String LOAN_SERVICE =
        "http://loan-support-service";

   
    private HttpEntity<String> createEntity() {
        HttpHeaders headers = new HttpHeaders();
        String token = jwtUtil.generateToken(
            "admin@myfin.com", "ADMIN", 0L);
        headers.set("Authorization",
            "Bearer " + token);
        headers.setContentType(
            MediaType.APPLICATION_JSON);
        return new HttpEntity<>(headers);
    }

  
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String token = jwtUtil.generateToken(
            "admin@myfin.com", "ADMIN", 0L);
        headers.set("Authorization",
            "Bearer " + token);
        headers.setContentType(
            MediaType.APPLICATION_JSON);
        return headers;
    }


    private void saveAuditLog(Admin admin,
                               String action,
                               String targetType,
                               Long targetId,
                               String details) {
        AuditLog log = AuditLog.builder()
                .adminId(admin.getId())
                .adminEmail(admin.getEmail())
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepo.save(log);
    }

  
    private Admin getAdminFromToken(String token) {
        String email = jwtUtil.extractEmail(token);
        Admin admin = repo.findByEmail(email);
        if (admin == null) {
            throw new AdminNotFoundException(
                "Admin not found: " + email);
        }
        return admin;
    }

   
    public Admin register(
            AdminRegisterRequest request) {
        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(
            request.getPassword()));
        admin.setSecretCode(passwordEncoder.encode(
            request.getSecretCode()));
        admin.setRole("ADMIN");
        return repo.save(admin);
    }

   
    public AuthResponse login(
            AdminLoginRequest request) {
        Admin dbAdmin = repo.findByEmail(
            request.getEmail());

        if (dbAdmin != null
                && request.getSecretCode() != null
                && passwordEncoder.matches(
                    request.getPassword(),
                    dbAdmin.getPassword())
                && passwordEncoder.matches(
                    request.getSecretCode(),
                    dbAdmin.getSecretCode())) {

            String token = jwtUtil.generateToken(
                dbAdmin.getEmail(),
                "ADMIN",
                dbAdmin.getId());

            saveAuditLog(
                dbAdmin,
                "ADMIN_LOGIN",
                "ADMIN",
                dbAdmin.getId(),
                "Admin logged in successfully: "
                + dbAdmin.getEmail());

            return new AuthResponse(
                token,
                dbAdmin.getId(),
                dbAdmin.getEmail(),
                "ADMIN",
                dbAdmin.getName());
        }
        throw new AdminNotFoundException(
            "Invalid credentials or secret code!");
    }

    
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepo
            .findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getAuditLogsByAdmin(
            Long adminId) {
        return auditLogRepo
            .findByAdminIdOrderByTimestampDesc(
                adminId);
    }

   
    public List<UserDTO> getAllUsers() {
        ResponseEntity<UserDTO[]> response =
            restTemplate.exchange(
                USER_SERVICE + "/api/users/all",
                HttpMethod.GET,
                createEntity(),
                UserDTO[].class);
        return Arrays.asList(response.getBody());
    }

    public UserDTO getUser(Long id) {
        ResponseEntity<UserDTO> response =
            restTemplate.exchange(
                USER_SERVICE
                + "/api/users/profile/" + id,
                HttpMethod.GET,
                createEntity(),
                UserDTO.class);
        return response.getBody();
    }

    public String activateUser(Long id,
                                String token) {
        restTemplate.exchange(
            USER_SERVICE
            + "/api/users/activate/" + id,
            HttpMethod.PUT,
            createEntity(),
            String.class);
        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "USER_ACTIVATED", "USER", id,
            "User ID " + id + " activated"
            + " | By: " + admin.getEmail());
        return "User activated successfully";
    }

    public String deactivateUser(Long id,
                                  String token) {
        restTemplate.exchange(
            USER_SERVICE
            + "/api/users/deactivate/" + id,
            HttpMethod.PUT,
            createEntity(),
            String.class);
        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "USER_DEACTIVATED", "USER", id,
            "User ID " + id + " deactivated"
            + " | By: " + admin.getEmail());
        return "User deactivated successfully";
    }

    public String deleteUser(Long id,
                              String token) {
        restTemplate.exchange(
            USER_SERVICE + "/api/users/" + id,
            HttpMethod.DELETE,
            createEntity(),
            String.class);
        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "USER_DELETED", "USER", id,
            "User ID " + id
            + " permanently deleted"
            + " | By: " + admin.getEmail());
        return "User deleted successfully";
    }

    // ✅ Admin reset user password only
    // Cannot change username or email
    public String resetUserPassword(Long userId,
                                     String newPassword,
                                     String token) {
        Map<String, String> body = new HashMap<>();
        body.put("newPassword", newPassword);

        // ✅ Explicit type - no generic issue
        HttpEntity<Map<String, String>> entity =
            new HttpEntity<>(body, createHeaders());

        restTemplate.exchange(
            USER_SERVICE
            + "/api/users/admin-reset-password/"
            + userId,
            HttpMethod.PUT,
            entity,
            String.class);

        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "PASSWORD_RESET", "USER", userId,
            "Password reset for user ID: "
            + userId
            + " | By: " + admin.getEmail());
        return "Password reset successfully";
    }

    

    // ✅ Returns enriched accounts with
    // username + email from user-service
    public List<EnrichedAccountDTO>
            getAllAccountsEnriched() {
        ResponseEntity<AccountDTO[]> response =
            restTemplate.exchange(
                ACCOUNT_SERVICE
                + "/api/accounts/all",
                HttpMethod.GET,
                createEntity(),
                AccountDTO[].class);

        List<AccountDTO> accounts = Arrays.asList(
            response.getBody());

        return accounts.stream().map(account -> {
            EnrichedAccountDTO enriched =
                new EnrichedAccountDTO();
            enriched.setAccountId(
                account.getId());
            enriched.setAccountNumber(
                account.getAccountNumber());
            enriched.setBalance(
                account.getBalance());
            enriched.setCreatedAt(
                account.getCreatedAt());
            enriched.setPinSet(
                account.isPinSet());
            enriched.setUserId(
                account.getUserId());

            // ✅ Fetch username + email
            try {
                ResponseEntity<UserDTO> userRes =
                    restTemplate.exchange(
                        USER_SERVICE
                        + "/api/users/profile/"
                        + account.getUserId(),
                        HttpMethod.GET,
                        createEntity(),
                        UserDTO.class);

                if (userRes.getBody() != null) {
                    enriched.setUsername(
                        userRes.getBody()
                            .getUsername());
                    enriched.setEmail(
                        userRes.getBody()
                            .getEmail());
                    enriched.setUserActive(
                        userRes.getBody()
                            .isActive());
                }
            } catch (Exception e) {
                enriched.setUsername("Unknown");
                enriched.setEmail("Unknown");
                enriched.setUserActive(false);
            }
            return enriched;
        }).collect(Collectors.toList());
    }

    public AccountDTO getAccount(Long userId) {
        ResponseEntity<AccountDTO> response =
            restTemplate.exchange(
                ACCOUNT_SERVICE
                + "/api/accounts/" + userId,
                HttpMethod.GET,
                createEntity(),
                AccountDTO.class);
        return response.getBody();
    }

    public String resetUserPin(Long accountId,
                                String token) {
        restTemplate.exchange(
            ACCOUNT_SERVICE
            + "/api/accounts/reset-pin/"
            + accountId,
            HttpMethod.PUT,
            createEntity(),
            String.class);
        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "PIN_RESET", "ACCOUNT", accountId,
            "PIN reset for account ID: "
            + accountId
            + " | By: " + admin.getEmail());
        return "PIN reset successfully";
    }

    // ✅ Set transaction limit
    public Object setTransactionLimit(
            TransactionLimitRequest request,
            String token) {

        // ✅ Explicit type - fixes red line
        HttpEntity<TransactionLimitRequest> entity =
            new HttpEntity<>(request,
                createHeaders());

        ResponseEntity<Object> response =
            restTemplate.exchange(
                ACCOUNT_SERVICE
                + "/api/accounts/limits/set",
                HttpMethod.POST,
                entity,
                Object.class);

        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "LIMIT_UPDATED",
            "ACCOUNT",
            request.getUserId() != null
                ? request.getUserId() : 0L,
            "Transaction limits updated → "
            + "Deposit: Rs."
            + request.getMaxDeposit()
            + " | Withdrawal: Rs."
            + request.getMaxWithdrawal()
            + " | Transfer: Rs."
            + request.getMaxTransfer()
            + " | Scope: "
            + (request.getUserId() != null
                ? "User " + request.getUserId()
                : "Global")
            + " | By: " + admin.getEmail());

        return response.getBody();
    }

    // ✅ Get transaction limits
    public Object getTransactionLimits(
            Long userId) {
        String url = (userId != null)
            ? ACCOUNT_SERVICE
              + "/api/accounts/limits/"
              + userId
            : ACCOUNT_SERVICE
              + "/api/accounts/limits/global";

        ResponseEntity<Object> response =
            restTemplate.exchange(
                url,
                HttpMethod.GET,
                createEntity(),
                Object.class);
        return response.getBody();
    }

    // ─────────────────────────────────────────────
    // LOAN SERVICE CALLS
    // ─────────────────────────────────────────────
    public List<LoanDTO> getLoans() {
        ResponseEntity<LoanDTO[]> response =
            restTemplate.exchange(
                LOAN_SERVICE + "/api/loans/all",
                HttpMethod.GET,
                createEntity(),
                LoanDTO[].class);
        return Arrays.asList(response.getBody());
    }

    public List<LoanDTO> getPendingLoans() {
        ResponseEntity<LoanDTO[]> response =
            restTemplate.exchange(
                LOAN_SERVICE
                + "/api/loans/pending",
                HttpMethod.GET,
                createEntity(),
                LoanDTO[].class);
        return Arrays.asList(response.getBody());
    }

    public String approveLoan(Long id,
                               String token) {
        restTemplate.exchange(
            LOAN_SERVICE
            + "/api/loans/approve/" + id,
            HttpMethod.PUT,
            createEntity(),
            String.class);
        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "LOAN_APPROVED", "LOAN", id,
            "Loan ID " + id + " approved"
            + " | By: " + admin.getEmail());
        return "Loan approved successfully";
    }

    public String denyLoan(Long id,
                            String token) {
        restTemplate.exchange(
            LOAN_SERVICE
            + "/api/loans/deny/" + id,
            HttpMethod.PUT,
            createEntity(),
            String.class);
        Admin admin = getAdminFromToken(token);
        saveAuditLog(admin,
            "LOAN_DENIED", "LOAN", id,
            "Loan ID " + id + " denied"
            + " | By: " + admin.getEmail());
        return "Loan denied successfully";
    }
}