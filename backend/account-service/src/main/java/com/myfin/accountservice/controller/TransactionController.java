package com.myfin.accountservice.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.myfin.accountservice.entity.Transaction;
import com.myfin.accountservice.service.AccountService;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@CrossOrigin
public class TransactionController {

 private final AccountService service;

 @GetMapping
 public List<Transaction> getTransactions(){
  return service.getTransactions();
 }

}
