package com.enefit.fnd.servlet;

import com.atlassian.sal.api.ApplicationProperties;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Writes Supportal's dedicated daily log without coupling feature handlers to
 * the servlet lifecycle.
 */
public final class SupportalLogger {
    private static final Object LOG_LOCK = new Object();
    private static final DateTimeFormatter TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS XXX");

    private final ApplicationProperties applicationProperties;

    public SupportalLogger(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public void info(String message) {
        write("INFO", message, null);
    }

    public void warn(String message) {
        write("WARN", message, null);
    }

    public void error(String message, Throwable error) {
        write("ERROR", message, error);
    }

    private void write(String level, String message, Throwable error) {
        synchronized (LOG_LOCK) {
            try {
                String home = applicationProperties != null && applicationProperties.getHomeDirectory() != null
                        ? applicationProperties.getHomeDirectory().toString()
                        : null;
                if (home == null || home.trim().isEmpty()) {
                    return;
                }
                Path logDir = Paths.get(home, "log");
                Files.createDirectories(logDir);
                Path file = logDir.resolve("supportal-" + LocalDate.now() + ".log");
                try (BufferedWriter writer = Files.newBufferedWriter(
                        file,
                        StandardCharsets.UTF_8,
                        StandardOpenOption.CREATE,
                        StandardOpenOption.WRITE,
                        StandardOpenOption.APPEND)) {
                    writer.write(TIMESTAMP.format(ZonedDateTime.now())
                            + " [" + level + "] "
                            + message);
                    writer.newLine();
                    if (error != null) {
                        StringWriter stack = new StringWriter();
                        error.printStackTrace(new PrintWriter(stack));
                        writer.write(stack.toString());
                        if (!stack.toString().endsWith(System.lineSeparator())) {
                            writer.newLine();
                        }
                    }
                }
            } catch (IOException ioe) {
                System.err.println("Supportal: failed to write custom log file");
                ioe.printStackTrace(System.err);
            }
        }
    }
}
