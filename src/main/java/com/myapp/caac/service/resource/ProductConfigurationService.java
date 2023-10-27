package com.myapp.caac.service.resource;

import com.myapp.caac.enums.ProductName;
import com.myapp.caac.service.ConfigurationValidatorFactory;
import com.myapp.caac.validations.api.ConfigurationValidator;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class ProductConfigurationService implements ConfigurationManagementService {
    private final ProductName apiName = ProductName.PRODUCT;

    private final LocalFileConfigurationManagementService localFileConfigurationManagementService;
    private final ConfigurationValidator validator;

    public ProductConfigurationService(LocalFileConfigurationManagementService theLocalFileConfigurationManagementService,
                                       ConfigurationValidatorFactory validatorFactory) {
        this.localFileConfigurationManagementService = theLocalFileConfigurationManagementService;
        this.validator = validatorFactory.getValidator(apiName);
    }

    @Override
    public Optional<String> getConfiguration() {
        return localFileConfigurationManagementService.getConfiguration(apiName.toString());
    }

    @Override
    public void saveConfiguration(MultipartFile file) throws IOException {
        localFileConfigurationManagementService.saveConfiguration(file, apiName.toString());
    }

    @Override
    public boolean validateConfigurationContent(String content) {
        return validator.isValid(content);
    }
}
