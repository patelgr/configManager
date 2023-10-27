package com.myapp.caac.service.export;

import com.myapp.caac.configuration.ResourcesConfiguration;
import com.myapp.caac.enums.ProductName;
import com.myapp.caac.model.Application;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Path;

@Service
@Slf4j
public class ApplicationFactory {

    private final Path metadataDirectory;

    public ApplicationFactory(ResourcesConfiguration resourcesConfiguration) {
        this.metadataDirectory = resourcesConfiguration.resolveMetadataDirectory();
    }

    public Application createApplication(int index, ProductName productName) {
        Application application = new Application();
        application.setApplicationName(productName.getDisplayName());
        application.setExecutionSeq(index + 1);
        application.setApplicationMetadataName(productName.getMetadataFilename());
        application.setApplicationMetadataPath(metadataDirectory.toString());
        log.info("Application: {}", application);
        return application;
    }
}
