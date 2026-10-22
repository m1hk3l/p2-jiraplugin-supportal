package com.enefit.fnd.servlet;

import com.atlassian.annotations.security.UnrestrictedAccess;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.sal.api.auth.LoginUriProvider;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;

/**
 * Authenticated HTTP entry point for the Supportal URL space.
 *
 * <p>The servlet deliberately owns only the security boundary and dispatch.
 * Feature behavior lives in focused handlers injected by the plugin host
 * container.</p>
 */
@UnrestrictedAccess
public class SupportalServlet extends HttpServlet {
    private static final String USER_SEARCH_PATH = "/api/users";
    private static final String NETWORK_FOLDER_REQUEST_PATH = "/api/network-folder-request";
    private static final String SHARED_MAILBOX_REQUEST_PATH = "/api/shared-mailbox-request";

    private final JiraAuthenticationContext authenticationContext;
    private final LoginUriProvider loginUriProvider;
    private final SupportalPageHandler pageHandler;
    private final UserSearchHandler userSearchHandler;
    private final NetworkFolderRequestHandler networkFolderRequestHandler;
    private final SharedMailboxRequestHandler sharedMailboxRequestHandler;
    private final SupportalLogger logger;

    public SupportalServlet(JiraAuthenticationContext authenticationContext,
                            LoginUriProvider loginUriProvider,
                            SupportalPageHandler pageHandler,
                            UserSearchHandler userSearchHandler,
                            NetworkFolderRequestHandler networkFolderRequestHandler,
                            SharedMailboxRequestHandler sharedMailboxRequestHandler,
                            SupportalLogger logger) {
        this.authenticationContext = authenticationContext;
        this.loginUriProvider = loginUriProvider;
        this.pageHandler = pageHandler;
        this.userSearchHandler = userSearchHandler;
        this.networkFolderRequestHandler = networkFolderRequestHandler;
        this.sharedMailboxRequestHandler = sharedMailboxRequestHandler;
        this.logger = logger;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ApplicationUser user = authenticatedUser(request, response, "request");
        if (user == null) {
            return;
        }

        String path = request.getPathInfo();
        if (USER_SEARCH_PATH.equals(path)) {
            logger.info("Handling user-search request for user=" + user.getUsername()
                    + " path=" + safePath(path));
            userSearchHandler.handle(user, request, response);
            return;
        }
        pageHandler.handle(user, request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ApplicationUser user = authenticatedUser(request, response, "POST");
        if (user == null) {
            return;
        }

        String path = request.getPathInfo();
        if (NETWORK_FOLDER_REQUEST_PATH.equals(path)) {
            networkFolderRequestHandler.handle(user, request, response);
            return;
        }
        if (SHARED_MAILBOX_REQUEST_PATH.equals(path)) {
            sharedMailboxRequestHandler.handle(user, request, response);
            return;
        }
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    private ApplicationUser authenticatedUser(HttpServletRequest request,
                                              HttpServletResponse response,
                                              String requestKind) throws IOException {
        ApplicationUser user = authenticationContext.getLoggedInUser();
        if (user != null) {
            return user;
        }
        logger.warn("Anonymous " + requestKind + " redirected to login for path="
                + safePath(request.getPathInfo()));
        response.sendRedirect(loginUriProvider.getLoginUri(requestUri(request)).toASCIIString());
        return null;
    }

    private URI requestUri(HttpServletRequest request) {
        StringBuffer builder = request.getRequestURL();
        if (request.getQueryString() != null) {
            builder.append('?').append(request.getQueryString());
        }
        return URI.create(builder.toString());
    }

    private String safePath(String path) {
        return path == null ? "/" : path;
    }
}
