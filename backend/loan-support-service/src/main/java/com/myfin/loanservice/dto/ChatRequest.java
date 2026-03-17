package com.myfin.loanservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    private Long senderId;
    private Long receiverId;
    private String senderType;
    private String content;

}