package com.myfin.loanservice.service;

import org.springframework.stereotype.Service;

import com.myfin.loanservice.dto.EmiRequest;
import com.myfin.loanservice.dto.EmiResponse;

@Service
public class EmiServiceImpl implements EmiService {

    @Override
    public EmiResponse calculateEmi(EmiRequest request) {

        double principal = request.getAmount();
        double annualRate = request.getInterestRate();
        int tenureMonths = request.getTenure();

       
        double R = annualRate / 12 / 100;

       
        double emi = principal * R * Math.pow(1 + R, tenureMonths)
                / (Math.pow(1 + R, tenureMonths) - 1);

        double totalAmount = emi * tenureMonths;
        double totalInterest = totalAmount - principal;

        return EmiResponse.builder()
                .emi(emi)
                .totalAmount(totalAmount)
                .totalInterest(totalInterest)
                .build();
    }
}