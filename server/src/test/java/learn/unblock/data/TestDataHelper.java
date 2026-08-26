package learn.unblock.data;

import learn.unblock.models.User;

import java.time.LocalDateTime;

public class TestDataHelper {
    public static User existingUser() {
        return new User(1, "mallardmike", "$2a$10$uv9Tais/NKO0IBLj3HryEedbo6OnRrJm.FJL4FG/N6Etz9dQpzbFm", LocalDateTime.of(2026, 1, 1, 10, 0, 0));
    }

    public static User userToCreate() {
        return new User(0, "test", "testtest", LocalDateTime.of(2020, 12, 12, 10, 0, 0));
    }

    public static User userAfterCreate() {
        User user = userToCreate();
        user.setId(3);
        return user;
    }
}
