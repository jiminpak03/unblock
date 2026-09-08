package learn.unblock.data;

import learn.unblock.models.Board;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.Card;
import learn.unblock.models.CardCategory;
import learn.unblock.models.User;

public class TestDataHelper {

    public static final String KNOWN_PASSWORD = "password123";

    public static User existingUser() {
        User user = new User();
        user.setId(1);
        user.setUsername("mallardmike");
        return user;
    }

    public static User userToCreate() {
        User user = new User();
        user.setUsername("newuser");
        user.setPassword("some-hashed-string");
        return user;
    }

    public static User userAfterCreate() {
        User user = new User();
        user.setId(4);
        user.setUsername("newuser");
        user.setPassword("some-hashed-string");
        return user;
    }

    public static Board boardToCreate() {
        Board board = new Board();
        board.setName("Test Board");
        board.setOwnerId(1);
        return board;
    }

    public static BoardColumn columnToCreate() {
        BoardColumn column = new BoardColumn();
        column.setBoardId(1);
        column.setName("Test Column");
        column.setPosition(3);
        return column;
    }

    public static CardCategory categoryToCreate() {
        CardCategory category = new CardCategory();
        category.setBoardId(1);
        category.setName("Programming");
        category.setColor("#8b5cf6");
        return category;
    }

    public static Card cardToCreate() {
        Card card = new Card();
        card.setColumnId(1);
        card.setTitle("Test Card");
        card.setDescription("A test card.");
        card.setComplete(false);
        card.setPosition(0);
        return card;
    }
}