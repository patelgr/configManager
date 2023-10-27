package com.myapp.caac.configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class ResourcesConfiguration {

    private final String basePath;
    private final String resourceDirectoryPath;
    private final String metadataDirectoryPath;

    public ResourcesConfiguration(@Value("${resource.basepath}") String basePath,
                                  @Value("${resource.directory}") String resourceDirectoryPath,
                                  @Value("${resource.metadata}") String metadataDirectoryPath) {
        this.basePath = basePath;
        this.resourceDirectoryPath = resourceDirectoryPath;
        this.metadataDirectoryPath = metadataDirectoryPath;
    }

    public Path resolveApiProcessingDirectory() {
        if ("home".equalsIgnoreCase(basePath)) {
            String homeDirectory = System.getProperty("user.home");
            return Paths.get(homeDirectory, resourceDirectoryPath);
        } else if ("project".equalsIgnoreCase(basePath)) {
            return Paths.get(resourceDirectoryPath);
        } else {
            throw new IllegalArgumentException("Invalid value for resource.basepath");
        }
    }

    @PostConstruct
    public void logResourcePaths() {
        log.info("API Processing Directory Path: {}", resolveApiProcessingDirectory().toAbsolutePath());
        log.info("Metadata Directory Path: {}", resolveMetadataDirectory().toAbsolutePath());
    }

    public Path resolveMetadataDirectory() {
        return Paths.get(metadataDirectoryPath);
    }
}
