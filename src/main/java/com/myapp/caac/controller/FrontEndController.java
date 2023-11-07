package com.myapp.caac.controller;

import com.myapp.caac.entity.CustomApi;
import com.myapp.caac.entity.ExportConfigurations;
import com.myapp.caac.response.ConfigurationService;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

import static com.myapp.caac.repository.ApiRepository.getCustomApis;

/**
 * Front-end controller for handling UI navigation.
 */
@Controller
@Slf4j
public class FrontEndController {

//    @Value("${spring.application.name}")
    private String appName = "QA Config Management";

    private final ConfigurationService configurationService;

    /**
     * Constructs a new FrontEndController with the specified configuration service.
     *
     * @param configurationService the configuration service to use with this controller
     */
    public FrontEndController(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    /**
     * Home page endpoint.
     *
     * @return the name of the home view
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("title", appName + " - Home");
        return "home";
    }

    /**
     * Manage page endpoint. Fetches API list and export options to display.
     *
     * @param model the UI model to add attributes to
     * @return the name of the manage view
     * @throws Exception if there is an error during loading configurations
     */
    @GetMapping("/manage")
    public String manage(Model model) throws Exception {
        model.addAttribute("title", appName + " - Manage");
        model.addAttribute("currentPage", "manage");
        model.addAttribute("apiList", getCustomApis());
        String allApis = getCustomApis().stream()
                .map(CustomApi::getId)
                .collect(Collectors.joining(","));
        model.addAttribute("allApis", allApis);
        List<ExportConfigurations> exportOptions = configurationService.loadExportConfigurations();
        model.addAttribute("exportOptions", exportOptions);
        return "manage";
    }

    /**
     * Export page endpoint.
     *
     * @param model the UI model to add attributes to
     * @return the name of the export view
     * @throws Exception if there is an error during loading configurations
     */
    @GetMapping("/export")
    public String export(Model model) throws Exception {
        model.addAttribute("title", appName + " - Export");
        model.addAttribute("currentPage", "export");
        return "export";
    }

    /**
     * Import page endpoint.
     *
     * @param model the UI model to add attributes to
     * @return the name of the import view
     */
    @GetMapping("/import")
    public String importPage(Model model) {
        model.addAttribute("title", appName + " - Import");
        model.addAttribute("currentPage", "import");
        return "import";
    }

    /**
     * Export configuration page endpoint. Loads custom APIs and export configurations for the UI.
     *
     * @param model the UI model to add attributes to
     * @return the name of the export configuration view
     * @throws Exception if there is an error during loading configurations
     */
    @GetMapping("/export-configuration")
    public String exportConfiguration(Model model) throws Exception {
        model.addAttribute("title", appName + " - Export Configuration");
        model.addAttribute("currentPage", "export-configuration");
        List<ExportConfigurations> exportConfigurations = configurationService.loadExportConfigurations();
        model.addAttribute("exportConfigurationsList", exportConfigurations);
        List<CustomApi> customApis = getCustomApis();
        model.addAttribute("apiList", customApis);
        return "export-configuration";
    }
}
