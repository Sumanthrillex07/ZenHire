package com.zenhire.resume.extractor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Robust section segmentation parser identifying canonical resume sections:
 * Skills, Experience, Projects, Education, and Certifications.
 */
@Slf4j
@Component
public class ResumeSectionParser {

    public enum SectionType {
        SKILLS,
        EXPERIENCE,
        PROJECTS,
        EDUCATION,
        CERTIFICATIONS,
        SUMMARY
    }

    private static final Map<SectionType, Pattern> SECTION_HEADER_PATTERNS = new LinkedHashMap<>();

    static {
        SECTION_HEADER_PATTERNS.put(
                SectionType.SKILLS,
                Pattern.compile("(?im)^\\s*(?:technical\\s+skills?|core\\s+competencies|technologies|tech\\s+stack|key\\s+skills?|skills?)(?:\\s*[:\\-]?\\s*)$")
        );
        SECTION_HEADER_PATTERNS.put(
                SectionType.EXPERIENCE,
                Pattern.compile("(?im)^\\s*(?:work\\s+experience|professional\\s+experience|employment\\s+history|experience|work\\s+history)(?:\\s*[:\\-]?\\s*)$")
        );
        SECTION_HEADER_PATTERNS.put(
                SectionType.PROJECTS,
                Pattern.compile("(?im)^\\s*(?:projects?|key\\s+projects?|personal\\s+projects?|academic\\s+projects?|portfolio)(?:\\s*[:\\-]?\\s*)$")
        );
        SECTION_HEADER_PATTERNS.put(
                SectionType.EDUCATION,
                Pattern.compile("(?im)^\\s*(?:education|academic\\s+background|academics|qualifications|degrees?)(?:\\s*[:\\-]?\\s*)$")
        );
        SECTION_HEADER_PATTERNS.put(
                SectionType.CERTIFICATIONS,
                Pattern.compile("(?im)^\\s*(?:certifications?|licenses\\s*(?:&|and)\\s*certifications?|certificates?|credentials?)(?:\\s*[:\\-]?\\s*)$")
        );
    }

    private record HeaderMatch(SectionType type, int startIndex, int contentStartIndex) {}

    /**
     * Parses the raw resume text into distinct section content blocks.
     *
     * @param rawText Full extracted resume text
     * @return Map of SectionType string to section text
     */
    public Map<String, String> parseSections(String rawText) {
        Map<String, String> resultMap = new HashMap<>();
        if (rawText == null || rawText.isBlank()) {
            return resultMap;
        }

        List<HeaderMatch> matches = new ArrayList<>();

        for (Map.Entry<SectionType, Pattern> entry : SECTION_HEADER_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(rawText);
            while (matcher.find()) {
                matches.add(new HeaderMatch(entry.getKey(), matcher.start(), matcher.end()));
            }
        }

        // Sort header occurrences by their appearance in the text
        matches.sort(Comparator.comparingInt(HeaderMatch::startIndex));

        // Deduplicate: if multiple headers of same type appear close, keep the first
        List<HeaderMatch> filteredMatches = new ArrayList<>();
        Set<SectionType> seenTypes = new HashSet<>();
        for (HeaderMatch match : matches) {
            if (!seenTypes.contains(match.type)) {
                filteredMatches.add(match);
                seenTypes.add(match.type);
            }
        }
        filteredMatches.sort(Comparator.comparingInt(HeaderMatch::startIndex));

        if (filteredMatches.isEmpty()) {
            // Fallback: entire text treated as experience/summary
            resultMap.put(SectionType.EXPERIENCE.name(), rawText.trim());
            return resultMap;
        }

        for (int i = 0; i < filteredMatches.size(); i++) {
            HeaderMatch current = filteredMatches.get(i);
            int start = current.contentStartIndex;
            int end = (i + 1 < filteredMatches.size()) ? filteredMatches.get(i + 1).startIndex : rawText.length();

            if (start < end) {
                String sectionContent = rawText.substring(start, end).trim();
                resultMap.put(current.type.name(), sectionContent);
            }
        }

        log.debug("Segmented resume into {} identified sections: {}", resultMap.size(), resultMap.keySet());
        return resultMap;
    }
}
