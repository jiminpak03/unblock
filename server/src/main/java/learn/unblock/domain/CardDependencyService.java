package learn.unblock.domain;

import learn.unblock.data.CardDependencyRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CardDependencyService {
    private final CardDependencyRepository repository;

    public CardDependencyService(CardDependencyRepository repository) {
        this.repository = repository;
    }

    public Result<Void> addDependency(int cardId, int dependsOnCardId) {
        Result<Void> result = new Result<>();

        if (cardId == dependsOnCardId) {
            result.addErrorMessage("A card cannot depend on itself.", ResultType.INVALID);
            return result;
        }

        if (wouldCreateCycle(cardId, dependsOnCardId)) {
            result.addErrorMessage("This would create a circular dependency.", ResultType.INVALID);
            return result;
        }

        repository.create(cardId, dependsOnCardId);
        return result;
    }

    private boolean wouldCreateCycle(int cardId, int dependsOnCardId) {
        List<Integer> toCheck = new ArrayList<>();
        toCheck.add(dependsOnCardId);

        while (!toCheck.isEmpty()) {
            int current = toCheck.remove(0);
            if (current == cardId) {
                return true;
            }
            toCheck.addAll(repository.findDependencies(current));
        }
        return false;
    }
}