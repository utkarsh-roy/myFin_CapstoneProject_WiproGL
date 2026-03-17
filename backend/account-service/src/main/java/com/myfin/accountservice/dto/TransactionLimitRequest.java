package com.myfin.accountservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TransactionLimitRequest {
    private Long userId;        
    private Double maxDeposit;
    private Double maxWithdrawal;
    private Double maxTransfer;
    private String updatedBy;   
}