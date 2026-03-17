package com.myfin.loanservice.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.myfin.loanservice.dto.EmiRequest;
import com.myfin.loanservice.dto.EmiResponse;
import com.myfin.loanservice.service.EmiService;

@RestController
@RequestMapping("/api/emi")
@RequiredArgsConstructor
@CrossOrigin
public class EmiController {

    private final EmiService emiService;

    @PostMapping("/calculate")
    public ResponseEntity<EmiResponse> calculateEmi(@RequestBody EmiRequest request) {

        EmiResponse response = emiService.calculateEmi(request);

        return ResponseEntity.ok(response);
    }
}