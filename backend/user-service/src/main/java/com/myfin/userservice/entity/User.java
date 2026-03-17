package com.myfin.userservice.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String role;
    private String username;
    private boolean active;

    // ✅ Login attempt tracking
    @Column(name = "failed_attempts",
        columnDefinition = "int default 0")
    private int failedAttempts = 0;

    // ✅ Account locked status
    @Column(name = "account_locked",
        columnDefinition = "boolean default false")
    private boolean accountLocked = false;

    // ✅ When account was locked
    @Column(name = "locked_at")
    private LocalDateTime lockedAt;
}
