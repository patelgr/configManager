package com.myapp.caac.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myapp.caac.model.ApplicationMetaData;
import com.myapp.caac.model.RootMetadata;
import com.myapp.caac.service.ExportService;
import com.myapp.caac.util.ZipFileCreator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin
//@RestController
@Slf4j
@Component
public class ExportController {

    @Autowired
    private ExportService exportService;
    @Autowired
    private ZipFileCreator zipFileCreator;

    @GetMapping("/convert-to-bundle")
    public ResponseEntity<FileSystemResource> convertPropertiesToJson(@RequestParam("ids") String[] ids) throws IOException {

        Map<String, String> filesToZip = new HashMap<>();

        for (String id : ids) {
            if (id.equals("api")) {
                filesToZip.put("api.json", "api_metadata.json");
            } else {
                filesToZip.put(id + ".yaml", id + "_metadata.json");
            }
        }

        String zipFileName = "bundle.zip"; // Name of the output ZIP file

        RootMetadata rootMetadata = exportService.setRootMetadata(filesToZip);

        // Create an ObjectMapper instance from Jackson
        ObjectMapper objectMapper = new ObjectMapper();

        for (Map.Entry<String, String> file : filesToZip.entrySet()) {
            ApplicationMetaData metadata = exportService.setRootMetadata();
            metadata.setConfigurationFileName(file.getKey());
            objectMapper.writeValue(new File(file.getValue()), metadata);
        }

        // Serialize the POJO to a JSON file
        objectMapper.writeValue(new File("root_metadata.json"), rootMetadata);
        Path zipFile = zipFileCreator.createZipFile(filesToZip, zipFileName);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bundle.zip");

        long contentLength = Files.size(zipFile);

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(contentLength)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(zipFile.toFile()));

    }
}
