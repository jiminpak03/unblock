package learn.unblock.data;

import learn.unblock.data.mappers.UserMapper;
import learn.unblock.models.User;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UserJdbcClientRepository implements UserRepository {
    private final JdbcClient jdbcClient;

    public UserJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public User findByUsername(String username) throws DataAccessException{
        final String sql = "select * from user where username = ?";
        return jdbcClient.sql(sql)
                .param(username)
                .query(new UserMapper())
                .optional().orElse(null);
    }

    @Override
    public User create(User user) throws DataAccessException{
        final String sql = """
                insert into user (username, password_hash)
                values (:username, :password_hash)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("username", user.getUsername())
                .param("password_hash", user.getPassword())
                .update(keyHolder, "id");

        if (rowsAffected == 0) {
            return null;
        }

        user.setId(keyHolder.getKey().intValue());

        return user;
    }
}
