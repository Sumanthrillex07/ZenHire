package com.zenhire.common.service;

import com.zenhire.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service managing secure file uploads, magic number validation, and disk storage.
 */
@Slf4j
@Service
public class FileStorageService {

    private final Path uploadLocation;

    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException ex) {
            log.error("Could not initialize upload directory at {}", uploadLocation, ex);
            throw new FileProcessingException("Could not initialize file storage directory", ex);
        }
    }

    /**
     * Stores a PDF file after validating its content type and PDF magic bytes (%PDF).
     *
     * @param file The multipart uploaded file
     * @return The public URL path (e.g. /uploads/uuid.pdf)
     */
    public String storePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileProcessingException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new FileProcessingException("Invalid file format. Only PDF documents are accepted.");
        }

        // Validate PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = new byte[4];
            int read = inputStream.read(header);
            if (read < 4 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                throw new FileProcessingException("File content is not a valid PDF document (magic bytes mismatch)");
            }
        } catch (IOException ex) {
            throw new FileProcessingException("Failed to read uploaded file header", ex);
        }

        String filename = UUID.randomUUID() + ".pdf";
        Path targetPath = this.uploadLocation.resolve(filename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored PDF file successfully at: {}", targetPath);
            return "/uploads/" + filename;
        } catch (IOException ex) {
            log.error("Failed to store file {}", filename, ex);
            throw new FileProcessingException("Failed to store file on disk", ex);
        }
    }
}

