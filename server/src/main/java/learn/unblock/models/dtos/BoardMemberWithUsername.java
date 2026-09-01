package learn.unblock.models.dtos;

import learn.unblock.models.MemberRole;

public class BoardMemberWithUsername {
    private int userId;
    private String username;
    private MemberRole role;

    public BoardMemberWithUsername(int userId, String username, MemberRole role) {
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    public int getUserId() { return userId; }
    public String getUsername() { return username; }
    public MemberRole getRole() { return role; }
}