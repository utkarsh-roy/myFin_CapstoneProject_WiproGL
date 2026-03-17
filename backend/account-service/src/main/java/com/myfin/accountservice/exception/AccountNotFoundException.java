package com.myfin.accountservice.exception;

public class AccountNotFoundException extends RuntimeException {

    /**
	 * 
	 */
	private static final long serialVersionUID = -6460481312308264451L;

	public AccountNotFoundException(String message) {
        super(message);
    }
}