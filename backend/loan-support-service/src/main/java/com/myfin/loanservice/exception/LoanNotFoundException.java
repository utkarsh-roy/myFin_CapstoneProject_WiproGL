package com.myfin.loanservice.exception;

public class LoanNotFoundException extends RuntimeException {

    /**
	 * 
	 */
	private static final long serialVersionUID = 6464030294499386999L;

	public LoanNotFoundException(String message) {
        super(message);
    }

}