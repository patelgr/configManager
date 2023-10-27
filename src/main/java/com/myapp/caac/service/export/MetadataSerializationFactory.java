package com.myapp.caac.service.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myapp.caac.configuration.ResourcesConfiguration;
import com.myapp.caac.enums.ProductName;
import com.myapp.caac.model.ApplicationMetaData;
import com.myapp.caac.model.RootMetadata;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class MetadataSerializationFactory {

    private final Path metadataDirectory;
    private final ObjectMapper objectMapper;

    public MetadataSerializationFactory(ResourcesConfiguration resourcesConfiguration, ObjectMapper objectMapper) {
        this.metadataDirectory = resourcesConfiguration.resolveMetadataDirectory();
        this.objectMapper = objectMapper;
    }

    public void serialize(ApplicationMetaData metadata, ProductName productName) throws IOException {
        Path resultFilePath = metadataDirectory.resolve(productName.getMetadataFilename());
        File resultFile = resultFilePath.toFile();
        objectMapper.writeValue(resultFile, metadata);
    }

    public void serializeRoot(RootMetadata rootMetadata) throws IOException {
        Path resultFilePath = metadataDirectory.resolve("root_metadata.json");
        File resultFile = resultFilePath.toFile();
        objectMapper.writeValue(resultFile, rootMetadata);
    }
}
