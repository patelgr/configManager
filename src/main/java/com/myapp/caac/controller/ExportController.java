package com.myapp.caac.controller;

import com.myapp.caac.enums.ProductName;
import com.myapp.caac.service.ExportService;
import com.myapp.caac.util.ZipFileCreator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@Slf4j
public class ExportController {

    private static final String ZIP_FILE_NAME = "bundle.zip";
    private final ExportService exportService;
    private final ZipFileCreator zipFileCreator;

    @GetMapping("/convert-to-bundle")
    public ResponseEntity<FileSystemResource> convertPropertiesToJson(@RequestParam("ids") String[] ids) throws IOException {
        Set<ProductName> productNames = exportService.convertIdsToProductNames(ids);

        exportService.serializeMetadata(productNames);
        exportService.serializeRootMetadata(exportService.generateRootMetadata(productNames));

        Path zipFile = zipFileCreator.createZipFile(productNames, ZIP_FILE_NAME);
        log.info("zipFile: {}", zipFile.toAbsolutePath());

        HttpHeaders headers = createResponseHeaders();
        long contentLength = Files.size(zipFile);

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(contentLength)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(zipFile.toFile()));
    }

    private HttpHeaders createResponseHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bundle.zip");
        return headers;
    }
}
