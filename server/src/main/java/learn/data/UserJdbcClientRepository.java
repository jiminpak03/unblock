package learn.data;

import learn.data.mappers.UserMapper;
import learn.models.User;
import org.springframework.jdbc.core.simple.JdbcClient;

public class UserJdbcClientRepository implements UserRepository {
    private JdbcClient jdbcClient;

    @Override
    public User findByUsername(String username) {
        final String sql = "select * from user where username = ?";
        return jdbcClient.sql(sql)
                .param(username)
                .query(new UserMapper())
                .optional().orElse(null);
    }

    @Override
    public User create(User user) {
        return null;
    }
}
