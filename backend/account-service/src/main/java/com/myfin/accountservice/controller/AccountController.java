package com.myfin.accountservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.myfin.accountservice.dto.PinRequest;
import com.myfin.accountservice.dto.TransactionLimitRequest;
import com.myfin.accountservice.dto.TransferRequest;
import com.myfin.accountservice.entity.Account;
import com.myfin.accountservice.service.AccountService;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin
public class AccountController {

    private final AccountService service;

   

    // ✅ Create account
    @PostMapping("/create")
    public ResponseEntity<?> create(
            @RequestBody Account account) {
        return ResponseEntity.ok(
            service.createAccount(account));
    }

    // ✅ Get all accounts - admin
    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(
            service.getAllAccounts());
    }

    // ✅ Get account by userId
    @GetMapping("/{userId}")
    public ResponseEntity<?> getAccount(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            service.getAccount(userId));
    }

    

    // ✅ Set PIN
    @PostMapping("/set-pin")
    public ResponseEntity<?> setPin(
            @RequestBody PinRequest request) {
        return ResponseEntity.ok(
            service.setPin(request));
    }

    // ✅ Change PIN
    @PutMapping("/change-pin/{accountId}")
    public ResponseEntity<?> changePin(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(service.changePin(
            accountId,
            request.get("oldPin"),
            request.get("newPin")));
    }

    // ✅ Admin reset PIN
    @PutMapping("/reset-pin/{accountId}")
    public ResponseEntity<?> resetPin(
            @PathVariable Long accountId) {
        return ResponseEntity.ok(
            service.resetPin(accountId));
    }

    

    // ✅ Deposit with PIN
    @PostMapping("/deposit/{id}")
    public ResponseEntity<?> deposit(
            @PathVariable Long id,
            @RequestParam double amount,
            @RequestParam String pin) {
        return ResponseEntity.ok(
            service.deposit(id, amount, pin));
    }

    // ✅ Withdraw with PIN
    @PostMapping("/withdraw/{id}")
    public ResponseEntity<?> withdraw(
            @PathVariable Long id,
            @RequestParam double amount,
            @RequestParam String pin) {
        return ResponseEntity.ok(
            service.withdraw(id, amount, pin));
    }

    // ✅ Transfer with account NUMBER
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @RequestBody TransferRequest req) {
        return ResponseEntity.ok(
            service.transfer(req));
    }

    // ✅ Loan credit - no PIN - system operation
    @PostMapping("/loan-credit/{id}")
    public ResponseEntity<?> loanCredit(
            @PathVariable Long id,
            @RequestParam double amount) {
        return ResponseEntity.ok(
            service.loanCredit(id, amount));
    }

    

    // ✅ All transactions
    @GetMapping("/transactions/all")
    public ResponseEntity<?> getAllTransactions() {
        return ResponseEntity.ok(
            service.getTransactions());
    }

    // ✅ Transactions by accountId
    @GetMapping("/transactions/{accountId}")
    public ResponseEntity<?> getTransactionsByAccount(
            @PathVariable Long accountId) {
        return ResponseEntity.ok(
            service.getTransactionsByAccount(
                accountId));
    }

    // ✅ Mini Statement - last 5
    @GetMapping("/mini-statement/{accountId}")
    public ResponseEntity<?> getMiniStatement(
            @PathVariable Long accountId) {
        return ResponseEntity.ok(
            service.getMiniStatement(accountId));
    }

    

    // ✅ Set limit - FIRST (most specific)
    @PostMapping("/limits/set")
    public ResponseEntity<?> setLimit(
            @RequestBody
                TransactionLimitRequest request) {
        return ResponseEntity.ok(
            service.setLimit(request));
    }

    // ✅ Global limits - SECOND
   
    @GetMapping("/limits/global")
    public ResponseEntity<?> getGlobalLimits() {
        return ResponseEntity.ok(
            service.getLimitForUser(null));
    }

    // ✅ User specific limits - LAST
 
    @GetMapping("/limits/{userId}")
    public ResponseEntity<?> getLimits(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            service.getLimitForUser(userId));
    }
}
