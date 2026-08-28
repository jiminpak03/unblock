package learn.unblock.data.mappers;

import learn.unblock.models.BoardColumn;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class BoardColumnMapper implements RowMapper<BoardColumn> {
    @Override
    public BoardColumn mapRow(ResultSet rs, int rowNum) throws SQLException {
        BoardColumn column = new BoardColumn();

        column.setId(rs.getInt("id"));
        column.setBoardId(rs.getInt("board_id"));
        column.setName(rs.getString("name"));
        column.setPosition(rs.getInt("position"));

        return column;
    }
}
