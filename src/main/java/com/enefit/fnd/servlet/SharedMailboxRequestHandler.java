package com.enefit.fnd.servlet;

import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.servicedesk.api.field.CustomerRequestCreateMeta;
import com.atlassian.servicedesk.api.field.FieldId;
import com.atlassian.servicedesk.api.field.FieldInputValue;
import com.atlassian.servicedesk.api.request.CustomerRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/** Creates JSM shared-mailbox requests from the Supportal form. */
public final class SharedMailboxRequestHandler {
    private static final int REQUEST_TYPE_ID = 351;
    private static final String EXCHANGE_ONLINE_OBJECT_KEY = "IS-16288";
    private static final String SUMMARY = "Access to shared mailbox or distribution list";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final CustomerRequestSupport requestSupport;
    private final SupportalLogger logger;

    public SharedMailboxRequestHandler(CustomerRequestSupport requestSupport,
                                       SupportalLogger logger) {
        this.requestSupport = requestSupport;
        this.logger = logger;
    }

    public void handle(ApplicationUser requestingUser,
                       HttpServletRequest request,
                       HttpServletResponse response) throws IOException {
        JsonNode payload = JSON.readTree(request.getInputStream());
        String requestedForUserName = textValue(payload, "requestedForUserName").trim();
        String mailboxObjectKey = textValue(payload, "mailboxObjectKey").trim();
        String mailboxLabel = textValue(payload, "mailboxLabel").trim();
        String mailboxRole = textValue(payload, "mailboxRole").trim();
        String description = textValue(payload, "description").trim();

        logger.info("Shared-mailbox submit received user=" + requestingUser.getUsername()
                + " requestedFor=" + JsonSupport.quote(requestedForUserName)
                + " mailboxObjectKey=" + JsonSupport.quote(mailboxObjectKey)
                + " mailboxLabel=" + JsonSupport.quote(mailboxLabel)
                + " mailboxRole=" + JsonSupport.quote(mailboxRole));

        if (requestedForUserName.isEmpty()
                || mailboxObjectKey.isEmpty()
                || mailboxLabel.isEmpty()
                || mailboxRole.isEmpty()) {
            requestSupport.sendJsonError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid shared-mailbox request payload");
            return;
        }

        ApplicationUser requestedFor =
                requestSupport.requireActiveRequestedFor(requestedForUserName, response);
        if (requestedFor == null) {
            return;
        }
        requestedForUserName = requestedFor.getUsername();

        try {
            CustomerRequestCreateMeta createMeta =
                    requestSupport.createMeta(requestingUser, REQUEST_TYPE_ID);
            requestSupport.logCreateMeta("Shared-mailbox", createMeta);
            Map<FieldId, FieldInputValue> fieldValues =
                    buildFieldValues(createMeta, requestedForUserName, mailboxObjectKey,
                            mailboxLabel, mailboxRole, description);

            CustomerRequest created =
                    requestSupport.create(requestingUser, REQUEST_TYPE_ID, fieldValues, requestedForUserName);
            Issue issue = created.getIssue();
            requestSupport.assignToMidpointAgent(requestingUser, issue, "Shared-mailbox");
            logger.info("Shared-mailbox submit succeeded user=" + requestingUser.getUsername()
                    + " issueKey=" + JsonSupport.quote(issue.getKey())
                    + " mailboxObjectKey=" + JsonSupport.quote(mailboxObjectKey)
                    + " mailboxRole=" + JsonSupport.quote(mailboxRole));
            requestSupport.writeCreatedRequest(request, response, issue);
        } catch (Exception e) {
            logger.error("Shared-mailbox submit failed user=" + requestingUser.getUsername()
                    + " mailboxObjectKey=" + JsonSupport.quote(mailboxObjectKey)
                    + " mailboxLabel=" + JsonSupport.quote(mailboxLabel), e);
            requestSupport.sendJsonError(
                    response,
                    HttpServletResponse.SC_BAD_GATEWAY,
                    "Shared-mailbox request failed.");
        }
    }

    private Map<FieldId, FieldInputValue> buildFieldValues(
            CustomerRequestCreateMeta createMeta,
            String requestedForUserName,
            String mailboxObjectKey,
            String mailboxLabel,
            String mailboxRole,
            String description) {
        Map<FieldId, FieldInputValue> fieldValues = new HashMap<>();
        if (requestSupport.hasField(createMeta, "summary")) {
            fieldValues.put(FieldId.withId("summary"), FieldInputValue.withValue(SUMMARY));
        } else {
            logger.warn("Shared-mailbox summary not available on request type; skipping fixed summary");
        }
        fieldValues.put(
                FieldId.withId("customfield_16038"),
                FieldInputValue.withValue(Collections.singletonMap("name", requestedForUserName)));
        fieldValues.put(FieldId.withId("customfield_28714"), assetValue(mailboxObjectKey));
        fieldValues.put(
                FieldId.withId("customfield_28715"),
                FieldInputValue.withValue(Collections.singletonMap("value", mailboxRole)));

        if (requestSupport.hasField(createMeta, "customfield_17313")) {
            fieldValues.put(FieldId.withId("customfield_17313"), assetValue(EXCHANGE_ONLINE_OBJECT_KEY));
        }

        String generatedDescription = "Please grant [~" + requestedForUserName + "] "
                + mailboxRole + " access to {{" + mailboxLabel + "}}.";
        fieldValues.put(
                FieldId.withId("description"),
                FieldInputValue.withValue(description.isEmpty() ? generatedDescription : description));
        return fieldValues;
    }

    private FieldInputValue assetValue(String key) {
        return FieldInputValue.withValue(
                Collections.singletonList(Collections.singletonMap("key", key)));
    }

    private String textValue(JsonNode node, String fieldName) {
        JsonNode value = node == null ? null : node.get(fieldName);
        return value == null || value.isNull() ? "" : value.asText("");
    }
}
