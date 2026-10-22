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
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Creates JSM network-folder requests from the Supportal form. */
public final class NetworkFolderRequestHandler {
    private static final int REQUEST_TYPE_ID = 350;
    private static final String READ_ACCESS_OBJECT_KEY = "LS-44105";
    private static final String WRITE_ACCESS_OBJECT_KEY = "LS-44106";
    private static final String SUMMARY = "Access to network folder";
    private static final String CMDB_OBJECT_KEY = "IS-93334";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final CustomerRequestSupport requestSupport;
    private final AssetsClient assetsClient;
    private final SupportalLogger logger;

    public NetworkFolderRequestHandler(CustomerRequestSupport requestSupport,
                                       AssetsClient assetsClient,
                                       SupportalLogger logger) {
        this.requestSupport = requestSupport;
        this.assetsClient = assetsClient;
        this.logger = logger;
    }

    public void handle(ApplicationUser requestingUser,
                       HttpServletRequest request,
                       HttpServletResponse response) throws IOException {
        JsonNode payload = JSON.readTree(request.getInputStream());
        String requestedForUserName = textValue(payload, "requestedForUserName").trim();
        String folderPath = textValue(payload, "folderPath").trim();
        String access = textValue(payload, "access").trim().toLowerCase(Locale.ROOT);
        String selectedAccessObjectKey = textValue(payload, "selectedAccessObjectKey").trim();
        String selectedAccessObjectLabel = textValue(payload, "selectedAccessObjectLabel").trim();
        String description = textValue(payload, "description").trim();
        String selectedPathKey = textValue(payload, "selectedPathKey").trim();

        logger.info("Network-folder submit received user=" + requestingUser.getUsername()
                + " requestedFor=" + JsonSupport.quote(requestedForUserName)
                + " folderPath=" + JsonSupport.quote(folderPath)
                + " access=" + JsonSupport.quote(access)
                + " accessObjectKey=" + JsonSupport.quote(selectedAccessObjectKey)
                + " selectedPathKey=" + JsonSupport.quote(selectedPathKey));

        if (requestedForUserName.isEmpty()
                || folderPath.isEmpty()
                || (!"read".equals(access) && !"write".equals(access))) {
            requestSupport.sendJsonError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid network-folder request payload");
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
            requestSupport.logCreateMeta("Network-folder", createMeta);

            AssetsClient.AssetObject accessLevel;
            if (!selectedAccessObjectKey.isEmpty()) {
                accessLevel = new AssetsClient.AssetObject(
                        selectedAccessObjectKey,
                        selectedAccessObjectLabel.isEmpty() ? access : selectedAccessObjectLabel);
                logger.info("Network-folder access resolved from frontend user="
                        + requestingUser.getUsername()
                        + " requestedAccess=" + JsonSupport.quote(access)
                        + " objectKey=" + JsonSupport.quote(accessLevel.key())
                        + " label=" + JsonSupport.quote(accessLevel.label()));
            } else {
                accessLevel = fallbackAccessLevel(access);
                if (accessLevel != null) {
                    logger.warn("Network-folder access key missing from frontend; using built-in fallback"
                            + " user=" + requestingUser.getUsername()
                            + " requestedAccess=" + JsonSupport.quote(access)
                            + " objectKey=" + JsonSupport.quote(accessLevel.key()));
                } else {
                    logger.info("Network-folder access lookup starting user="
                            + requestingUser.getUsername()
                            + " requestedAccess=" + JsonSupport.quote(access));
                    accessLevel = resolveAccessLevel(requestingUser, request, access);
                }
            }
            if (accessLevel == null) {
                logger.warn("Network-folder access lookup failed user=" + requestingUser.getUsername()
                        + " requestedAccess=" + JsonSupport.quote(access));
                requestSupport.sendJsonError(
                        response,
                        HttpServletResponse.SC_CONFLICT,
                        "Supportal could not resolve the Assets Access level object.");
                return;
            }

            Map<FieldId, FieldInputValue> fieldValues =
                    buildFieldValues(createMeta, requestedForUserName, folderPath, access, accessLevel,
                            description, selectedPathKey);
            CustomerRequest created =
                    requestSupport.create(requestingUser, REQUEST_TYPE_ID, fieldValues, requestedForUserName);
            Issue issue = created.getIssue();
            requestSupport.assignToMidpointAgent(requestingUser, issue, "Network-folder");
            logger.info("Network-folder submit succeeded user=" + requestingUser.getUsername()
                    + " issueKey=" + JsonSupport.quote(issue.getKey())
                    + " accessObjectKey=" + JsonSupport.quote(accessLevel.key()));
            requestSupport.writeCreatedRequest(request, response, issue);
        } catch (Exception e) {
            logger.error("Network-folder submit failed user=" + requestingUser.getUsername()
                    + " folderPath=" + JsonSupport.quote(folderPath), e);
            requestSupport.sendJsonError(
                    response,
                    HttpServletResponse.SC_BAD_GATEWAY,
                    "Network-folder request failed.");
        }
    }

