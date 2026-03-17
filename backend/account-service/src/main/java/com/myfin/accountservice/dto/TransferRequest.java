package com.myfin.accountservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TransferRequest {
    private Long fromAccountId;

    private String toAccountNumber;

    private double amount;
    private String pin;
}