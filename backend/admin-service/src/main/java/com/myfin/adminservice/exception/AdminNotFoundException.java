package com.myfin.adminservice.exception;

public class AdminNotFoundException extends RuntimeException {

    /**
	 * 
	 */
	private static final long serialVersionUID = 111012729333885710L;

	public AdminNotFoundException(String message) {
        super(message);
    }
}