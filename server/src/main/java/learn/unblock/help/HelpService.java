package learn.unblock.help;

import learn.unblock.help.dtos.AskHelpResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HelpService {

    private static final int TOP_K = 4;

    private final OllamaClient ollama;
    private final HelpVectorStore vectorStore;
    private final String embeddingModel;
    private final String generationModel;

    public HelpService(OllamaClient ollama, HelpVectorStore vectorStore,
                        @Value("${ollama.embedding-model}") String embeddingModel,
                        @Value("${ollama.generation-model}") String generationModel) {
        this.ollama = ollama;
        this.vectorStore = vectorStore;
        this.embeddingModel = embeddingModel;
        this.generationModel = generationModel;
    }

    public AskHelpResponse ask(String question) throws IOException, InterruptedException {
        float[] questionEmbedding = ollama.embed(embeddingModel, question);
        List<HelpChunk> topChunks = vectorStore.topK(questionEmbedding, TOP_K);

        if (topChunks.isEmpty()) {
            return new AskHelpResponse(
                    "The help index hasn't been built yet, so I don't have any docs to search. Run HelpDocIndexer first.",
                    List.of());
        }

        String context = topChunks.stream()
                .map(c -> "Source: " + c.getSource() + "\n" + c.getContent())
                .collect(Collectors.joining("\n\n---\n\n"));

        String prompt = """
                You are a help assistant for the Unblocked app. Answer the user's question using ONLY the context below.
                If the context doesn't contain the answer, say you don't know rather than guessing.

                Context:
                %s

                Question: %s

                Answer:""".formatted(context, question);

        String answer = ollama.generate(generationModel, prompt);

        Set<String> sources = topChunks.stream()
                .map(HelpChunk::getSource)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return new AskHelpResponse(answer.trim(), List.copyOf(sources));
    }
}
