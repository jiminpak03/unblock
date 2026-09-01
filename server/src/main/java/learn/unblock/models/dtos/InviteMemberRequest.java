package learn.unblock.models.dtos;

import learn.unblock.models.MemberRole;

import java.util.Objects;

public class InviteMemberRequest {
    private String username;
    private MemberRole role;

    public InviteMemberRequest(String username, MemberRole role) {
        this.username = username;
        this.role = role;
    }

    public InviteMemberRequest(){}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
        InviteMemberRequest that = (InviteMemberRequest) o;
        return Objects.equals(username, that.username) && role == that.role;
    }

    @Override
    public int hashCode() {
        return Objects.hash(username, role);
    }
}
