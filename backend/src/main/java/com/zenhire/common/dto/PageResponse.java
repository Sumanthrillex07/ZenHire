package com.zenhire.common.dto;

import org.springframework.data.domain.Page;
import java.util.List;

/**
 * Standardized pagination wrapper for paged query responses.
 *
 * @param <T> Page item data type
 */
public record PageResponse<T>(
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean isLast
) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}

