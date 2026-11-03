package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when domain input data fails business rule validations.
 */
public class InvalidInputException extends BaseApiException {

    public InvalidInputException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_INPUT");
    }
}

