package com.myapp.caac.validations.api;

import com.myapp.caac.enums.ContentType;
import com.myapp.caac.validations.content.ContentValidator;
import com.myapp.caac.validations.content.ContentValidatorFactory;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TenantConfigurationValidator implements ConfigurationValidator {
    @Override
    public boolean isValid(String content) {
        log.info("Validating the content for Tenant configuration");
        ContentValidatorFactory factory = new ContentValidatorFactory();
        ContentValidator validator = factory.getValidator(ContentType.YAML);
        boolean valid = validator.isValid(content);
        log.info("Validation result for Tenant configuration: {}", valid);
        return valid;
    }
}
