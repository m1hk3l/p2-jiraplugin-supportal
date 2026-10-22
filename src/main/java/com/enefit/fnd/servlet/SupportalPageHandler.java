package com.enefit.fnd.servlet;

import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.UrlMode;
import com.atlassian.webresource.api.assembler.WebResourceAssembler;
import com.atlassian.webresource.api.assembler.WebResourceAssemblerFactory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/** Convention router and renderer for Supportal's server-rendered pages. */
public final class SupportalPageHandler {
    private static final String TEMPLATE_BASE = "/templates/supportal";
    private static final String TEMPLATE_SUFFIX = ".vm";
    private static final String INDEX_SUFFIX = "/index.vm";
    private static final String DEFAULT_PATH = "/home";
    private static final Pattern SAFE_SEGMENT = Pattern.compile("[a-z0-9-]+");
    private static final String AMD_LOADER_RESOURCE = "jira.webresources:almond";
    private static final String REACT_ENTRYPOINT_RESOURCE =
            "com.enefit.fnd.supportal:entrypoint-supportal-react";

    private final TemplateRenderer templateRenderer;
    private final WebResourceAssemblerFactory webResourceAssemblerFactory;
    private final SupportalLogger logger;

    public SupportalPageHandler(TemplateRenderer templateRenderer,
                                WebResourceAssemblerFactory webResourceAssemblerFactory,
                                SupportalLogger logger) {
        this.templateRenderer = templateRenderer;
        this.webResourceAssemblerFactory = webResourceAssemblerFactory;
        this.logger = logger;
    }

    public void handle(ApplicationUser user,
                       HttpServletRequest request,
                       HttpServletResponse response) throws IOException {
        String path = request.getPathInfo();
        if (path == null || "/".equals(path)) {
            path = DEFAULT_PATH;
        }

        String base = resolveTemplateBase(path);
        if (base == null) {
            logger.warn("Rejected unsafe Supportal path user=" + user.getUsername()
                    + " path=" + safePath(path));
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String template = resolveTemplate(base);
        if (template == null) {
            logger.warn("Supportal template not found user=" + user.getUsername()
                    + " path=" + safePath(path));
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        if (!isAuthorized(user, path)) {
            logger.warn("Forbidden Supportal page user=" + user.getUsername()
                    + " path=" + safePath(path));
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        logger.info("Rendering Supportal page user=" + user.getUsername()
                + " path=" + safePath(path)
                + " template=" + template);
        renderPage(template, user, request, response);
    }

    String resolveTemplateBase(String pathInfo) {
        StringBuilder base = new StringBuilder(TEMPLATE_BASE);
        boolean hasSegment = false;
        for (String segment : pathInfo.split("/")) {
            if (segment.isEmpty()) {
                continue;
            }
            if (!SAFE_SEGMENT.matcher(segment).matches()) {
                return null;
            }
            base.append('/').append(segment);
            hasSegment = true;
        }
        return hasSegment ? base.toString() : null;
    }

    String[] templateCandidates(String base) {
        String leaf = base.substring(base.lastIndexOf('/') + 1);
        return new String[]{
                base + TEMPLATE_SUFFIX,
                base + INDEX_SUFFIX,
                base + "/" + leaf + TEMPLATE_SUFFIX
        };
    }

    private String resolveTemplate(String base) {
        for (String candidate : templateCandidates(base)) {
            if (templateRenderer.resolve(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private boolean isAuthorized(ApplicationUser user, String path) {
        return true;
    }

    private void renderPage(String template,
                            ApplicationUser user,
                            HttpServletRequest request,
                            HttpServletResponse response) throws IOException {
        Map<String, Object> context = new HashMap<>();
        context.put("displayName", user.getDisplayName());
        context.put("baseUrl", request.getContextPath());
        context.put("currentPath", request.getPathInfo() == null ? "/" : request.getPathInfo());
        context.put("reactResourcesHtml", assembleReactResourceTags());

        response.setContentType("text/html;charset=UTF-8");
        templateRenderer.render(template, context, response.getWriter());
    }

    private String assembleReactResourceTags() {
        try {
            WebResourceAssembler assembler = webResourceAssemblerFactory.create()
                    .includeSuperbatchResources(false)
                    .build();
            assembler.resources()
                    .requireWebResource(AMD_LOADER_RESOURCE)
                    .requireWebResource(REACT_ENTRYPOINT_RESOURCE);
            StringWriter tags = new StringWriter();
            assembler.assembled().drainIncludedResources()
                    .writeHtmlTags(tags, UrlMode.AUTO);
            return tags.toString();
        } catch (RuntimeException e) {
            logger.error("Failed to assemble React web-resources", e);
            return "";
        }
    }

    private String safePath(String path) {
        return path == null ? "/" : path;
    }
}
