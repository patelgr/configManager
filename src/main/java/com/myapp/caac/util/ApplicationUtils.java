package com.myapp.caac.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myapp.caac.model.Application;
import com.myapp.caac.model.ApplicationMetaData;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Slf4j
public class ApplicationUtils {
    public static Boolean processApplicationConfigs(List<Application> applications, File targetDir, ObjectMapper objectMapper) throws IOException {
        try {
            boolean flag = true;
            int sequence = 1;
            while (sequence <= applications.size()) {
                int finalSequence = sequence++;
                // Get the application configuration in sequencial manner
                Optional<Application> applicationOptional = applications.stream()
                        .filter(e -> Objects.equals(e.getExecutionSeq(), finalSequence)).findFirst();
                if (!applicationOptional.isPresent())
                    throw new IOException("Bundle not valid");
                processApplication(applicationOptional.get(), targetDir, objectMapper);
            }
        } catch (Exception e) {
            throw new IOException("Bundle not valid");
        } finally {
            cleanUpTempDirectory(targetDir);
        }
        return true;
    }

    // TO DO : Implement Abstract Factory Patter
    public static boolean processApplication(Application application, File targetDir, ObjectMapper objectMapper) throws IOException {
        //Reading Application metadata file
        log.info("Processing Application " + application.getApplicationMetadataName());
        final String applicationMetadataName = application.getApplicationMetadataName();
        Path filePath = Paths.get(targetDir.getAbsolutePath(), applicationMetadataName);
        ApplicationMetaData applicationMetaData = objectMapper.readValue(
                new File(filePath.toAbsolutePath().toString()), ApplicationMetaData.class);
        if (!Objects.nonNull(applicationMetaData))
            throw new IOException("Bundle not valid");
        log.info("Process Application Metadata");
        return processApplicationMetaData(applicationMetaData, targetDir);
    }

    public static boolean cleanUpTempDirectory(File targetDir) throws IOException {
        // Clean up: delete the temporary directory
//        FileUtils.deleteDirectory(targetDir);
        return true;
    }

    public static boolean processApplicationMetaData(ApplicationMetaData applicationMetaData, File targetDir) {
        //TODO: Write more logic here depending on metadata file
        if ("FileUpload".equals(applicationMetaData.getConfigurationOperation())) {
            return uploadFile(applicationMetaData, targetDir);
        }
        return true;
    }

    public static boolean uploadFile(ApplicationMetaData applicationMetaData, File targetDir) {
        Path destinationPath = Path.of(applicationMetaData.getConfigurationApplyPath(), applicationMetaData.getConfigurationFileName());
        File destinationFile = destinationPath.toFile();
        if (!destinationFile.getParentFile().exists()) {
            destinationFile.getParentFile().mkdirs();
        }
        try {
            // Copy the source file to the destination
            Path filePath = Paths.get(targetDir.getAbsolutePath(), applicationMetaData.getConfigurationFileName());
            File sourceFile = new File(filePath.toAbsolutePath().toString());
            Files.move(sourceFile.toPath(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            return false;
        }
        return true;
    }

    public static boolean extractingZipFile(MultipartFile zipFile, File tempDirectory) {
        // Create a ZipInputStream to read the contents of the uploaded zip file
        try (ZipInputStream zipInputStream = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                String entryName = entry.getName();
                File entryFile = new File(tempDirectory, entryName);
                // Ensure the parent directory of the entry file exists
                if (!entryFile.getParentFile().exists()) {
                    entryFile.getParentFile().mkdirs();
                }
                // Write the entry data to the entry file
                try (OutputStream outputStream = new FileOutputStream(entryFile)) {
                    outputStream.write(zipInputStream.readAllBytes());
                }
            }
        } catch (IOException e) {
            return false;
        }
        return true;
    }

    public static boolean extractConfigZippedBundle(MultipartFile zipFile, File targetDir) throws IOException {
        boolean extractionSuccess = extractingZipFile(zipFile, targetDir);
        if (!extractionSuccess)
            throw new IOException("Bundle not valid");
        return true;
    }
}
 