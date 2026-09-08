package learn.unblock.data;

import learn.unblock.models.CardCategory;
import java.util.List;

public interface CardCategoryRepository {
    CardCategory create(CardCategory category);
    List<CardCategory> findByBoardId(int boardId);
    boolean update(CardCategory category);
    boolean delete(int id);
}