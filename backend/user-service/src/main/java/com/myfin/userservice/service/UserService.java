package com.myfin.userservice.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.myfin.userservice.entity.User;
import com.myfin.userservice.exception.UserNotFoundException;
import com.myfin.userservice.repository.UserRepository;

@Service
public class UserService {

    @Autowired private UserRepository repo;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    private static final int MAX_ATTEMPTS = 5;

    public User register(User user) {
        User existing = repo.findByEmail(user.getEmail());
        if (existing != null) {
            throw new RuntimeException(
                "Email already registered!");
        }
        user.setActive(true);
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        return repo.save(user);
    }

    // ✅ Login with attempt tracking
    public User login(String email, String password) {
        User user = repo.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                "Invalid email or password!");
        }

        // ✅ Check if account is locked
        if (user.isAccountLocked()) {
            throw new RuntimeException(
                "ACCOUNT_LOCKED: Your account has been " +
                "locked due to too many failed attempts. " +
                "Please contact the bank to activate.");
        }

        if (!user.isActive()) {
            throw new RuntimeException(
                "ACCOUNT_DEACTIVATED: Your account has " +
                "been deactivated. " +
                "Please contact the bank.");
        }

        // ✅ Check password
        if (!passwordEncoder.matches(
                password, user.getPassword())) {

            // Increment failed attempts
            user.setFailedAttempts(
                user.getFailedAttempts() + 1);

            // Lock after MAX_ATTEMPTS
            if (user.getFailedAttempts() >= MAX_ATTEMPTS) {
                user.setAccountLocked(true);
                user.setActive(false);
                user.setLockedAt(LocalDateTime.now());
                repo.save(user);
                throw new RuntimeException(
                    "ACCOUNT_LOCKED: Too many failed " +
                    "attempts. Account locked. " +
                    "Contact bank to activate.");
            }

            int remaining = MAX_ATTEMPTS
                - user.getFailedAttempts();
            repo.save(user);
            throw new RuntimeException(
                "INVALID_PASSWORD: Wrong password. " +
                remaining + " attempts remaining.");
        }

        // ✅ Login successful - reset attempts
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        repo.save(user);
        return user;
    }

    public User getProfile(Long id) {
        return repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));
    }

    public User updateProfile(Long id, User updated) {
        User user = repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));
        // ✅ Only update username - NOT email
        user.setUsername(updated.getUsername());
        return repo.save(user);
    }

    public String changePassword(Long id,
                                  String currentPassword,
                                  String newPassword) {
        User user = repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));

        if (!passwordEncoder.matches(
                currentPassword, user.getPassword())) {
            throw new RuntimeException(
                "Current password does not match!");
        }

        user.setPassword(
            passwordEncoder.encode(newPassword));
        repo.save(user);
        return "Password updated successfully";
    }

    // ✅ Admin reset password - NOT username/email
    public String adminResetPassword(Long id,
                                      String newPassword) {
        User user = repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));
        user.setPassword(
            passwordEncoder.encode(newPassword));
        // ✅ Also unlock account when admin resets
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        repo.save(user);
        return "Password reset successfully by admin";
    }

    public boolean accountStatus(Long id) {
        return repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id)).isActive();
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ✅ Activate - also unlocks account
    public String activateUser(Long id) {
        User user = repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));
        user.setActive(true);
        user.setAccountLocked(false);
        user.setFailedAttempts(0);
        repo.save(user);
        return "User activated successfully";
    }

    public String deactivateUser(Long id) {
        User user = repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));
        user.setActive(false);
        repo.save(user);
        return "User deactivated successfully";
    }

    public String deleteUser(Long id) {
        repo.findById(id).orElseThrow(
            () -> new UserNotFoundException(
                "User not found: " + id));
        repo.deleteById(id);
        return "User deleted successfully";
    }
}