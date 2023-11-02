package com.myapp.caac.controller;

import com.myapp.caac.service.ImportService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Slf4j
@AllArgsConstructor
//@RestController
@CrossOrigin
public class ImportController {

    private final ImportService importService;

    @PostMapping(value = "api/import")
    public ResponseEntity<Map<String, String>> importConfigs(@RequestParam("file") MultipartFile zipFile) throws IOException {
        if (zipFile.isEmpty()) {
            log.info("zip file is empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("status", "empty zip file"));
        }
        return ResponseEntity.status(HttpStatus.OK).body(Collections.singletonMap("status", importService.importConfigs(zipFile)));
    }
}
