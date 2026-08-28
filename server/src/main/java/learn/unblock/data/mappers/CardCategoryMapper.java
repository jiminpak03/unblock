package learn.unblock.data.mappers;

import learn.unblock.models.CardCategory;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class CardCategoryMapper implements RowMapper<CardCategory> {
    @Override
    public CardCategory mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new CardCategory(
                rs.getInt("id"),
                rs.getInt("board_id"),
                rs.getString("name"),
                rs.getString("color")
        );
    }
}