
package com.myfin.loanservice.service;

import java.util.List;

import com.myfin.loanservice.dto.ChatRequest;
import com.myfin.loanservice.dto.ChatResponse;

public interface ChatService {

   
    ChatResponse sendMessage(ChatRequest request);

   
    List<ChatResponse> getChatHistory(Long userId);

   
    List<ChatResponse> getAllChats();

 
    void markAsRead(Long messageId);
}