package learn.unblock.data;

import learn.unblock.models.Card;

import java.util.List;

public interface CardRepository {
    Card create(Card card);
    Card findById(int id);
    List<Card> findByColumnId(int columnId);
    boolean update(Card card);
}