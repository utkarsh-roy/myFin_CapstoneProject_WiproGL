package com.myfin.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.myfin.userservice.config.JwtUtil;
import com.myfin.userservice.dto.*;
import com.myfin.userservice.entity.User;
import com.myfin.userservice.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserService service;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "USER");
        service.register(user);
        return ResponseEntity.ok("User registered successfully");
    }

    // Login - returns full user details
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = service.login(request.getEmail(), request.getPassword());
        if (user != null) {
            // ✅ Generate token with userId
            String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getId()
            );
            // ✅ Return full response
            AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getUsername()
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Invalid Credentials");
    }

    // Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}