package com.myfin.adminservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which admin did the action
    private Long adminId;
    private String adminEmail;

    // What action was done
    private String action;

    // On what target
    private String targetType; // USER / LOAN / ACCOUNT
    private Long targetId;

    // Details of action
    @Column(columnDefinition = "TEXT")
    private String details;

    // When it happened
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}