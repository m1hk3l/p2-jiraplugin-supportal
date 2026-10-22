package com.enefit.fnd.config;

import com.enefit.fnd.api.MyPluginComponent;
import com.enefit.fnd.impl.MyPluginComponentImpl;
import com.atlassian.plugins.osgi.javaconfig.ExportOptions;
import com.atlassian.plugins.osgi.javaconfig.configs.beans.ModuleFactoryBean;
import com.atlassian.plugins.osgi.javaconfig.configs.beans.PluginAccessorBean;
import com.atlassian.sal.api.ApplicationProperties;
import com.atlassian.sal.api.auth.LoginUriProvider;
import com.atlassian.jira.issue.IssueManager;
import com.atlassian.jira.bc.user.search.UserSearchService;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.util.UserManager;
import com.atlassian.servicedesk.api.ServiceDeskService;
import com.atlassian.servicedesk.api.field.RequestTypeFieldService;
import com.atlassian.servicedesk.api.request.ServiceDeskCustomerRequestService;
import com.atlassian.servicedesk.api.requesttype.RequestTypeService;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.WebResourceAssemblerFactory;
import com.enefit.fnd.servlet.AssetsClient;
import com.enefit.fnd.servlet.CustomerRequestSupport;
import com.enefit.fnd.servlet.NetworkFolderRequestHandler;
import com.enefit.fnd.servlet.SharedMailboxRequestHandler;
import com.enefit.fnd.servlet.SupportalLogger;
import com.enefit.fnd.servlet.SupportalPageHandler;
import com.enefit.fnd.servlet.UserSearchHandler;
import org.osgi.framework.ServiceRegistration;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import static com.atlassian.plugins.osgi.javaconfig.OsgiServices.exportOsgiService;
import static com.atlassian.plugins.osgi.javaconfig.OsgiServices.importOsgiService;

@Configuration
@Import({
        ModuleFactoryBean.class,
        PluginAccessorBean.class
})
public class MyPluginJavaConfig {


    // imports ApplicationProperties from OSGi
    @Bean
    public ApplicationProperties applicationProperties() {
        return importOsgiService(ApplicationProperties.class);
    }

    // --- Supportal servlet dependencies ---
    // The servlet module declared in atlassian-plugin.xml is instantiated by the
    // plugin framework's HostContainer, which constructor-autowires it from the
    // beans in this Spring context. These imports make that wiring possible.

    @Bean
    public TemplateRenderer templateRenderer() {
        return importOsgiService(TemplateRenderer.class);
    }

    @Bean
    public JiraAuthenticationContext jiraAuthenticationContext() {
        return importOsgiService(JiraAuthenticationContext.class);
    }

    @Bean
    public LoginUriProvider loginUriProvider() {
        return importOsgiService(LoginUriProvider.class);
    }

    /**
     * WebResourceAssemblerFactory builds the PRIVATE assembler the servlet
     * uses to render the generated React web-resource
     * (entrypoint-supportal-react) into script tags for the standalone
     * Supportal pages (docs/ARCHITECTURE.md §5.3). Deliberately NOT
     * PageBuilderService: its request-scoped assembler comes pre-populated
     * with Jira's default page payload (superbatch), which leaked onto the
     * bottom of every Supportal page.
     */
    @Bean
    public WebResourceAssemblerFactory webResourceAssemblerFactory() {
        return importOsgiService(WebResourceAssemblerFactory.class);
    }

    @Bean
    public UserSearchService userSearchService() {
        return importOsgiService(UserSearchService.class);
    }

    @Bean
    public ServiceDeskService serviceDeskService() {
        return importOsgiService(ServiceDeskService.class);
    }

    @Bean
    public RequestTypeService requestTypeService() {
        return importOsgiService(RequestTypeService.class);
    }

    @Bean
    public RequestTypeFieldService requestTypeFieldService() {
        return importOsgiService(RequestTypeFieldService.class);
    }

    @Bean
    public ServiceDeskCustomerRequestService serviceDeskCustomerRequestService() {
        return importOsgiService(ServiceDeskCustomerRequestService.class);
    }

    @Bean
    public IssueManager issueManager() {
        return importOsgiService(IssueManager.class);
    }

    @Bean
    public UserManager userManager() {
        return importOsgiService(UserManager.class);
    }

    // --- Local Supportal collaborators (not exported as OSGi services) ---

    @Bean
    public SupportalLogger supportalLogger(ApplicationProperties applicationProperties) {
        return new SupportalLogger(applicationProperties);
    }

    @Bean
    public SupportalPageHandler supportalPageHandler(
            TemplateRenderer templateRenderer,
            WebResourceAssemblerFactory webResourceAssemblerFactory,
            SupportalLogger supportalLogger) {
        return new SupportalPageHandler(
                templateRenderer,
                webResourceAssemblerFactory,
                supportalLogger);
    }

    @Bean
    public UserSearchHandler userSearchHandler(
            UserSearchService userSearchService,
            SupportalLogger supportalLogger) {
        return new UserSearchHandler(userSearchService, supportalLogger);
    }

    @Bean
    public AssetsClient assetsClient(SupportalLogger supportalLogger) {
        return new AssetsClient(supportalLogger);
    }

    @Bean
    public CustomerRequestSupport customerRequestSupport(
            ServiceDeskService serviceDeskService,
            RequestTypeService requestTypeService,
            RequestTypeFieldService requestTypeFieldService,
            ServiceDeskCustomerRequestService customerRequestService,
            IssueManager issueManager,
            UserManager userManager,
            SupportalLogger supportalLogger) {
        return new CustomerRequestSupport(
                serviceDeskService,
                requestTypeService,
                requestTypeFieldService,
                customerRequestService,
                issueManager,
                userManager,
                supportalLogger);
    }

    @Bean
    public NetworkFolderRequestHandler networkFolderRequestHandler(
            CustomerRequestSupport customerRequestSupport,
            AssetsClient assetsClient,
            SupportalLogger supportalLogger) {
        return new NetworkFolderRequestHandler(
                customerRequestSupport,
                assetsClient,
                supportalLogger);
    }

    @Bean
    public SharedMailboxRequestHandler sharedMailboxRequestHandler(
            CustomerRequestSupport customerRequestSupport,
            SupportalLogger supportalLogger) {
        return new SharedMailboxRequestHandler(customerRequestSupport, supportalLogger);
    }

    @Bean
    public MyPluginComponent myPluginComponent(ApplicationProperties applicationProperties) {
        return new MyPluginComponentImpl(applicationProperties);
    }

    // Exports MyPluginComponent as an OSGi service
    @Bean
    public FactoryBean<ServiceRegistration> registerMyDelegatingService(
            final MyPluginComponent mypluginComponent) {
        return exportOsgiService(mypluginComponent, ExportOptions.as(MyPluginComponent.class));
    }
}
