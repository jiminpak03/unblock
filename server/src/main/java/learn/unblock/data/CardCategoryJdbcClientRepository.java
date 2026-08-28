package learn.unblock.data;

import learn.unblock.data.mappers.CardCategoryMapper;
import learn.unblock.models.CardCategory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CardCategoryJdbcClientRepository implements CardCategoryRepository {
    private final JdbcClient jdbcClient;

    public CardCategoryJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public CardCategory create(CardCategory category) {
        final String sql = """
                insert into card_category (board_id, name, color)
                values (:board_id, :name, :color)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("board_id", category.getBoardId())
                .param("name", category.getName())
                .param("color", category.getColor())
                .update(keyHolder, "id");

        if (rowsAffected == 0) {
            return null;
        }

        category.setId(keyHolder.getKey().intValue());
        return category;
    }

    @Override
    public List<CardCategory> findByBoardId(int boardId) {
        final String sql = "select * from card_category where board_id = ?";

        return jdbcClient.sql(sql)
                .param(boardId)
                .query(new CardCategoryMapper())
                .list();
    }
}