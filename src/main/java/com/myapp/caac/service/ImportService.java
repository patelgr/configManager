package com.myapp.caac.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myapp.caac.model.Application;
import com.myapp.caac.model.RootMetadata;
import com.myapp.caac.util.ApplicationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@Slf4j
public class ImportService {
    private final String ROOT_METADATA = "root_metadata.json";

    @Autowired
    private ObjectMapper objectMapper;

    public String importConfigs(MultipartFile zipFile) throws IOException {
        Path resourceDirectory = Paths.get("src", "main", "resources", "configurations");
        log.info("Extracting file to: {}", resourceDirectory.toAbsolutePath());
        File targetDir = new File(resourceDirectory.toAbsolutePath().toString());
        // Extract config bundle
        ApplicationUtils.extractConfigZippedBundle(zipFile, targetDir);
        // Processing Root Metadata file
        Path filePath = Paths.get(targetDir.getAbsolutePath(), ROOT_METADATA);
        RootMetadata rootMetadata = objectMapper.readValue(
                new File(filePath.toAbsolutePath().toString()), RootMetadata.class);
        // Get all Applications
        final List<Application> applications = rootMetadata.getApplications();
        // Process Application Configs
        return ApplicationUtils.processApplicationConfigs(applications, targetDir, objectMapper) ? "Imported successfully" : "Import unsuccessfully";
    }
}
 