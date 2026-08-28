package learn.unblock.models;

public enum MemberRole {
    VIEWER(1), EDITOR(2), OWNER(3);

    private final int level;

    MemberRole(int level) {
        this.level = level;
    }

    public boolean atLeast(MemberRole required) {
        return this.level >= required.level;
    }
}