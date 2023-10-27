package com.myapp.caac.validations.api;


import com.myapp.caac.enums.ContentType;
import com.myapp.caac.validations.content.ContentValidator;
import com.myapp.caac.validations.content.ContentValidatorFactory;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ApiConfigurationValidator implements ConfigurationValidator {
    @Override
    public boolean isValid(String content) {
        log.info("Validating the content for API configuration");
        ContentValidatorFactory factory = new ContentValidatorFactory();
        ContentValidator validator = factory.getValidator(ContentType.JSON);
        boolean valid = validator.isValid(content);
        log.info("Validation result for API configuration: {}", valid);
        return valid;
    }
}
