package learn.unblock.data.mappers;

import learn.unblock.models.BoardMember;
import learn.unblock.models.MemberRole;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class BoardMemberMapper implements RowMapper<BoardMember> {
    @Override
    public BoardMember mapRow(ResultSet rs, int rowNum) throws SQLException {
        BoardMember member = new BoardMember();
        member.setBoardId(rs.getInt("board_id"));
        member.setUserId(rs.getInt("user_id"));
        member.setRole(MemberRole.valueOf(rs.getString("role")));
        return member;
    }
}