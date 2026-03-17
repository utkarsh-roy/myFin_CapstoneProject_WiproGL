package com.myfin.userservice.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

 @ExceptionHandler(UserNotFoundException.class)
 public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException ex){
  Map<String, Object> body = new HashMap<>();
  body.put("timestamp", LocalDateTime.now());
  body.put("message", ex.getMessage());
  body.put("status", HttpStatus.NOT_FOUND.value());
  return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
 }

 @ExceptionHandler(Exception.class)
 public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex){
  Map<String, Object> body = new HashMap<>();
  body.put("timestamp", LocalDateTime.now());
  body.put("message", "An unexpected error occurred: " + ex.getMessage());
  body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
  return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
 }
}
