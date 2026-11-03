package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when attempting to create a duplicate resource (e.g., email already registered, duplicate job application).
 */
public class DuplicateResourceException extends BaseApiException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }

    public DuplicateResourceException(String resourceName, String field, Object value) {
        super(String.format("%s with %s '%s' already exists", resourceName, field, value),
                HttpStatus.CONFLICT,
                "DUPLICATE_RESOURCE");
    }
}
