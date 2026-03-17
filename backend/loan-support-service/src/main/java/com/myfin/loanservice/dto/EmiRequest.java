package com.myfin.loanservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmiRequest {
    private Double amount;
    private Double interestRate;
    private Integer tenure;
}