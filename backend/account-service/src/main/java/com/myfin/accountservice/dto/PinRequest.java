package com.myfin.accountservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PinRequest {
    private Long accountId;
    private String pin;
}