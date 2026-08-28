package learn.unblock.models;

import java.util.Objects;

public class CardCategory {
    private int id;
    private int boardId;
    private String name;
    private String color;

    public CardCategory() {
    }

    public CardCategory(int id, int boardId, String name, String color) {
        this.id = id;
        this.boardId = boardId;
        this.name = name;
        this.color = color;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getBoardId() { return boardId; }
    public void setBoardId(int boardId) { this.boardId = boardId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        CardCategory that = (CardCategory) o;
        return id == that.id && boardId == that.boardId && Objects.equals(name, that.name) && Objects.equals(color, that.color);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, boardId, name, color);
    }
}