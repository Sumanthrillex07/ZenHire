package com.zenhire.common.exception;

import com.zenhire.common.dto.ApiError;
import com.zenhire.common.dto.ApiResponse;
import com.zenhire.common.dto.ValidationErrorItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Global exception interceptor translating exceptions into structured ApiResponse envelopes.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleBaseApiException(BaseApiException ex) {
        log.warn("Domain exception [{}]: {}", ex.getErrorCode(), ex.getMessage());

        Object extraData = null;
        if (ex instanceof AssessmentGatingException gatingEx) {
            Map<String, Object> requiredTest = new HashMap<>();
            requiredTest.put("testId", gatingEx.getRequiredTestId());
            requiredTest.put("roleCategory", gatingEx.getRoleCategory());
            
            Map<String, Object> data = new HashMap<>();
            data.put("requiredTest", requiredTest);
            extraData = data;
        }

        ApiError apiError = new ApiError(ex.getErrorCode(), ex.getMessage(), null);
        ApiResponse<Object> response = new ApiResponse<>(
                false,
                ex.getMessage(),
                extraData,
                apiError,
                java.time.Instant.now()
        );

        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        List<ValidationErrorItem> validationErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::mapFieldError)
                .toList();

        String summaryMessage = validationErrors.isEmpty()
                ? "Validation failed"
                : validationErrors.get(0).message();

        ApiError apiError = new ApiError("VALIDATION_FAILED", "One or more input parameters are invalid", validationErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(summaryMessage, apiError));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        ApiError apiError = new ApiError("INVALID_CREDENTIALS", "Invalid email or password", null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid email or password", apiError));
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(org.springframework.security.core.AuthenticationException ex) {
        ApiError apiError = new ApiError("UNAUTHORIZED", ex.getMessage() != null ? ex.getMessage() : "Authentication required", null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication failed", apiError));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        ApiError apiError = new ApiError("ACCESS_DENIED", "You do not have permission to access this resource", null);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied", apiError));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        ApiError apiError = new ApiError("FILE_TOO_LARGE", "Uploaded file exceeds the maximum allowed limit of 5MB", null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("File size limit exceeded", apiError));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleCatchAllException(Exception ex) {
        log.error("Unhandled unexpected server error:", ex);
        ApiError apiError = new ApiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Internal server error", apiError));
    }

    private ValidationErrorItem mapFieldError(FieldError fieldError) {
        return new ValidationErrorItem(
                fieldError.getField(),
                fieldError.getRejectedValue(),
                fieldError.getDefaultMessage()
        );
    }
}
