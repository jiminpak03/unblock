package learn.unblock.data;

import learn.unblock.models.User;

public interface UserRepository {
    User findByUsername(String username) throws DataAccessException;

    User create(User user) throws DataAccessException;
}
