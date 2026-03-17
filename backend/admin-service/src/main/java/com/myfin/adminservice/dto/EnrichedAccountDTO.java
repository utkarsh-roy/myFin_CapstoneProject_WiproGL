package com.myfin.adminservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrichedAccountDTO {
    // Account details
    private Long accountId;
    private String accountNumber;
    private Double balance;
    private LocalDateTime createdAt;
    private boolean pinSet;

    // ✅ User details fetched from user-service
    private Long userId;
    private String username;
    private String email;
    private boolean userActive;
}