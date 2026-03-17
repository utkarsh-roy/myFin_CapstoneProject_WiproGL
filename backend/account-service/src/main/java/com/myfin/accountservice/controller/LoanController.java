package com.myfin.accountservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myfin.accountservice.entity.Loan;
import com.myfin.accountservice.repository.LoanRepository;

@RestController
@RequestMapping("/loans")
@CrossOrigin
public class LoanController {

 @Autowired
 private LoanRepository repo;

 @PostMapping("/apply")
 public Loan apply(@RequestBody Loan loan){

  double r = 10/(12*100.0);

  double emi = (loan.getLoanAmount()*r*Math.pow(1+r,loan.getTenure()))/
               (Math.pow(1+r,loan.getTenure())-1);

  loan.setEmi(emi);

  return repo.save(loan);
 }
}
