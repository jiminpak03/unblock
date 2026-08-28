package learn.unblock.data;

import learn.unblock.data.mappers.BoardMemberMapper;
import learn.unblock.models.BoardMember;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BoardMemberJdbcClientRepository implements BoardMemberRepository{

    private final JdbcClient jdbcClient;

    public BoardMemberJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public BoardMember create(BoardMember member) {
        final String sql = """
            insert into board_member (board_id, user_id, role)
            values (:board_id, :user_id, :role)
            """;

        int rowsAffected = jdbcClient.sql(sql)
                .param("board_id", member.getBoardId())
                .param("user_id", member.getUserId())
                .param("role", member.getRole().toString())
                .update();

        if (rowsAffected == 0) {
            return null;
        } else {
            return member;
        }
    }

    @Override
    public BoardMember findByBoardIdAndUserId(int boardId, int userId) {
        final String sql = "select * from board_member where board_id = ? and user_id = ?";
        return jdbcClient.sql(sql)
                .param(boardId)
                .param(userId)
                .query(new BoardMemberMapper())
                .optional().orElse(null);
    }

    @Override
    public List<BoardMember> findByBoardId(int boardId) {
        final String sql = "select * from board_member where board_id = ?";
        return jdbcClient.sql(sql)
                .param(boardId)
                .query(new BoardMemberMapper())
                .list();
    }
}
