package learn.unblock.models.dtos;

import learn.unblock.models.User;

import java.util.Objects;

public class UserWithoutPassword {
    private int id;
    private String username;

    public UserWithoutPassword() {
    }

    public static UserWithoutPassword fromUser(User user) {
        return new UserWithoutPassword(user.getId(), user.getUsername());
    }

    public UserWithoutPassword(int id, String username) {
        this.id = id;
        this.username = username;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        UserWithoutPassword that = (UserWithoutPassword) o;
        return id == that.id && Objects.equals(username, that.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, username);
    }
}
