package com.myapp.caac.repository;

import com.myapp.caac.entity.CustomApi;
import com.myapp.caac.enums.ProductName;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Slf4j
public class ApiRepository {
    @NotNull
    public static List<CustomApi> getCustomApis() {
        CustomApi tenantApi = new CustomApi(
                ProductName.TENANT.getId(),
                ProductName.TENANT.getLabel(),
                ProductName.TENANT.getLanguage()
        );
        CustomApi productFamilyApi = new CustomApi(
                ProductName.PRODUCTFAMILY.getId(),
                ProductName.PRODUCTFAMILY.getLabel(),
                ProductName.PRODUCTFAMILY.getLanguage()
        );
        CustomApi productApi = new CustomApi(
                ProductName.PRODUCT.getId(),
                ProductName.PRODUCT.getLabel(),
                ProductName.PRODUCT.getLanguage()

        );
        CustomApi apiApi = new CustomApi(
                ProductName.API.getId(),
                ProductName.API.getLabel(),
                ProductName.API.getLanguage()
        );
        List<CustomApi> apiList = List.of(tenantApi, productFamilyApi, productApi, apiApi);
        log.info("apiList: {}", apiList);
        return apiList;
    }
}
