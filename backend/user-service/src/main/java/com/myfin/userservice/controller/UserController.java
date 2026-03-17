package com.myfin.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.myfin.userservice.entity.User;
import com.myfin.userservice.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired private UserService service;

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> profile(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            service.getProfile(id));
    }

    // ✅ Update only username - NOT email
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody User user) {
        return ResponseEntity.ok(
            service.updateProfile(id, user));
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(service.changePassword(
            id,
            request.get("currentPassword"),
            request.get("newPassword")));
    }

    // ✅ Admin reset password endpoint
    @PutMapping("/admin-reset-password/{id}")
    public ResponseEntity<?> adminResetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
            service.adminResetPassword(
                id, request.get("newPassword")));
    }

    @GetMapping("/account-status/{id}")
    public ResponseEntity<?> accountStatus(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            service.accountStatus(id));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @PutMapping("/activate/{id}")
    public ResponseEntity<?> activateUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            service.activateUser(id));
    }

    @PutMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            service.deactivateUser(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            service.deleteUser(id));
    }
}
