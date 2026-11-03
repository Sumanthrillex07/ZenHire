package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an illegal state machine transition is attempted on an application or test attempt.
 */
public class InvalidWorkflowStateException extends BaseApiException {

    public InvalidWorkflowStateException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_STATUS_TRANSITION");
    }
}

