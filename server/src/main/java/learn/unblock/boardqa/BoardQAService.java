package learn.unblock.boardqa;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.data.CardDependencyRepository;
import learn.unblock.data.CardRepository;
import learn.unblock.help.OllamaClient;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.Card;
import learn.unblock.models.dtos.GraphEdge;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BoardQAService {

    private final OllamaClient ollama;
    private final BoardColumnRepository columnRepository;
    private final CardRepository cardRepository;
    private final CardDependencyRepository dependencyRepository;
    private final String generationModel;

    public BoardQAService(OllamaClient ollama, BoardColumnRepository columnRepository,
                           CardRepository cardRepository, CardDependencyRepository dependencyRepository,
                           @Value("${ollama.generation-model}") String generationModel) {
        this.ollama = ollama;
        this.columnRepository = columnRepository;
        this.cardRepository = cardRepository;
        this.dependencyRepository = dependencyRepository;
        this.generationModel = generationModel;
    }

    public String ask(int boardId, String question) throws IOException, InterruptedException {
        String prompt = buildPrompt(boardId, question);
        return ollama.generate(generationModel, prompt).trim();
    }

    String buildPrompt(int boardId, String question) {
        List<BoardColumn> columns = columnRepository.findByBoardId(boardId);
        List<Card> cards = cardRepository.findByBoardId(boardId);
        List<GraphEdge> dependencies = dependencyRepository.findByBoardId(boardId);

        Map<Integer, String> cardTitles = cards.stream()
                .collect(Collectors.toMap(Card::getId, Card::getTitle));

        StringBuilder board = new StringBuilder();
        for (BoardColumn column : columns) {
            board.append("Column: ").append(column.getName()).append("\n");
            for (Card card : cards) {
                if (card.getColumnId() != column.getId()) continue;
                board.append("- [").append(card.isComplete() ? "x" : " ").append("] #")
                        .append(card.getId()).append(" ").append(card.getTitle())
                        .append("\n");
            }
        }

        if (!dependencies.isEmpty()) {
            board.append("\nDependencies (first card is blocked until the second is complete):\n");
            for (GraphEdge edge : dependencies) {
                String cardTitle = cardTitles.getOrDefault(edge.getCardId(), "#" + edge.getCardId());
                String blockerTitle = cardTitles.getOrDefault(edge.getDependsOnCardId(), "#" + edge.getDependsOnCardId());
                board.append("- ").append(cardTitle).append(" depends on ").append(blockerTitle).append("\n");
            }
        }

        return """
                You are an assistant answering questions about a specific project board.
                Use ONLY the board data below to answer. If the data doesn't contain the
                answer, say you don't know rather than guessing.

                Board data:
                %s
                Question: %s

                Answer:""".formatted(board, question);
    }
}
