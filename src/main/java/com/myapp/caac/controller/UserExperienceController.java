package com.myapp.caac.controller;

import com.myapp.caac.entity.CustomApi;
import com.myapp.caac.entity.ExportConfigurations;
import com.myapp.caac.service.ConfigurationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

import static com.myapp.caac.repository.ApiRepository.getCustomApis;

@Controller
@Slf4j
public class UserExperienceController {


    private final ConfigurationService configurationService;

    public UserExperienceController(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }


    @GetMapping("/")
    public String home() {
        return "home";
    }

    @GetMapping("/export")
    public String export(Model model) throws Exception {
        String currentPage = "export";
        model.addAttribute("currentPage", currentPage);
        model.addAttribute("apiList", getCustomApis());
        String allApis = getCustomApis().stream().map(CustomApi::getId).collect(Collectors.joining(","));
        model.addAttribute("allApis", allApis);
        List<ExportConfigurations> exportOptions = configurationService.loadExportConfigurations();
        model.addAttribute("exportOptions", exportOptions);
        return currentPage;
    }

    @GetMapping("/import")
    public String importPage(Model model) {
        String currentPage = "import";
        model.addAttribute("currentPage", currentPage);
        return currentPage;
    }

    @GetMapping("/export-configuration")
    public String exportConfiguration(Model model) throws Exception {
//        model.addAttribute("serverPort", serverPort); // Adding server port to the model
        String currentPage = "export-configuration";
        model.addAttribute("currentPage", currentPage);
        model.addAttribute("exportConfigurationsList", configurationService.loadExportConfigurations());
        List<CustomApi> customApis = getCustomApis();
        model.addAttribute("apiList", customApis);
        return "export-configuration";
    }


}
