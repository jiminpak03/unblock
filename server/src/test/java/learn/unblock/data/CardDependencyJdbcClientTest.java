package learn.unblock.data;

import learn.unblock.models.Card;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class CardDependencyJdbcClientRepositoryTest {

    @Autowired
    CardDependencyJdbcClientRepository repository;

    @Autowired
    CardJdbcClientRepository cardRepository;

    @Autowired
    JdbcClient jdbcClient;

    @BeforeEach
    void reset() {
        jdbcClient.sql("call set_known_good_state()").update();
    }

    @Test
    void shouldCreateAndFindDependency() {
        Card blocker = cardRepository.create(TestDataHelper.cardToCreate());
        Card blocked = cardRepository.create(TestDataHelper.cardToCreate());

        assertTrue(repository.create(blocked.getId(), blocker.getId()));

        List<Integer> deps = repository.findDependencies(blocked.getId());
        assertTrue(deps.contains(blocker.getId()));
    }

    @Test
    void shouldDetectExistingDependency() {
        Card blocker = cardRepository.create(TestDataHelper.cardToCreate());
        Card blocked = cardRepository.create(TestDataHelper.cardToCreate());
        repository.create(blocked.getId(), blocker.getId());

        assertTrue(repository.exists(blocked.getId(), blocker.getId()));
        assertFalse(repository.exists(blocker.getId(), blocked.getId()));
    }

    @Test
    void shouldDeleteDependency() {
        Card blocker = cardRepository.create(TestDataHelper.cardToCreate());
        Card blocked = cardRepository.create(TestDataHelper.cardToCreate());
        repository.create(blocked.getId(), blocker.getId());

        assertTrue(repository.delete(blocked.getId(), blocker.getId()));
        assertFalse(repository.exists(blocked.getId(), blocker.getId()));
    }

    @Test
    void blockedCardShouldNotBeUnblocked() {
        Card blocker = cardRepository.create(TestDataHelper.cardToCreate());
        Card blocked = cardRepository.create(TestDataHelper.cardToCreate());
        repository.create(blocked.getId(), blocker.getId());

        List<Integer> unblocked = repository.findUnblockedCardIds(1);
        assertFalse(unblocked.contains(blocked.getId()));
    }

    @Test
    void cardShouldUnblockWhenBlockerCompletes() {
        Card blocker = cardRepository.create(TestDataHelper.cardToCreate());
        Card blocked = cardRepository.create(TestDataHelper.cardToCreate());
        repository.create(blocked.getId(), blocker.getId());

        blocker.setComplete(true);
        cardRepository.update(blocker);

        List<Integer> unblocked = repository.findUnblockedCardIds(1);
        assertTrue(unblocked.contains(blocked.getId()));
    }
}