package com.myapp.caac.controller;


import com.myapp.caac.entity.CustomApi;
import com.myapp.caac.entity.ExportConfigurations;
import com.myapp.caac.response.ConfigurationResponse;
import com.myapp.caac.response.ConfigurationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import static com.myapp.caac.repository.ApiRepository.getCustomApis;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin
@Slf4j
@AllArgsConstructor
public class MyController {

    private final ConfigurationService configurationService;

    @GetMapping(value = "/configuration/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getConfigurationById(@PathVariable Long id) {
        log.info("getConfigurationById: {}", id);
        // This is as only one tenant works for now
        String staticNameForNow = "api";
        try {
            Optional<String> optionalConfiguration = configurationService.getConfiguration(staticNameForNow);
            return optionalConfiguration
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.badRequest().body("Invalid configuration type or error"));
        } catch (Exception e) {
            log.error("Error fetching configuration for name: {}. Message: {}", staticNameForNow, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching configuration.");
        }
    }


    @PostMapping(value = "/configuration", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createConfiguration(@RequestBody String configurationData) {
        log.info("createConfiguration: {}", configurationData);
        // Here you should parse the configurationData and create a new configuration in your service
        // The implementation details will depend on your service and data model

        Map<String, Object> responseMap = new HashMap<>();
        // Example of adding a mock generated ID to the response
        responseMap.put("id", new Random().nextInt(1000)); // Replace with real ID generation logic
        responseMap.put("status", "success");

        return new ResponseEntity<>(responseMap, HttpStatus.CREATED);
    }

    // PUT: Update an existing configuration by ID
    @PutMapping(value = "/configuration/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateConfiguration(@PathVariable Long id, @RequestBody String configurationData) {
        log.info("updateConfiguration: id={}, data={}", id, configurationData);
        // Here you should update the configuration identified by id with the new configurationData
        // The implementation details will depend on your service and data model

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", id);
        responseMap.put("status", "success");

        return new ResponseEntity<>(responseMap, HttpStatus.OK);
    }


    @GetMapping(value = "/configurations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<Long, String>> listAll() {
        log.info("Listing all configurations");

        Map<Long, String> mockConfigurations = new LinkedHashMap<>();

        // List of sample company names for mock data
        List<String> sampleNames = Arrays.asList(
                "Walmart", "Target", "Kroger", "Costco", "Safeway",
                "Ikea", "Best Buy", "Home Depot", "Lowe's", "Walgreens",
                "CVS Pharmacy", "Dollar General", "Macy's", "Sears", "Kmart"
        );

        // Shuffle the list to get random order
        Collections.shuffle(sampleNames);

        // Generate
        // a random number between 8 and 15
        int numberOfElements = ThreadLocalRandom.current().nextInt(8, 16);

        // Add random elements to the map
        for (int i = 0; i < numberOfElements; i++) {
            mockConfigurations.put((long) (i + 1), sampleNames.get(i));
        }

        return new ResponseEntity<>(mockConfigurations, HttpStatus.OK);
    }




}

