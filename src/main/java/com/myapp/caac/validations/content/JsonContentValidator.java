package com.myapp.caac.validations.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JsonContentValidator implements ContentValidator {

    @Override
    public boolean isValid(String content) {
        log.info("Validating the content for JSON");
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.readTree(content);
            log.info("Validation result for JSON: {}", true);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
