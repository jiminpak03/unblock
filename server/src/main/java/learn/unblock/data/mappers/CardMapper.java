package learn.unblock.data.mappers;

import learn.unblock.models.Card;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

public class CardMapper implements RowMapper<Card> {
    @Override
    public Card mapRow(ResultSet rs, int rowNum) throws SQLException {
        Card card = new Card();
        card.setId(rs.getInt("id"));
        card.setColumnId(rs.getInt("column_id"));

        int categoryId = rs.getInt("category_id");
        card.setCategoryId(rs.wasNull() ? null : categoryId);

        card.setTitle(rs.getString("title"));
        card.setDescription(rs.getString("description"));
        card.setComplete(rs.getBoolean("is_complete"));
        card.setPosition(rs.getInt("position"));
        card.setImageUrl(rs.getString("image_url"));
        card.setCreatedDate(rs.getObject("created_date", LocalDateTime.class));
        card.setEditDate(rs.getObject("edit_date", LocalDateTime.class));
        return card;
    }
}