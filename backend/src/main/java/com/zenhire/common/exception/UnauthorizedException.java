package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an unauthenticated request attempts to access protected resources.
 */
public class UnauthorizedException extends BaseApiException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED_ACCESS");
    }
}

