package learn.data;

import learn.models.User;

public interface UserRepository {
    User findByUsername(String username);

    User create(User user);
}
