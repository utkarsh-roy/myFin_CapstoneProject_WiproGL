package com.myfin.loanservice.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.myfin.loanservice.dto.ChatRequest;
import com.myfin.loanservice.dto.ChatResponse;
import com.myfin.loanservice.service.ChatService;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ChatService chatService;

   
    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {

        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ChatResponse>> getChatHistory(@PathVariable Long userId) {

        return ResponseEntity.ok(chatService.getChatHistory(userId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<ChatResponse>> getAllChats() {

        return ResponseEntity.ok(chatService.getAllChats());
    }

    @PutMapping("/read/{messageId}")
    public ResponseEntity<String> markRead(@PathVariable Long messageId) {

        chatService.markAsRead(messageId);

        return ResponseEntity.ok("Message marked as read");
    }
}
