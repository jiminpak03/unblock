package learn.unblock.help;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Thin client for a locally-running Ollama server (https://ollama.com).
 * No Spring dependency, so it can be used both as a bean in the app and
 * standalone from {@link HelpDocIndexer}'s main method.
 */
public class OllamaClient {

    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    public OllamaClient(String baseUrl) {
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mapper = new ObjectMapper();
    }

    public float[] embed(String model, String text) throws IOException, InterruptedException {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("input", text);

        JsonNode root = post("/api/embed", body, Duration.ofMinutes(1));
        JsonNode vector = root.get("embeddings").get(0);

        float[] embedding = new float[vector.size()];
        for (int i = 0; i < vector.size(); i++) {
            embedding[i] = (float) vector.get(i).asDouble();
        }
        return embedding;
    }

    public String generate(String model, String prompt) throws IOException, InterruptedException {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("prompt", prompt);
        body.put("stream", false);

        JsonNode root = post("/api/generate", body, Duration.ofMinutes(3));
        return root.get("response").asText();
    }

    private JsonNode post(String path, ObjectNode body, Duration timeout) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .timeout(timeout)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException("Ollama request to " + path + " failed (" + response.statusCode() + "): " + response.body());
        }
        return mapper.readTree(response.body());
    }
}
