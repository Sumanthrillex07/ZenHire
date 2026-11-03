package com.zenhire.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import java.util.UUID;

/**
 * Thrown when a candidate attempts to apply for a job without passing the required category assessment.
 */
@Getter
public class AssessmentGatingException extends BaseApiException {

    private final UUID requiredTestId;
    private final String roleCategory;

    public AssessmentGatingException(UUID requiredTestId, String roleCategory) {
        super(String.format("You must pass the %s assessment test before applying.", roleCategory),
                HttpStatus.FORBIDDEN,
                "ASSESSMENT_GATE_REQUIRED");
        this.requiredTestId = requiredTestId;
        this.roleCategory = roleCategory;
    }
}
