package learn.unblock.data.mappers;

import learn.unblock.models.Board;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

public class BoardMapper implements RowMapper<Board> {

    @Override
    public Board mapRow(ResultSet rs, int rowNum) throws SQLException {
        Board board = new Board();
        board.setId(rs.getInt("id"));
        board.setName(rs.getString("name"));
        board.setOwnerId(rs.getInt("owner_id"));
        board.setCreatedDate(rs.getObject("created_date", LocalDateTime.class));

        return board;
    }
}
