package com.myfin.adminservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionLimitRequest {

    // null = global limit
    // userId = user specific limit
    private Long userId;

    private Double maxDeposit;
    private Double maxWithdrawal;
    private Double maxTransfer;

    // Which admin set this limit
    private String updatedBy;
}