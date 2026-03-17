package com.myfin.accountservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PinVerifyRequest {
    private Long accountId;
    private String pin;
    private double amount;
}