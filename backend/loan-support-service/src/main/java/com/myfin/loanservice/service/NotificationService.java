package com.myfin.loanservice.service;

import java.util.List;

import com.myfin.loanservice.entity.Notification;

public interface NotificationService {

    List<Notification> getUserNotifications(Long userId);

    List<Notification> getAllNotifications();

   
    Notification markAsRead(Long id);

    
    Notification createNotification(Notification notification);
    
    String markAllAsRead(Long userId);

}