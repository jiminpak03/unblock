package learn.unblock.data;

import learn.unblock.data.mappers.CardMapper;
import learn.unblock.models.Card;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CardJdbcClientRepository implements CardRepository {
    private final JdbcClient jdbcClient;

    public CardJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public Card create(Card card) {
        final String sql = """
                insert into card (column_id, category_id, title, description, is_complete, position, image_url)
                values (:column_id, :category_id, :title, :description, :is_complete, :position, :image_url)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("column_id", card.getColumnId())
                .param("category_id", card.getCategoryId())
                .param("title", card.getTitle())
                .param("description", card.getDescription())
                .param("is_complete", card.isComplete())
                .param("position", card.getPosition())
                .param("image_url", card.getImageUrl())
                .update(keyHolder, "id");

        if (rowsAffected == 0) return null;
        card.setId(keyHolder.getKey().intValue());
        return card;
    }

    @Override
    public Card findById(int id) {
        final String sql = "select * from card where id = ?";
        return jdbcClient.sql(sql).param(id).query(new CardMapper()).optional().orElse(null);
    }

    @Override
    public List<Card> findByColumnId(int columnId) {
        final String sql = "select * from card where column_id = ?";
        return jdbcClient.sql(sql).param(columnId).query(new CardMapper()).list();
    }

    @Override
    public boolean update(Card card) {
        final String sql = """
                update card set column_id = :column_id, category_id = :category_id, title = :title,
                       description = :description, is_complete = :is_complete, position = :position,
                       image_url = :image_url, edit_date = current_timestamp
                where id = :id
                """;

        return jdbcClient.sql(sql)
                .param("column_id", card.getColumnId())
                .param("category_id", card.getCategoryId())
                .param("title", card.getTitle())
                .param("description", card.getDescription())
                .param("is_complete", card.isComplete())
                .param("position", card.getPosition())
                .param("image_url", card.getImageUrl())
                .param("id", card.getId())
                .update() > 0;
    }
}