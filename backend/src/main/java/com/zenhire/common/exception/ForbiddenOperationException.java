package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an authenticated user lacks permission for the requested resource (e.g., cross-recruiter access).
 */
public class ForbiddenOperationException extends BaseApiException {

    public ForbiddenOperationException(String message) {
        super(message, HttpStatus.FORBIDDEN, "FORBIDDEN_OPERATION");
    }
}

