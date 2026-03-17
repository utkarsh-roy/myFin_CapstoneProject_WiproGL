package com.myfin.loanservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {

    private Long id;
    private Long senderId;
    private Long receiverId;
    private String senderType;
    private String content;
    private Boolean isRead;
    private LocalDateTime sentAt;

}
