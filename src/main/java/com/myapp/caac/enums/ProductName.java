package com.myapp.caac.enums;

import com.myapp.caac.exception.InvalidConfigurationTypeException;

import java.util.Arrays;

public enum ProductName {
    PRODUCT("product", "product", "Product", "yaml", "product.yaml", "product_metadata.json"),
    TENANT("tenant", "tenant", "Tenant", "yaml", "tenant.yaml", "tenant_metadata.json"),
    PRODUCTFAMILY("productfamily", "productfamily", "ProductFamily", "yaml", "productfamily.yaml", "productfamily_metadata.yaml"),
    API("api", "api", "API", "json", "api.json", "api_metadata.json");

    private final String id;
    private final String displayName;
    private final String label;
    private final String language;
    private final String filename;
    private final String metadataFilename;

    ProductName(String id, String displayName, String label, String language, String filename, String metadataFilename) {
        this.id = id;
        this.displayName = displayName;
        this.label = label;
        this.language = language;
        this.filename = filename;
        this.metadataFilename = metadataFilename;
    }

    public static ProductName fromString(String productName) {
        try {
            String upperCase = productName.toUpperCase();
            return ProductName.valueOf(upperCase);
        } catch (IllegalArgumentException e) {
            throw new InvalidConfigurationTypeException("Invalid configuration type: " + productName);
        }
    }

    public static ProductName fromDisplayName(String displayName) {
        return Arrays.stream(ProductName.values())
                .filter(productName -> productName.displayName.equals(displayName))
                .findFirst()
                .orElseThrow(() -> new InvalidConfigurationTypeException("Invalid configuration display name: " + displayName));
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getLabel() {
        return label;
    }

    public String getLanguage() {
        return language;
    }

    public String getFilename() {
        return filename;
    }

    public String getMetadataFilename() {
        return metadataFilename;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
