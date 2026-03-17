package com.myfin.loanservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AccountDTO {
    private Long id;
    private Long userId;
    private double balance;
    private String accountNumber;
}