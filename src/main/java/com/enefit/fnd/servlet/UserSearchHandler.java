package com.enefit.fnd.servlet;

import com.atlassian.jira.bc.user.search.UserSearchParams;
import com.atlassian.jira.bc.user.search.UserSearchService;
import com.atlassian.jira.user.ApplicationUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/** Handles Supportal's active Jira-user search endpoint. */
public final class UserSearchHandler {
    private static final int SEARCH_LIMIT = 50;
    private static final int MIN_QUERY_LENGTH = 2;
    private static final ObjectMapper JSON = new ObjectMapper();

    private final UserSearchService userSearchService;
    private final SupportalLogger logger;

    public UserSearchHandler(UserSearchService userSearchService, SupportalLogger logger) {
        this.userSearchService = userSearchService;
        this.logger = logger;
    }

    public void handle(ApplicationUser requestingUser,
                       HttpServletRequest request,
                       HttpServletResponse response) throws IOException {
        String query = request.getParameter("query");
        query = query == null ? "" : query.trim();

        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");

        if (query.length() < MIN_QUERY_LENGTH) {
            logger.info("User search skipped user=" + requestingUser.getUsername()
                    + " queryLength=" + query.length());
            response.getWriter().write("[]");
            return;
        }

        UserSearchParams params = UserSearchParams.builder(SEARCH_LIMIT)
                .allowEmptyQuery(false)
                .includeActive(true)
                .includeInactive(false)
                .canMatchEmail(true)
                .ignorePermissionCheck(true)
                .forceStrongConsistency(true)
                .sorted(true)
                .build();
        List<ApplicationUser> users = userSearchService.findUsers(query, params);
        logger.info("User search completed user=" + requestingUser.getUsername()
                + " query=" + JsonSupport.quote(query)
                + " matches=" + users.size());

        ArrayNode result = JSON.createArrayNode();
        for (ApplicationUser found : users) {
            if (found == null || found.getUsername() == null) {
                continue;
            }
            ObjectNode item = result.addObject();
            item.put("name", found.getUsername());
            item.put("displayName", found.getDisplayName());
            item.put("emailAddress", found.getEmailAddress());
        }
        JSON.writeValue(response.getWriter(), result);
    }
}
