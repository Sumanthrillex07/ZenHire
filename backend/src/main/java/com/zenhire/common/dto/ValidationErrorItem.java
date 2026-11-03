package com.zenhire.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Represents a single field validation constraint violation.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ValidationErrorItem(
        String field,
        Object rejectedValue,
        String message
) {
    public ValidationErrorItem(String field, String message) {
        this(field, null, message);
    }
}
