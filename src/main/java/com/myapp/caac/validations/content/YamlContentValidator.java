package com.myapp.caac.validations.content;

import lombok.extern.slf4j.Slf4j;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.parser.ParserException;

@Slf4j
public class YamlContentValidator implements ContentValidator {

    @Override
    public boolean isValid(String content) {
        log.info("Validating the content for YAML");
//        try {
//            Yaml yaml = new Yaml();
//            Object parsedContent = yaml.load(content);
//            boolean isValid = parsedContent != null;
//            log.info("Validation result for YAML: {}", isValid);
//            return isValid;
//        } catch (ParserException e) {
//            return false;
//        }
        return true;
    }
}
