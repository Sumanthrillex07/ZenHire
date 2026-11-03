package com.zenhire.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Root unchecked exception for all ZenHire domain and business logic exceptions.
 */
@Getter
public abstract class BaseApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public BaseApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public BaseApiException(String message, Throwable cause, HttpStatus status, String errorCode) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }
}
