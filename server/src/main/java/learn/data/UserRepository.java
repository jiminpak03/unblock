package learn.data;

import learn.models.User;

public interface UserRepository {
    User findByUsername(String username) throws DataAccessException;

    User create(User user) throws DataAccessException;
}
