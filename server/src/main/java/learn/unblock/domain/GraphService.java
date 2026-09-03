package learn.unblock.domain;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.data.CardDependencyRepository;
import learn.unblock.data.CardRepository;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.Card;
import learn.unblock.models.dtos.GraphEdge;
import learn.unblock.models.dtos.GraphResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GraphService {
    private final CardRepository cardRepository;
    private final BoardColumnRepository columnRepository;
    private final CardDependencyRepository dependencyRepository;

    public GraphService(CardRepository cardRepository, BoardColumnRepository columnRepository,
                        CardDependencyRepository dependencyRepository) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.dependencyRepository = dependencyRepository;
    }

    public GraphResponse getGraph(int boardId) {
        List<BoardColumn> columnList = columnRepository.findByBoardId(boardId);
        List<Card> cardList = new ArrayList<>();
        for (BoardColumn column : columnList) {
            cardList.addAll(cardRepository.findByColumnId(column.getId()));
        }

        List<GraphEdge> edges = new ArrayList<>();
        for (Card card : cardList) {
            List<Integer> dependsOn = dependencyRepository.findDependencies(card.getId());
            for (int dependsOnId : dependsOn) {
                edges.add(new GraphEdge(card.getId(), dependsOnId));
            }
        }

        return new GraphResponse(cardList, edges);
    }
}