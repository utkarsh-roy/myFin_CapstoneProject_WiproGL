package com.myfin.loanservice.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.myfin.loanservice.dto.ChatRequest;
import com.myfin.loanservice.dto.ChatResponse;
import com.myfin.loanservice.entity.Message;
import com.myfin.loanservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final AutoReplyService autoReplyService;

    @Override
    public ChatResponse sendMessage(ChatRequest request) {
        // ✅ Save user message
        Message message = Message.builder()
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .senderType(request.getSenderType())
                .content(request.getContent())
                .isRead(false)
                .build();
        message = messageRepository.save(message);

        // ✅ If message from USER → generate auto reply
        if ("USER".equals(request.getSenderType())) {
            String autoReply = autoReplyService
                .generateReply(request.getContent());

            // Save auto reply as SYSTEM message
            Message reply = Message.builder()
                    .senderId(0L)  // 0 = system/bank
                    .receiverId(request.getSenderId())
                    .senderType("ADMIN")
                    .content(autoReply)
                    .isRead(false)
                    .build();
            messageRepository.save(reply);
        }

        return mapToResponse(message);
    }

    @Override
    public List<ChatResponse> getChatHistory(Long userId) {
        return messageRepository
                .findBySenderIdOrReceiverId(userId, userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatResponse> getAllChats() {
        return messageRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long messageId) {
        Message message = messageRepository
                .findById(messageId)
                .orElseThrow(() ->
                    new RuntimeException("Message not found"));
        message.setIsRead(true);
        messageRepository.save(message);
    }

    private ChatResponse mapToResponse(Message message) {
        return ChatResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .build();
    }
}