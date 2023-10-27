package com.myapp.caac.validations.content;

import com.myapp.caac.enums.ContentType;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ContentValidatorFactory {

    public ContentValidator getValidator(ContentType contentType) {
        log.info("Getting the validator for content type: {}", contentType);
        ContentValidator contentValidator = switch (contentType) {
            case YAML -> new YamlContentValidator();
            case JSON -> new JsonContentValidator();
        };
        log.info("Validator for content type {} is {}", contentType, contentValidator);
        return contentValidator;
    }
}
