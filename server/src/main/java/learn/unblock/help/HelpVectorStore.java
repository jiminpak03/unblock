package learn.unblock.help;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class HelpVectorStore {

    private final String indexPath;
    private List<HelpChunk> chunks = new ArrayList<>();

    public HelpVectorStore(@Value("${help.index-path}") String indexPath) {
        this.indexPath = indexPath;
    }

    @PostConstruct
    public void load() throws IOException {
        File file = new File(indexPath);
        if (!file.exists()) {
            System.out.println("No help index found at " + file.getAbsolutePath()
                    + " - run HelpDocIndexer first (mvn compile exec:java@index-help-docs).");
            return;
        }
        ObjectMapper mapper = new ObjectMapper();
        chunks = mapper.readValue(file, mapper.getTypeFactory().constructCollectionType(List.class, HelpChunk.class));
        System.out.println("Loaded " + chunks.size() + " help chunks from " + file.getAbsolutePath());
    }

    public List<HelpChunk> topK(float[] queryEmbedding, int k) {
        return chunks.stream()
                .sorted(Comparator.comparingDouble((HelpChunk c) -> cosineSimilarity(c.getEmbedding(), queryEmbedding)).reversed())
                .limit(k)
                .toList();
    }

    private double cosineSimilarity(float[] a, float[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
