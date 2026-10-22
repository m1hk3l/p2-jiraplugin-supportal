package com.enefit.fnd.servlet;

import com.atlassian.jira.event.type.EventDispatchOption;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.IssueManager;
import com.atlassian.jira.issue.MutableIssue;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.user.util.UserManager;
import com.atlassian.servicedesk.api.ServiceDesk;
import com.atlassian.servicedesk.api.ServiceDeskService;
import com.atlassian.servicedesk.api.field.CustomerRequestCreateMeta;
import com.atlassian.servicedesk.api.field.FieldId;
import com.atlassian.servicedesk.api.field.FieldInputValue;
import com.atlassian.servicedesk.api.field.RequestTypeField;
import com.atlassian.servicedesk.api.field.RequestTypeFieldService;
import com.atlassian.servicedesk.api.request.CustomerRequest;
import com.atlassian.servicedesk.api.request.CustomerRequestChannelSource;
import com.atlassian.servicedesk.api.request.ServiceDeskCustomerRequestService;
import com.atlassian.servicedesk.api.requesttype.RequestType;
import com.atlassian.servicedesk.api.requesttype.RequestTypeQuery;
import com.atlassian.servicedesk.api.requesttype.RequestTypeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/** Shared Jira Service Management operations used by Supportal request types. */
public final class CustomerRequestSupport {
    private static final int SERVICE_DESK_ID = 31;
    private static final String MIDPOINT_AGENT_USERNAME = "Midpoint.Agent";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final ServiceDeskService serviceDeskService;
    private final RequestTypeService requestTypeService;
    private final RequestTypeFieldService requestTypeFieldService;
    private final ServiceDeskCustomerRequestService customerRequestService;
    private final IssueManager issueManager;
    private final UserManager userManager;
    private final SupportalLogger logger;

    public CustomerRequestSupport(ServiceDeskService serviceDeskService,
                                  RequestTypeService requestTypeService,
                                  RequestTypeFieldService requestTypeFieldService,
                                  ServiceDeskCustomerRequestService customerRequestService,
                                  IssueManager issueManager,
                                  UserManager userManager,
                                  SupportalLogger logger) {
        this.serviceDeskService = serviceDeskService;
        this.requestTypeService = requestTypeService;
        this.requestTypeFieldService = requestTypeFieldService;
        this.customerRequestService = customerRequestService;
        this.issueManager = issueManager;
        this.userManager = userManager;
        this.logger = logger;
    }

    public CustomerRequestCreateMeta createMeta(ApplicationUser user, int requestTypeId) {
        return requestTypeFieldService.getCustomerRequestCreateMeta(
                user,
                requestTypeFieldService.newQueryBuilder()
                        .serviceDesk(SERVICE_DESK_ID)
                        .requestType(requestTypeId)
                        .build()
        );
    }

    public CustomerRequest create(ApplicationUser user,
                                  int requestTypeId,
                                  Map<FieldId, FieldInputValue> fieldValues,
                                  String raiseOnBehalfOf) {
        ServiceDesk serviceDesk = serviceDeskService.getServiceDeskById(user, SERVICE_DESK_ID);
        RequestType requestType = loadRequestType(user, requestTypeId);
        return customerRequestService.createCustomerRequest(
                user,
                customerRequestService.newCreateBuilder()
                        .serviceDesk(serviceDesk)
                        .requestType(requestType)
                        .fieldValues(fieldValues)
                        .raiseOnBehalfOf(raiseOnBehalfOf)
                        .customerRequestChannelSource(CustomerRequestChannelSource.PORTAL)
                        .build()
        );
    }

    public ApplicationUser requireActiveRequestedFor(String username,
                                                     HttpServletResponse response) throws IOException {
        ApplicationUser requestedFor = userManager.getUserByName(username);
        if (requestedFor == null || !requestedFor.isActive()) {
            logger.warn("Requested-for user is not an active Jira account username="
                    + JsonSupport.quote(username));
            sendJsonError(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Requested user is not an active Jira account on this instance.");
            return null;
        }
        return requestedFor;
    }

    public boolean hasField(CustomerRequestCreateMeta createMeta, String fieldId) {
        for (RequestTypeField field : createMeta.requestTypeFields()) {
            if (fieldId.equals(field.fieldId().value())) {
                return true;
            }
        }
        return false;
    }

    public void logCreateMeta(String prefix, CustomerRequestCreateMeta createMeta) {
        for (RequestTypeField field : createMeta.requestTypeFields()) {
            logger.info(prefix + " field meta fieldId=" + JsonSupport.quote(field.fieldId().value())
                    + " name=" + JsonSupport.quote(field.name())
                    + " required=" + field.required()
                    + " validValues=" + field.validValues().size());
        }
    }

    public void assignToMidpointAgent(ApplicationUser requestingUser, Issue issue, String prefix) {
        if (issue == null) {
            logger.warn(prefix + " assignee update skipped because created issue was null");
            return;
        }
        ApplicationUser assignee = userManager.getUserByName(MIDPOINT_AGENT_USERNAME);
        if (assignee == null) {
            logger.warn(prefix + " assignee update skipped because user was not found username="
                    + JsonSupport.quote(MIDPOINT_AGENT_USERNAME)
                    + " issueKey=" + JsonSupport.quote(issue.getKey()));
            return;
        }
        MutableIssue mutableIssue = issueManager.getIssueObject(issue.getId());
        if (mutableIssue == null) {
            logger.warn(prefix + " assignee update skipped because issue lookup failed issueKey="
                    + JsonSupport.quote(issue.getKey()));
            return;
        }
        mutableIssue.setAssignee(assignee);
        issueManager.updateIssue(requestingUser, mutableIssue, EventDispatchOption.ISSUE_UPDATED, false);
        logger.info(prefix + " assignee updated issueKey=" + JsonSupport.quote(issue.getKey())
                + " assignee=" + JsonSupport.quote(MIDPOINT_AGENT_USERNAME));
    }

    public void writeCreatedRequest(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Issue issue) throws IOException {
        ObjectNode root = JSON.createObjectNode();
        root.put("issueKey", issue.getKey());
        root.putObject("_links").put("web", requestBaseUrl(request) + "/browse/" + issue.getKey());
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        JSON.writeValue(response.getWriter(), root);
    }

    public void sendJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        ObjectNode root = JSON.createObjectNode();
        root.put("error", message);
        JSON.writeValue(response.getWriter(), root);
    }

    public static String requestBaseUrl(HttpServletRequest request) {
        StringBuilder url = new StringBuilder();
        url.append(request.getScheme()).append("://").append(request.getServerName());
        boolean defaultPort = ("http".equals(request.getScheme()) && request.getServerPort() == 80)
                || ("https".equals(request.getScheme()) && request.getServerPort() == 443);
        if (!defaultPort) {
            url.append(':').append(request.getServerPort());
        }
        return url.append(request.getContextPath()).toString();
    }

    private RequestType loadRequestType(ApplicationUser user, int requestTypeId) {
        RequestTypeQuery query = requestTypeService.newQueryBuilder()
                .serviceDesk(SERVICE_DESK_ID)
                .requestType(requestTypeId)
                .requestOverrideSecurity(true)
                .build();
        return requestTypeService.getRequestTypes(user, query)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Request type " + requestTypeId + " was not found"));
    }
}
