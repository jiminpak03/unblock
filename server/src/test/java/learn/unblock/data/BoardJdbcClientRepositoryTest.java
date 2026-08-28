package learn.unblock.data;

import learn.unblock.models.Board;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class BoardJdbcClientRepositoryTest {
    @Autowired
    private BoardJdbcClientRepository repository;
    @Autowired private JdbcClient jdbcClient;

    @BeforeEach
    void reset() {
        jdbcClient.sql("call set_known_good_state()").update();
    }

    @Test
    void findById() {
        Board board = repository.findById(1);
        assertNotNull(board);
    }

    @Test
    void create() {
        Board toCreate = new Board();
        toCreate.setName("New Project");
        toCreate.setOwnerId(1);

        Board created = repository.create(toCreate);

        assertTrue(created.getId() > 0);
        assertEquals("New Project", created.getName());
    }
}