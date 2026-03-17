package com.myfin.adminservice.dto;

import lombok.Data;

@Data
public class AdminLoginRequest {
    private String email;
    private String password;
    private String secretCode;
}
