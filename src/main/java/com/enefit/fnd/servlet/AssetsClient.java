package com.enefit.fnd.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Same-instance HTTP adapter for the Assets API. */
public final class AssetsClient {
    private static final ObjectMapper JSON = new ObjectMapper();

    private final SupportalLogger logger;

    public AssetsClient(SupportalLogger logger) {
        this.logger = logger;
    }

    public List<AssetObject> loadObjects(HttpServletRequest request,
                                         String objectType,
                                         int perPage) throws IOException {
        String iql = "objectSchema = \"Public schema\" AND objectType = \""
                + objectType.replace("\"", "\\\"") + "\"";
        String url = CustomerRequestSupport.requestBaseUrl(request)
                + "/rest/insight/1.0/iql/objects?iql="
                + URLEncoder.encode(iql, StandardCharsets.UTF_8)
                + "&resultPerPage=" + perPage
                + "&includeAttributes=false";
        logger.info("Insight lookup request objectType=" + JsonSupport.quote(objectType)
                + " url=" + JsonSupport.quote(url));

        JsonNode root = requestJson(request, "GET", url);
        List<AssetObject> objects = new ArrayList<>();
        for (JsonNode entry : root.path("objectEntries")) {
            String key = entry.path("objectKey").asText("");
            String label = entry.path("label").asText(key);
            if (!key.isEmpty()) {
                objects.add(new AssetObject(key, label));
            }
        }
        return objects;
    }

    private JsonNode requestJson(HttpServletRequest request,
                                 String method,
                                 String url) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod(method);
        connection.setRequestProperty("Accept", "application/json");
        String cookie = request.getHeader("Cookie");
        if (cookie != null && !cookie.isEmpty()) {
            connection.setRequestProperty("Cookie", cookie);
        }
        String authorization = request.getHeader("Authorization");
        if (authorization != null && !authorization.isEmpty()) {
            connection.setRequestProperty("Authorization", authorization);
        }

        int status = connection.getResponseCode();
        InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String body = stream == null ? "" : new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        if (status >= 400) {
            logger.warn("Insight lookup HTTP failure status=" + status
                    + " url=" + JsonSupport.quote(url)
                    + " body=" + JsonSupport.quote(body));
            throw new IOException("HTTP " + status + " from " + url + ": " + body);
        }
        logger.info("Insight lookup HTTP success status=" + status
                + " url=" + JsonSupport.quote(url)
                + " bodyLength=" + body.length());
        return JSON.readTree(body);
    }

    public static final class AssetObject {
        private final String key;
        private final String label;

        public AssetObject(String key, String label) {
            this.key = key;
            this.label = label;
        }

        public String key() {
            return key;
        }

        public String label() {
            return label;
        }
    }
}
