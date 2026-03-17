package com.myfin.loanservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmiResponse {

    private Double emi;
    private Double totalAmount;
    private Double totalInterest;

}
