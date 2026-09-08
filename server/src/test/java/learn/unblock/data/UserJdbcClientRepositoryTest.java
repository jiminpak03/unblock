package learn.unblock.data;

import learn.unblock.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserJdbcClientRepositoryTest {

    @Autowired
    UserJdbcClientRepository repository;

    @Autowired
    JdbcClient jdbcClient;

    @BeforeEach
    void reset() {
        jdbcClient.sql("call set_known_good_state()").update();
    }

    @Test
    void shouldFindExistingUserByUsername() throws DataAccessException {
        User user = repository.findByUsername("mallardmike");

        assertNotNull(user);
        assertEquals("mallardmike", user.getUsername());
        assertTrue(user.getId() > 0);
    }

    @Test
    void shouldReturnNullForMissingUsername() throws DataAccessException {
        assertNull(repository.findByUsername("nobody-here"));
    }

    @Test
    void shouldCreateUser() throws DataAccessException {
        User created = repository.create(TestDataHelper.userToCreate());

        assertNotNull(created);
        assertTrue(created.getId() > 0);
        assertEquals("newuser", created.getUsername());
    }
}