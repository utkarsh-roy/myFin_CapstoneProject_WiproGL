package com.myfin.accountservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_limits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Per user limit OR global (userId = null = global)
    private Long userId;

    @Column(name = "max_deposit")
    private Double maxDeposit = 100000.0;

    @Column(name = "max_withdrawal")
    private Double maxWithdrawal = 50000.0;

    @Column(name = "max_transfer")
    private Double maxTransfer = 25000.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
