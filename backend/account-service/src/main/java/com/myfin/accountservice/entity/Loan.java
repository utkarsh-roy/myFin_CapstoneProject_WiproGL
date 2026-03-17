package com.myfin.accountservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "account_loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private double loanAmount;

    private int tenure;

    private double emi;
}