package learn.unblock.data;

import learn.unblock.models.dtos.GraphEdge;

import java.util.List;

public interface CardDependencyRepository {
    boolean create(int cardId, int dependsOnCardId);
    boolean exists(int cardId, int dependsOnCardId);
    List<Integer> findDependencies(int cardId);
    List<Integer> findUnblockedCardIds(int boardId);
    List<GraphEdge> findByBoardId(int boardId);
    boolean delete(int cardId, int dependsOnCardId);
}