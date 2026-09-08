package learn.unblock.data;

import learn.unblock.models.Card;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class CardJdbcClientRepositoryTest {

    @Autowired
    CardJdbcClientRepository repository;

    @Autowired
    JdbcClient jdbcClient;

    @BeforeEach
    void reset() {
        jdbcClient.sql("call set_known_good_state()").update();
    }

    @Test
    void shouldCreateAndFindById() {
        Card created = repository.create(TestDataHelper.cardToCreate());

        assertNotNull(created);
        assertTrue(created.getId() > 0);

        Card found = repository.findById(created.getId());
        assertEquals("Test Card", found.getTitle());
        assertFalse(found.isComplete());
    }

    @Test
    void shouldUpdateCard() {
        Card created = repository.create(TestDataHelper.cardToCreate());
        created.setTitle("Updated Title");
        created.setComplete(true);

        assertTrue(repository.update(created));

        Card found = repository.findById(created.getId());
        assertEquals("Updated Title", found.getTitle());
        assertTrue(found.isComplete());
    }

    @Test
    void shouldDeleteCard() {
        Card created = repository.create(TestDataHelper.cardToCreate());

        assertTrue(repository.delete(created.getId()));
        assertNull(repository.findById(created.getId()));
    }
}