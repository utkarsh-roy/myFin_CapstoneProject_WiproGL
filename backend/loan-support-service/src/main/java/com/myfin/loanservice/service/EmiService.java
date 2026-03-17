package com.myfin.loanservice.service;

import com.myfin.loanservice.dto.EmiRequest;
import com.myfin.loanservice.dto.EmiResponse;

public interface EmiService {

    
    EmiResponse calculateEmi(EmiRequest request);

}