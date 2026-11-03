package com.zenhire.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Encapsulates structured error information within the ApiResponse envelope.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String errorCode,
        String details,
        List<ValidationErrorItem> validationErrors
) {}
