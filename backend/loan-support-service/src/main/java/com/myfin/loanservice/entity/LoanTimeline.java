package com.myfin.loanservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_id")
    private Long loanId;

    // Status at this point
    private String status;

    // Description of what happened
    @Column(columnDefinition = "TEXT")
    private String description;

    // When this status happened
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}