package learn.unblock.models;

import java.util.Objects;

public class BoardMember {
    private int boardId;
    private int userId;
    private MemberRole role;

    public BoardMember() {
    }

    public BoardMember(int boardId, int userId, MemberRole role) {
        this.boardId = boardId;
        this.userId = userId;
        this.role = role;
    }

    public int getBoardId() {
        return boardId;
    }

    public void setBoardId(int boardId) {
        this.boardId = boardId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        BoardMember that = (BoardMember) o;
        return boardId == that.boardId && userId == that.userId && role == that.role;
    }

    @Override
    public int hashCode() {
        return Objects.hash(boardId, userId, role);
    }
}