package learn.data;
import learn.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserJdbcClientRepositoryTest {
    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private UserJdbcClientRepository repository;

    @BeforeEach
    void resetDb() {
        jdbcClient.sql("CALL set_known_good_state()").update();
    }

    @Test
    void findByUsername() throws DataAccessException {
        User existingUser = repository.findByUsername("mallardmike");

        assertEquals(existingUser, TestDataHelper.existingUser());
    }

    @Test
    void create() {
    }
}