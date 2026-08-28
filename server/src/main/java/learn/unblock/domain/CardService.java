package learn.unblock.domain;

import learn.unblock.data.CardRepository;
import learn.unblock.models.Card;
import org.springframework.stereotype.Service;

@Service
public class CardService {
    private final CardRepository repository;

    public CardService(CardRepository repository) {
        this.repository = repository;
    }

    public Result<Card> create(int columnId, Integer categoryId, String title, String description) {
        Result<Card> result = new Result<>();

        if (title == null || title.isBlank()) {
            result.addErrorMessage("Card title cannot be blank", ResultType.INVALID);
            return result;
        }

        Card card = new Card();
        card.setColumnId(columnId);
        card.setCategoryId(categoryId);
        card.setTitle(title);
        card.setDescription(description);
        card.setComplete(false);
        card.setPosition(0);

        Card created = repository.create(card);
        result.setpayload(created);
        return result;
    }

    public Result<Card> update(Card card) {
        Result<Card> result = new Result<>();

        if (card.getTitle() == null || card.getTitle().isBlank()) {
            result.addErrorMessage("Card title cannot be blank", ResultType.INVALID);
            return result;
        }

        boolean success = repository.update(card);
        if (!success) {
            result.addErrorMessage("Card not found", ResultType.NOT_FOUND);
            return result;
        }

        result.setpayload(card);
        return result;
    }
}