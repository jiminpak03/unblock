package learn.unblock.data;

import learn.unblock.data.mappers.BoardColumnMapper;
import learn.unblock.models.BoardColumn;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BoardColumnJdbcClientRepository implements BoardColumnRepository{
    private final JdbcClient jdbcClient;

    public BoardColumnJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public BoardColumn create(BoardColumn column) {
        final String sql = """
                insert into board_column (board_id, name, position)
                values (:board_id, :name, :position)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("board_id", column.getBoardId())
                .param("name", column.getName())
                .param("position", column.getPosition())
                .update(keyHolder, "id");

        if (rowsAffected == 0) {
            return null;
        }

        column.setId(keyHolder.getKey().intValue());

        return column;
    }

    @Override
    public List<BoardColumn> findByBoardId(int boardId) {
        final String sql = "select * from board_column where board_id = ?";

        return jdbcClient.sql(sql)
                .param(boardId)
                .query(new BoardColumnMapper())
                .list();
    }
}
