package com.myapp.caac.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myapp.caac.configuration.ResourcesConfiguration;
import com.myapp.caac.model.Application;
import com.myapp.caac.model.ApplicationMetaData;
import com.myapp.caac.model.RootMetadata;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@Slf4j
public class ImportService {

    private static final String ROOT_METADATA = "root_metadata.json";

    private final ObjectMapper objectMapper;

    private final Path metadataDirectory;

    public ImportService(ObjectMapper objectMapper, ResourcesConfiguration resourcesConfiguration){
        this.objectMapper = objectMapper;
//        this.metadataDirectory = resourcesConfiguration.resolveApiProcessingDirectory();
    }

    private boolean processImportedFiles(File targetDirectory) throws IOException {
        Path rootMetadataPath = targetDirectory.toPath().resolve(ROOT_METADATA);
        RootMetadata rootMetadata = objectMapper.readValue(rootMetadataPath.toFile(), RootMetadata.class);

        int totalApplications = Integer.parseInt(rootMetadata.getNoOfApplications());

        Map<Integer, Application> applicationBySequence = rootMetadata.getApplications()
                .stream()
                .collect(Collectors.toMap(Application::getExecutionSeq, app -> app));

        for (int sequence = 1; sequence <= totalApplications; sequence++) {
            Application app = applicationBySequence.get(sequence);
            if (app == null) {
                log.warn("No application found for sequence: {}", sequence);
                return false;
            }
            if (!processApplication(app, targetDirectory)) {
                log.warn("Failed to process application for sequence: {}", sequence);
                return false;
            }

        }

        return true;
    }

    private boolean processApplication(Application application, File targetDirectory)  {
        Path applicationMetadataPath = targetDirectory.toPath().resolve(application.getApplicationMetadataName());
        ApplicationMetaData applicationMetaData = null;
        try {
            applicationMetaData = objectMapper.readValue(applicationMetadataPath.toFile(), ApplicationMetaData.class);
        } catch (IOException e) {
            return  false;
        }

        log.info("Processing application metadata file {}", applicationMetadataPath);

        return applicationMetaData != null &&
                processApplicationMetaData(applicationMetaData, targetDirectory);
    }

    private boolean processApplicationMetaData(ApplicationMetaData metaData, File targetDir) {
        if ("FileUpload".equalsIgnoreCase(metaData.getConfigurationOperation())) {
            return moveFileToDestination(metaData, targetDir);
        }
        // Additional logic can be added here based on other operations
        return true;
    }

    private boolean moveFileToDestination(ApplicationMetaData metaData, File targetDir) {
        Path sourcePath = targetDir.toPath().resolve(metaData.getConfigurationFileName());
        Path destinationPath = Paths.get(metaData.getConfigurationApplyPath(), metaData.getConfigurationFileName());

        try {
            Files.move(sourcePath, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File moved successfully to : {}", destinationPath);
            return true;
        } catch (IOException e) {
            log.error("Error moving file", e);
            return false;
        }
    }

    private boolean extractZipToDirectory(MultipartFile zipFile, File targetDir) {
        try (ZipInputStream zipInput = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zipInput.getNextEntry()) != null) {
                File entryFile = new File(targetDir, entry.getName());
                if (!entryFile.getParentFile().exists()) {
                    entryFile.getParentFile().mkdirs();
                }
                try (OutputStream outputStream = new FileOutputStream(entryFile)) {
                    outputStream.write(zipInput.readAllBytes());
                }
            }
            return true;
        } catch (IOException e) {
            log.error("Error extracting zip file", e);
            return false;
        }
    }



    public String importConfigs(MultipartFile zipFile) throws IOException {
//        Path resourceDirectory = Paths.get("src", "main", "resources", "import");
        log.info("Extracting file to: {}", resourceDirectory.toAbsolutePath());
        File targetDirectory = resourceDirectory.toFile();

        boolean isSuccessfulImport = extractZipToDirectory(zipFile, targetDirectory) &&
                processImportedFiles(targetDirectory);

        // Clean up the temporary directory
        FileUtils.deleteDirectory(targetDirectory);

        return isSuccessfulImport ? "Imported successfully" : "Import unsuccessfully";
    }

}
