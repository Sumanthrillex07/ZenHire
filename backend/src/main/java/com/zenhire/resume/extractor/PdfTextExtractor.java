package com.zenhire.resume.extractor;

import com.zenhire.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Text extractor leveraging Apache PDFBox to parse text from PDF resume documents.
 */
@Slf4j
@Component
public class PdfTextExtractor {

    /**
     * Extracts plain text content from PDF binary bytes.
     *
     * @param pdfBytes Binary payload of the PDF file
     * @return Extracted raw text content
     */
    public String extractText(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new FileProcessingException("PDF file content is empty");
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            if (document.isEncrypted()) {
                throw new FileProcessingException("Encrypted or password-protected PDF files cannot be processed");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new FileProcessingException(
                        "Extracted text is empty. Scanned images or OCR-dependent PDFs are not supported."
                );
            }

            // Normalize whitespace and blank line runs
            return text.replaceAll("(?m)^[ \t]*\r?\n", "").trim();
        } catch (IOException ex) {
            log.error("Failed to parse PDF document with PDFBox", ex);
            throw new FileProcessingException("Corrupted or unreadable PDF document", ex);
        }
    }
}

