package learn.unblock.models;

import java.time.LocalDateTime;
import java.util.Objects;

public class Board {
    private int id;
    private String name;
    private int ownerId;
    private LocalDateTime createdDate;

    public Board() {
    }

    public Board(int id, String name, int ownerId, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.createdDate = createdDate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Board board = (Board) o;
        return id == board.id && ownerId == board.ownerId && Objects.equals(name, board.name) && Objects.equals(createdDate, board.createdDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, ownerId, createdDate);
    }
}