package com.myapp.caac.service.resource;

import com.myapp.caac.configuration.ResourcesConfiguration;
import com.myapp.caac.model.Configuration;
import com.myapp.caac.service.ArchivingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class LocalFileConfigurationManagementService {

    private final Path resourceDirectory;
    private final ArchivingService archivingService;

    private final List<Configuration> configurations = List.of(
            new Configuration("tenant", "tenant.yaml"),
            new Configuration("product", "product.yaml"),
            new Configuration("productfamily", "productfamily.yaml"),
            new Configuration("api", "api.json")
    );

    public LocalFileConfigurationManagementService(ResourcesConfiguration resourcesConfiguration
            , ArchivingService archivingService) {
        this.resourceDirectory = resourcesConfiguration.resolveApiProcessingDirectory();
        this.archivingService = archivingService;
    }


    private Optional<Configuration> findByType(String type) {
        return configurations.stream()
                .filter(conf -> conf.getType().equals(type))
                .findFirst();
    }

    private Optional<String> getFilenameByApiName(String type) {
        return findByType(type).map(Configuration::getFilename);
    }

    public Optional<String> getConfiguration(String apiName) {

        Optional<String> filenameByApiName = getFilenameByApiName(apiName);
        if (filenameByApiName.isEmpty()) {
            return Optional.empty();
        } else {
            Path filePath = resolveResourcePath(filenameByApiName.get());
            log.info("Reading {}, file:{}", apiName, filePath.toAbsolutePath());
            try {
                StringBuilder buf = new StringBuilder();
                try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        buf.append(line).append(System.lineSeparator());
                    }
                }
                return Optional.of(buf.toString());
            } catch (Exception e) {
                log.error("Error reading resource file: {}", e.getMessage());
                return Optional.empty();
            }

        }

    }

    public void saveConfiguration(MultipartFile file, String apiName) throws IOException {

        Optional<String> filenameByApiName = getFilenameByApiName(apiName);
        if (filenameByApiName.isPresent()) {
            Path filePath = resolveResourcePath(filenameByApiName.get());
            log.info("Writing {}, file:{}", apiName, filePath.toAbsolutePath());

            // Check if the file already exists and archive it
            if (Files.exists(filePath)) {
                archivingService.archiveFile(filePath);
            }

            // Copy the new file
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    private Path resolveResourcePath(String resourcePath) {
        return resourceDirectory.resolve(resourcePath);
    }

}
