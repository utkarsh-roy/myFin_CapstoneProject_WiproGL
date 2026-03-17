package com.myfin.adminservice.dto;

import lombok.Data;

@Data
public class AdminRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String secretCode;
}
