package com.myfin.loanservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.myfin.loanservice.entity.Notification;
import com.myfin.loanservice.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    // Get notifications for user
    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Admin gets all notifications
    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Mark notification as read
    @Override
    public Notification markAsRead(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    // Create notification
    @Override
    public Notification createNotification(Notification notification) {

        return notificationRepository.save(notification);
    }
    @Override
    public String markAllAsRead(Long userId) {
        List<Notification> unread =
            notificationRepository
                .findByUserId(userId)
                .stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());

        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);

        return "All notifications marked as read";
    }
}