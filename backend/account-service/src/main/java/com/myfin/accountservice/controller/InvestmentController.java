package com.myfin.accountservice.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.myfin.accountservice.entity.Investment;
import com.myfin.accountservice.service.InvestmentService;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin
public class InvestmentController {

    @Autowired
    private InvestmentService service;

    // Create investment
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Investment investment) {
        return ResponseEntity.ok(service.create(investment));
    }

    // Get all investments
    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}