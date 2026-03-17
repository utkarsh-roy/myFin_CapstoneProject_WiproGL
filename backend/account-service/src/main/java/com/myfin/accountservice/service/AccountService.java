package com.myfin.accountservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myfin.accountservice.dto.PinRequest;
import com.myfin.accountservice.dto.TransactionLimitRequest;
import com.myfin.accountservice.dto.TransferRequest;
import com.myfin.accountservice.entity.Account;
import com.myfin.accountservice.entity.Transaction;
import com.myfin.accountservice.entity.TransactionLimit;
import com.myfin.accountservice.exception.AccountNotFoundException;
import com.myfin.accountservice.repository.AccountRepository;
import com.myfin.accountservice.repository.TransactionLimitRepository;
import com.myfin.accountservice.repository.TransactionRepository;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepo;

    @Autowired
    private TransactionRepository transactionRepo;

    @Autowired
    private TransactionLimitRepository limitRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

  
    private TransactionLimit getLimit(Long userId) {
        // 1. User-specific limit
        Optional<TransactionLimit> userLimit =
            limitRepo.findByUserId(userId);
        if (userLimit.isPresent()) {
            return userLimit.get();
        }
        // 2. Global limit
        Optional<TransactionLimit> globalLimit =
            limitRepo.findByUserIdIsNull();
        if (globalLimit.isPresent()) {
            return globalLimit.get();
        }
        // 3. Default limits
        TransactionLimit def = new TransactionLimit();
        def.setMaxDeposit(100000.0);
        def.setMaxWithdrawal(50000.0);
        def.setMaxTransfer(25000.0);
        return def;
    }

    
    private void verifyPin(Account acc, String pin) {
        if (!acc.isPinSet()) {
            throw new RuntimeException(
                "PIN not set! Please set your PIN first.");
        }
        if (pin == null || pin.trim().isEmpty()) {
            throw new RuntimeException("PIN is required!");
        }
        if (!pin.matches("\\d{4}")) {
            throw new RuntimeException(
                "PIN must be 4 digits!");
        }
        if (!passwordEncoder.matches(pin, acc.getPin())) {
            throw new RuntimeException("Incorrect PIN!");
        }
    }

    
    @Transactional
    public Account createAccount(Account account) {
        Account existing = accountRepo.findByUserId(
            account.getUserId());
        if (existing != null) {
            throw new RuntimeException(
                "Account already exists for this user!");
        }
        account.setBalance(0.0);
        account.setPinSet(false);
        String accountNumber = "MYFIN"
            + String.format("%010d",
                System.currentTimeMillis()
                % 10000000000L);
        account.setAccountNumber(accountNumber);
        return accountRepo.save(account);
    }

   
    @Transactional
    public String setPin(PinRequest request) {
        Account acc = accountRepo
            .findById(request.getAccountId())
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Account not found: "
                    + request.getAccountId()));

        if (acc.isPinSet()) {
            throw new RuntimeException(
                "PIN already set! Use change PIN option.");
        }
        if (request.getPin() == null
                || !request.getPin().matches("\\d{4}")) {
            throw new RuntimeException(
                "PIN must be exactly 4 digits!");
        }
        acc.setPin(
            passwordEncoder.encode(request.getPin()));
        acc.setPinSet(true);
        accountRepo.save(acc);
        return "PIN set successfully!";
    }

    // ─────────────────────────────────────────────
    // CHANGE PIN
    // ─────────────────────────────────────────────
    @Transactional
    public String changePin(Long accountId,
                             String oldPin,
                             String newPin) {
        Account acc = accountRepo.findById(accountId)
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Account not found: " + accountId));

        if (!acc.isPinSet()) {
            throw new RuntimeException("No PIN set yet!");
        }
        if (!passwordEncoder.matches(
                oldPin, acc.getPin())) {
            throw new RuntimeException(
                "Current PIN is incorrect!");
        }
        if (newPin == null
                || !newPin.matches("\\d{4}")) {
            throw new RuntimeException(
                "New PIN must be 4 digits!");
        }
        acc.setPin(passwordEncoder.encode(newPin));
        accountRepo.save(acc);
        return "PIN changed successfully!";
    }

    // ─────────────────────────────────────────────
    // ADMIN RESET PIN
    // ─────────────────────────────────────────────
    @Transactional
    public String resetPin(Long accountId) {
        Account acc = accountRepo.findById(accountId)
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Account not found: " + accountId));
        acc.setPin(null);
        acc.setPinSet(false);
        accountRepo.save(acc);
        return "PIN reset! User can set a new PIN.";
    }

    // ─────────────────────────────────────────────
    // DEPOSIT — requires PIN + limit check
    // ─────────────────────────────────────────────
    @Transactional
    public Account deposit(Long id,
                            double amount,
                            String pin) {
        if (amount <= 0) {
            throw new RuntimeException(
                "Deposit amount must be positive!");
        }

        Account acc = accountRepo.findById(id)
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Account not found: " + id));

        // ✅ Check limit
        TransactionLimit limit =
            getLimit(acc.getUserId());
        if (amount > limit.getMaxDeposit()) {
            throw new RuntimeException(
                "Deposit amount Rs." + amount
                + " exceeds maximum limit of Rs."
                + limit.getMaxDeposit());
        }

        verifyPin(acc, pin);

        acc.setBalance(acc.getBalance() + amount);

        Transaction t = new Transaction();
        t.setFromAccount(id);
        t.setAmount(amount);
        t.setType("DEPOSIT");
        t.setTransactionId(
            UUID.randomUUID().toString());
        t.setTimestamp(LocalDateTime.now());
        transactionRepo.save(t);

        return accountRepo.save(acc);
    }

    // ─────────────────────────────────────────────
    // WITHDRAW — requires PIN + limit check
    // ─────────────────────────────────────────────
    @Transactional
    public Account withdraw(Long id,
                             double amount,
                             String pin) {
        if (amount <= 0) {
            throw new RuntimeException(
                "Withdrawal amount must be positive!");
        }

        Account acc = accountRepo.findById(id)
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Account not found: " + id));

        // ✅ Check limit
        TransactionLimit limit =
            getLimit(acc.getUserId());
        if (amount > limit.getMaxWithdrawal()) {
            throw new RuntimeException(
                "Withdrawal amount Rs." + amount
                + " exceeds maximum limit of Rs."
                + limit.getMaxWithdrawal());
        }

        verifyPin(acc, pin);

        if (acc.getBalance() < amount) {
            throw new RuntimeException(
                "Insufficient balance!");
        }

        acc.setBalance(acc.getBalance() - amount);

        Transaction t = new Transaction();
        t.setFromAccount(id);
        t.setAmount(amount);
        t.setType("WITHDRAW");
        t.setTransactionId(
            UUID.randomUUID().toString());
        t.setTimestamp(LocalDateTime.now());
        transactionRepo.save(t);

        return accountRepo.save(acc);
    }

    // ─────────────────────────────────────────────
    // TRANSFER — requires PIN + limit check
    // ─────────────────────────────────────────────
    @Transactional
    public Transaction transfer(TransferRequest req) {
        if (req.getAmount() <= 0) {
            throw new RuntimeException(
                "Transfer amount must be positive!");
        }
        if (req.getToAccountNumber() == null
                || req.getToAccountNumber()
                      .trim().isEmpty()) {
            throw new RuntimeException(
                "Destination account number is required!");
        }

        Account from = accountRepo
            .findById(req.getFromAccountId())
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Source account not found!"));

        // ✅ Check limit
        TransactionLimit limit =
            getLimit(from.getUserId());
        if (req.getAmount() > limit.getMaxTransfer()) {
            throw new RuntimeException(
                "Transfer amount Rs." + req.getAmount()
                + " exceeds maximum limit of Rs."
                + limit.getMaxTransfer());
        }

        Account to = accountRepo.findByAccountNumber(
            req.getToAccountNumber()
               .trim().toUpperCase());

        if (to == null) {
            throw new AccountNotFoundException(
                "Destination account not found! "
                + "Check account number: "
                + req.getToAccountNumber());
        }
        if (from.getId().equals(to.getId())) {
            throw new RuntimeException(
                "Cannot transfer to your own account!");
        }

        verifyPin(from, req.getPin());

        if (from.getBalance() < req.getAmount()) {
            throw new RuntimeException(
                "Insufficient balance!");
        }

        from.setBalance(
            from.getBalance() - req.getAmount());
        to.setBalance(
            to.getBalance() + req.getAmount());

        accountRepo.save(from);
        accountRepo.save(to);

        Transaction t = new Transaction();
        t.setFromAccount(from.getId());
        t.setToAccount(to.getId());
        t.setAmount(req.getAmount());
        t.setType("TRANSFER");
        t.setTransactionId(
            UUID.randomUUID().toString());
        t.setTimestamp(LocalDateTime.now());
        return transactionRepo.save(t);
    }

    // ─────────────────────────────────────────────
    // LOAN CREDIT — no PIN, system operation
    // ─────────────────────────────────────────────
    @Transactional
    public Account loanCredit(Long accountId,
                               double amount) {
        if (amount <= 0) {
            throw new RuntimeException(
                "Amount must be positive!");
        }
        Account acc = accountRepo.findById(accountId)
            .orElseThrow(() ->
                new AccountNotFoundException(
                    "Account not found: " + accountId));

        acc.setBalance(acc.getBalance() + amount);

        Transaction t = new Transaction();
        t.setFromAccount(accountId);
        t.setAmount(amount);
        t.setType("LOAN_CREDIT");
        t.setTransactionId(
            UUID.randomUUID().toString());
        t.setTimestamp(LocalDateTime.now());
        transactionRepo.save(t);

        return accountRepo.save(acc);
    }

    // ─────────────────────────────────────────────
    // SET TRANSACTION LIMIT — admin operation
    // ─────────────────────────────────────────────
    @Transactional
    public TransactionLimit setLimit(
            TransactionLimitRequest request) {
        TransactionLimit limit;

        if (request.getUserId() != null) {
            // User-specific limit
            limit = limitRepo
                .findByUserId(request.getUserId())
                .orElse(new TransactionLimit());
            limit.setUserId(request.getUserId());
        } else {
            // Global limit
            limit = limitRepo
                .findByUserIdIsNull()
                .orElse(new TransactionLimit());
        }

        if (request.getMaxDeposit() != null) {
            limit.setMaxDeposit(
                request.getMaxDeposit());
        }
        if (request.getMaxWithdrawal() != null) {
            limit.setMaxWithdrawal(
                request.getMaxWithdrawal());
        }
        if (request.getMaxTransfer() != null) {
            limit.setMaxTransfer(
                request.getMaxTransfer());
        }
        if (request.getUpdatedBy() != null) {
            limit.setUpdatedBy(request.getUpdatedBy());
        }

        return limitRepo.save(limit);
    }

    // ─────────────────────────────────────────────
    // GET LIMITS FOR USER
    // ─────────────────────────────────────────────
    public TransactionLimit getLimitForUser(
            Long userId) {
        return getLimit(userId);
    }

    // ─────────────────────────────────────────────
    // GET ALL ACCOUNTS
    // ─────────────────────────────────────────────
    public List<Account> getAllAccounts() {
        return accountRepo.findAll();
    }

    // ─────────────────────────────────────────────
    // GET ACCOUNT BY USER ID
    // ─────────────────────────────────────────────
    public Account getAccount(Long userId) {
        Account acc = accountRepo.findByUserId(userId);
        if (acc == null) {
            throw new AccountNotFoundException(
                "Account not found for user: " + userId);
        }
        return acc;
    }

    // ─────────────────────────────────────────────
    // GET ALL TRANSACTIONS
    // ─────────────────────────────────────────────
    public List<Transaction> getTransactions() {
        return transactionRepo.findAll();
    }

    // ─────────────────────────────────────────────
    // GET TRANSACTIONS BY ACCOUNT
    // ─────────────────────────────────────────────
    public List<Transaction> getTransactionsByAccount(
            Long accountId) {
        return transactionRepo
            .findByFromAccountOrToAccount(
                accountId, accountId);
    }

    // ─────────────────────────────────────────────
    // MINI STATEMENT — last 5 transactions
    // ─────────────────────────────────────────────
 // ✅ Correct - method name on ONE line
    public List<Transaction> getMiniStatement(
            Long accountId) {
        return transactionRepo
            .findTop5ByFromAccountOrToAccountOrderByTimestampDesc(
                accountId, accountId);
    }

    // ─────────────────────────────────────────────
    // INVESTMENT DEDUCTION
    // ─────────────────────────────────────────────
    @Transactional
    public void deductForInvestment(Long userId, double amount) {
        System.out.println(">>> ACCOUNT SERVICE: Checking balance for user " + userId + " to deduct " + amount);
        Account acc = accountRepo.findByUserId(userId);
        if (acc == null) {
            throw new AccountNotFoundException("Active bank account not found for user: " + userId);
        }
        
        if (acc.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance! You need Rs." + amount + " but have Rs." + acc.getBalance());
        }

        acc.setBalance(acc.getBalance() - amount);
        accountRepo.save(acc);

        Transaction t = new Transaction();
        t.setFromAccount(acc.getId());
        t.setAmount(amount);
        t.setType("INVESTMENT");
        t.setTransactionId(UUID.randomUUID().toString());
        t.setTimestamp(LocalDateTime.now());
        transactionRepo.save(t);
    }
}
