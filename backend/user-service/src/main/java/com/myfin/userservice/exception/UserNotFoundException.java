package com.myfin.userservice.exception;

public class UserNotFoundException extends RuntimeException{


	private static final long serialVersionUID = 8433500752119758642L;

 public UserNotFoundException(String message){
  super(message);
 }

}
