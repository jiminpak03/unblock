package learn.unblock.data;

import java.util.List;

public interface CardDependencyRepository {
    boolean create(int cardId, int dependsOnCardId);
    boolean exists(int cardId, int dependsOnCardId);
    List<Integer> findDependencies(int cardId);        // cards this card depends on
    List<Integer> findUnblockedCardIds(int boardId);    // the actual differentiator query
}