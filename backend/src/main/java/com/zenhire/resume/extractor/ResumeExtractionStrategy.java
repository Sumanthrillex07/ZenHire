package com.zenhire.resume.extractor;

import com.zenhire.resume.dto.ParsedResumeData;

/**
 * Strategy interface for parsing unstructured resume text into structured domain entities.
 */
public interface ResumeExtractionStrategy {

    ParsedResumeData extract(String rawText);
}

