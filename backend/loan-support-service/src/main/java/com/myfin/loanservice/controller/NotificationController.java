package com.myfin.loanservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.myfin.loanservice.entity.Notification;
import com.myfin.loanservice.service.NotificationService;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;

    // ✅ User notifications
    @GetMapping("/user/{userId}")  // ← Changed from /{userId}
    public ResponseEntity<List<Notification>> getUserNotifications(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            notificationService.getUserNotifications(userId));
    }

    // ✅ Admin notifications
    @GetMapping("/admin/all")  // ← Changed from /admin
    public ResponseEntity<List<Notification>> getAdminNotifications() {
        return ResponseEntity.ok(
            notificationService.getAllNotifications());
    }

    // ✅ Mark as read
    @PutMapping("/read/{id}")
    public ResponseEntity<Notification> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(
            notificationService.markAsRead(id));
    }

    // ✅ Create notification
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(
            @RequestBody Notification notification) {
        return ResponseEntity.ok(
            notificationService.createNotification(notification));
    }
    
    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllRead(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            notificationService.markAllAsRead(userId));
    }
}
