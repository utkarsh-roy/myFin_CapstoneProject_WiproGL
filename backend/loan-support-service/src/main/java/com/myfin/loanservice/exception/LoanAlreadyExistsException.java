package com.myfin.loanservice.exception;

public class LoanAlreadyExistsException extends RuntimeException {

    /**
	 * 
	 */
	private static final long serialVersionUID = -269804793101778700L;

	public LoanAlreadyExistsException(String message) {
        super(message);
    }

}
