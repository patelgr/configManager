package com.myapp.caac.controller;

import com.myapp.caac.entity.CustomApi;
import com.myapp.caac.entity.ExportConfigurations;
import com.myapp.caac.response.ConfigurationResponse;
import com.myapp.caac.service.ConfigurationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import static com.myapp.caac.repository.ApiRepository.getCustomApis;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin
@Slf4j
@AllArgsConstructor
public class ConfigurationController {

    private final ConfigurationService configurationService;

    @GetMapping(value = "configuration/{name}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<String> getConfiguration(@PathVariable String name) {
        log.info("getConfiguration:{}", name);
        try {
            Optional<String> optionalConfiguration = configurationService.getConfiguration(name);

            return optionalConfiguration
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.badRequest().body("Invalid configuration type or error"));
        } catch (Exception e) {
            log.error("Error fetching configuration for name: {}. Message: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching configuration.");
        }
    }

    @PostMapping(value = "configuration/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ConfigurationResponse> saveConfiguration(@PathVariable String name, @RequestParam("file") MultipartFile file) {
        log.info("saveConfiguration:{}", name);
        try {
            configurationService.saveConfiguration(name, file);
            log.info("saveConfiguration:success");
            return ResponseEntity.ok(new ConfigurationResponse("success", "You successfully uploaded " + file.getOriginalFilename() + "!"));
        } catch (IOException e) {
            log.error("Error saving the configuration for name: {}. Message: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ConfigurationResponse("error", "Error saving the configuration."));
        } catch (Exception e) {
            log.error("Unexpected error while saving configuration for name: {}. Message: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ConfigurationResponse("error", "Unexpected error while saving configuration."));
        }
    }

    @GetMapping("/apis")
    public ResponseEntity<List<CustomApi>> getApis() {
        List<CustomApi> apiList = getCustomApis();
        return ResponseEntity.ok(apiList);
    }

    @PostMapping("/configexport")
    public ResponseEntity<Map<String, String>> saveExportConfiguration(
            @RequestBody Map<String, Object> payload //,
//            Model model
    ) throws Exception {
//        model.addAttribute("serverPort", serverPort); // Adding server port to the model

        Map<String, String> responseMap = new HashMap<>();

        // Manual validation for 'name'
        if (!payload.containsKey("name") || payload.get("name") == null || payload.get("name").toString().isEmpty()) {
            responseMap.put("status", "failure");
            responseMap.put("message", "Name is mandatory");
            return ResponseEntity.badRequest().body(responseMap);
        }

        // Manual validation for 'apiList'
        Object apiObject = payload.get("apiList");
        if (!payload.containsKey("apiList") || !(apiObject instanceof List) || ((List<?>) apiObject).isEmpty()) {
            responseMap.put("status", "failure");
            responseMap.put("message", "apiList is mandatory and should be a non-empty list");
            return ResponseEntity.badRequest().body(responseMap);
        }

        String name = payload.get("name").toString();

        @SuppressWarnings("unchecked")  // Suppress the unchecked cast warning
        List<String> ids = (List<String>) apiObject;

        // You may need to convert apiListLabels to List<CustomApi> based on your requirements
        List<CustomApi> apiList = convertToCustomApiList(ids);

        ExportConfigurations exportConfigurations = new ExportConfigurations();
        exportConfigurations.setName(name);
        exportConfigurations.setApiList(apiList);
        List<ExportConfigurations> exportConfigurationsList = new ArrayList<>(configurationService.loadExportConfigurations());

        upsertConfiguration(exportConfigurationsList, exportConfigurations);

        configurationService.updateAndSaveExportConfigurations(exportConfigurationsList);

        responseMap.put("status", "success");
        responseMap.put("message", "Export configuration saved successfully!");
        return ResponseEntity.ok(responseMap);
    }

    private void upsertConfiguration(List<ExportConfigurations> configurationsList,
                                     ExportConfigurations newConfig) {
        configurationsList.stream()
                .filter(config -> config.getName().equals(newConfig.getName()))
                .findFirst()
                .ifPresentOrElse(
                        existingConfig -> existingConfig.setApiList(newConfig.getApiList()),
                        () -> configurationsList.add(newConfig)
                );
    }

    private String getErrorMessages(BindingResult result) {
        return result.getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
    }

    private List<CustomApi> convertToCustomApiList(List<String> ids) {

        return ids.stream()
                .map(this::findMatchingApi)
                .flatMap(Optional::stream)
                .filter(Objects::nonNull)
                .toList();
    }

    private Optional<CustomApi> findMatchingApi(String id) {
        log.info("label: {}", id);
        List<CustomApi> customApis = getCustomApis();
        log.info("customApis: {}", customApis);
        Optional<CustomApi> first = customApis.stream()
                .filter(api -> id.equalsIgnoreCase(api.getId()))
                .findFirst();

        return first;
    }

}

