package learn.unblock.help;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Standalone script: chunks the help docs, embeds each chunk via a local
 * Ollama server, and writes the result to a JSON index file that
 * {@link HelpVectorStore} loads at app startup.
 *
 * Run with: mvn compile exec:java@index-help-docs
 * Optional args: [docsDir] [outputPath] [ollamaBaseUrl] [embeddingModel]
 */
public class HelpDocIndexer {

    public static void main(String[] args) throws IOException, InterruptedException {
        String docsDir = args.length > 0 ? args[0] : "help-docs";
        String outputPath = args.length > 1 ? args[1] : "help-data/help-index.json";
        String ollamaBaseUrl = args.length > 2 ? args[2] : "http://localhost:11434";
        String embeddingModel = args.length > 3 ? args[3] : "nomic-embed-text";

        Path docsPath = Path.of(docsDir);
        if (!Files.isDirectory(docsPath)) {
            throw new IllegalArgumentException("Docs directory not found: " + docsPath.toAbsolutePath());
        }

        List<HelpChunk> chunks = HelpDocChunker.chunkDirectory(docsPath);
        System.out.println("Chunked " + chunks.size() + " pieces from " + docsPath.toAbsolutePath());

        OllamaClient ollama = new OllamaClient(ollamaBaseUrl);
        for (int i = 0; i < chunks.size(); i++) {
            HelpChunk chunk = chunks.get(i);
            chunk.setEmbedding(ollama.embed(embeddingModel, chunk.getContent()));
            System.out.println("Embedded " + (i + 1) + "/" + chunks.size() + ": " + chunk.getId());
        }

        Path outPath = Path.of(outputPath);
        Files.createDirectories(outPath.toAbsolutePath().getParent());
        new ObjectMapper()
                .enable(SerializationFeature.INDENT_OUTPUT)
                .writeValue(outPath.toFile(), chunks);

        System.out.println("Wrote index with " + chunks.size() + " chunks to " + outPath.toAbsolutePath());
    }
}
