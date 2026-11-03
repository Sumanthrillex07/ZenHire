package com.zenhire.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an uploaded file is invalid, corrupted, or fails text extraction.
 */
public class FileProcessingException extends BaseApiException {

    public FileProcessingException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "FILE_PROCESSING_ERROR");
    }

    public FileProcessingException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_REQUEST, "FILE_PROCESSING_ERROR");
    }
}
