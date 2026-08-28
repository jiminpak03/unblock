package learn.unblock.data;

import learn.unblock.data.mappers.BoardMapper;
import learn.unblock.models.Board;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BoardJdbcClientRepository implements BoardRepository {
    private final JdbcClient jdbcClient;

    public BoardJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public Board findById(int id) {
        final String sql = "select * from board where id = ?";

        return jdbcClient.sql(sql)
                .param(id)
                .query(new BoardMapper())
                .optional().orElse(null);
    }

    @Override
    public Board create(Board board) {
        final String sql = """
                insert into board (name, owner_id)
                values (:name, :owner_id)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("name", board.getName())
                .param("owner_id", board.getOwnerId())
                .update(keyHolder, "id");

        if (rowsAffected == 0) {
            return null;
        }

        board.setId(keyHolder.getKey().intValue());

        return board;
    }

    @Override
    public List<Board> findByUserId(int userId) {
        final String sql = """
            select b.*
            from board b
            join board_member bm on bm.board_id = b.id
            where bm.user_id = ?
            """;

        return jdbcClient.sql(sql)
                .param(userId)
                .query(new BoardMapper())
                .list();
    }
}