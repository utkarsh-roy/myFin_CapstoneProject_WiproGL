package com.myfin.adminservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class AccountDTO {
    private Long id;
    private Long userId;
    private double balance;
    private String accountNumber;
    private boolean pinSet;          
    private LocalDateTime createdAt; 
}