    private Map<FieldId, FieldInputValue> buildFieldValues(
            CustomerRequestCreateMeta createMeta,
            String requestedForUserName,
            String folderPath,
            String requestedAccess,
            AssetsClient.AssetObject accessLevel,
            String description,
            String selectedPathKey) {
        Map<FieldId, FieldInputValue> fieldValues = new HashMap<>();
        if (requestSupport.hasField(createMeta, "summary")) {
            fieldValues.put(FieldId.withId("summary"), FieldInputValue.withValue(SUMMARY));
        } else {
            logger.warn("Network-folder summary not available on request type; skipping fixed summary");
        }
        fieldValues.put(
                FieldId.withId("customfield_16038"),
                FieldInputValue.withValue(Collections.singletonMap("name", requestedForUserName)));
        fieldValues.put(
                FieldId.withId("customfield_18315"),
                assetValue(accessLevel.key()));
        if (requestSupport.hasField(createMeta, "customfield_17313")) {
            fieldValues.put(FieldId.withId("customfield_17313"), assetValue(CMDB_OBJECT_KEY));
        }

        String permission = accessLevel.label() == null || accessLevel.label().trim().isEmpty()
                ? requestedAccess
                : accessLevel.label().trim();
        String generatedDescription = "Please grant [~" + requestedForUserName + "] "
                + permission + " access to {{" + folderPath + "}}.";
        fieldValues.put(
                FieldId.withId("description"),
                FieldInputValue.withValue(description.isEmpty() ? generatedDescription : description));

        if (!selectedPathKey.isEmpty()) {
            fieldValues.put(FieldId.withId("customfield_18316"), assetValue(selectedPathKey));
            logger.info("Network-folder path object accepted user=" + requestedForUserName
                    + " pathObjectKey=" + JsonSupport.quote(selectedPathKey));
        } else {
            fieldValues.put(
                    FieldId.withId("customfield_18312"),
                    FieldInputValue.withValue(Collections.singletonList(
                            Collections.singletonMap("id", "18841"))));
            fieldValues.put(
                    FieldId.withId("customfield_18313"),
                    FieldInputValue.withValue(folderPath));
            logger.warn("Network-folder submit missing path object, using fallback fields user="
                    + requestedForUserName
                    + " folderPath=" + JsonSupport.quote(folderPath));
        }
        return fieldValues;
    }

    private FieldInputValue assetValue(String key) {
        return FieldInputValue.withValue(
                Collections.singletonList(Collections.singletonMap("key", key)));
    }

    private AssetsClient.AssetObject resolveAccessLevel(ApplicationUser user,
                                                        HttpServletRequest request,
                                                        String wantedAccess) throws IOException {
        List<String> typeNames =
                List.of("Access level", "Access Level", "Network folder access level");
        for (String typeName : typeNames) {
            List<AssetsClient.AssetObject> objects = assetsClient.loadObjects(request, typeName, 100);
            logger.info("Network-folder access lookup type=" + JsonSupport.quote(typeName)
                    + " count=" + objects.size()
                    + " requested=" + JsonSupport.quote(wantedAccess)
                    + " user=" + user.getUsername());
            for (AssetsClient.AssetObject object : objects) {
                if (matchesAccessLabel(object.label(), wantedAccess)) {
                    logger.info("Network-folder access matched type=" + JsonSupport.quote(typeName)
                            + " objectKey=" + JsonSupport.quote(object.key())
                            + " label=" + JsonSupport.quote(object.label()));
                    return object;
                }
            }
        }
        return null;
    }

    private AssetsClient.AssetObject fallbackAccessLevel(String wantedAccess) {
        if ("read".equals(wantedAccess)) {
            return new AssetsClient.AssetObject(READ_ACCESS_OBJECT_KEY, "READ");
        }
        if ("write".equals(wantedAccess)) {
            return new AssetsClient.AssetObject(WRITE_ACCESS_OBJECT_KEY, "WRITE");
        }
        return null;
    }

    boolean matchesAccessLabel(String label, String wantedAccess) {
        String normalized = normalizeLookup(label);
        for (String alias : accessAliases(wantedAccess)) {
            if (normalized.contains(normalizeLookup(alias))) {
                return true;
            }
        }
        return false;
    }

    private List<String> accessAliases(String wantedAccess) {
        if ("read".equals(wantedAccess)) {
            return List.of("read", "readonly", "read only", "ro", "lugemine", "loetav", "чтение");
        }
        if ("write".equals(wantedAccess)) {
            return List.of("write", "readwrite", "read write", "rw", "modify", "change", "edit",
                    "kirjutamine", "muutmine", "запись");
        }
        return List.of(wantedAccess);
    }

    private String normalizeLookup(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT)
                .replace("ü", "u")
                .replace("ö", "o")
                .replace("ä", "a")
                .replace("õ", "o")
                .replace("š", "s")
                .replace("ž", "z")
                .replaceAll("[^a-z0-9]+", "");
    }

    private String textValue(JsonNode node, String fieldName) {
        JsonNode value = node == null ? null : node.get(fieldName);
        return value == null || value.isNull() ? "" : value.asText("");
    }
}
