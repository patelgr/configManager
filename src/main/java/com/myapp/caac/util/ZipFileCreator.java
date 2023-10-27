package com.myapp.caac.util;

import com.myapp.caac.configuration.ResourcesConfiguration;
import com.myapp.caac.enums.ProductName;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Data
@Slf4j
@Service
public class ZipFileCreator {

    private final Path apiProcessingDirectory;
    private final Path metadataDirectory;

    public ZipFileCreator(ResourcesConfiguration resourcesConfiguration) {
        this.apiProcessingDirectory = resourcesConfiguration.resolveApiProcessingDirectory();
        this.metadataDirectory = resourcesConfiguration.resolveMetadataDirectory();
    }

    public Path createZipFile(Set<ProductName> productNameSet, String zipFileName) {
        List<String> addedFiles = new ArrayList<>();
        Path zipFile = apiProcessingDirectory.resolve(zipFileName);
        log.info("Creating ZIP file: " + zipFileName);
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipFile))) {
            for (ProductName productName : productNameSet) {
                addFileToZip(apiProcessingDirectory, productName.getFilename(), zos, addedFiles);
                addFileToZip(metadataDirectory, productName.getMetadataFilename(), zos, addedFiles);
            }

            addFileToZip(metadataDirectory, "root_metadata.json", zos, addedFiles);

            if (Files.exists(zipFile)) {
                log.info("ZIP file created successfully: {}", zipFile.toAbsolutePath());
                log.info("Files added to ZIP:\n " + String.join(",\n ", addedFiles));
                return zipFile;
            } else {
                log.error("Error creating Zip file:{} ", zipFile.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Error occurred while creating ZIP: ", e);
        }
        return zipFile;
    }

    private void addFileToZip(Path baseDir, String fileName, ZipOutputStream zos, List<String> addedFiles) throws IOException {
        Path filePath = baseDir.resolve(fileName);
        if (Files.exists(filePath)) {
            addedFiles.add(filePath.toAbsolutePath().toString());
            log.info("File added to ZIP: " + filePath.toAbsolutePath());
            ZipEntry zipEntry = new ZipEntry(filePath.getFileName().toString());
            zos.putNextEntry(zipEntry);
            zos.write(Files.readAllBytes(filePath));
            zos.closeEntry();
        } else {
            log.error("File not found: " + filePath.toAbsolutePath());
        }
    }
}
