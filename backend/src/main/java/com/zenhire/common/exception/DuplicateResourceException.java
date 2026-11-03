package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when attempting to create a duplicate resource (e.g., email already registered, duplicate job application).
 */
public class DuplicateResourceException extends BaseApiException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "DUPLICATE_RESOURCE");
    }
}
