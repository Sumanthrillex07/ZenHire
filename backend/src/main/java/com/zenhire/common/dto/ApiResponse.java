package com.zenhire.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/**
 * Standardized REST API response envelope for all ZenHire endpoints.
 *
 * @param <T> Payload data type
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        ApiError error,
        Instant timestamp
) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Operation successful", data, null, Instant.now());
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, Instant.now());
    }

    public static <T> ApiResponse<T> error(String message, ApiError error) {
        return new ApiResponse<>(false, message, null, error, Instant.now());
    }

    public static <T> ApiResponse<T> error(String message, String errorCode, String details) {
        return new ApiResponse<>(false, message, null, new ApiError(errorCode, details, null), Instant.now());
    }
}
