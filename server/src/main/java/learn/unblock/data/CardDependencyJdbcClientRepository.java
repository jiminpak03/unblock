package learn.unblock.data;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CardDependencyJdbcClientRepository implements CardDependencyRepository {
    private final JdbcClient jdbcClient;

    public CardDependencyJdbcClientRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public boolean create(int cardId, int dependsOnCardId) {
        final String sql = """
                insert into card_dependency (card_id, depends_on_card_id)
                values (:card_id, :depends_on_card_id)
                """;
        return jdbcClient.sql(sql)
                .param("card_id", cardId)
                .param("depends_on_card_id", dependsOnCardId)
                .update() > 0;
    }

    @Override
    public boolean exists(int cardId, int dependsOnCardId) {
        final String sql = "select count(*) from card_dependency where card_id = ? and depends_on_card_id = ?";
        Integer count = jdbcClient.sql(sql)
                .param(cardId)
                .param(dependsOnCardId)
                .query(Integer.class)
                .single();
        return count != null && count > 0;
    }

    @Override
    public List<Integer> findDependencies(int cardId) {
        final String sql = "select depends_on_card_id from card_dependency where card_id = ?";
        return jdbcClient.sql(sql)
                .param(cardId)
                .query(Integer.class)
                .list();
    }

    @Override
    public List<Integer> findUnblockedCardIds(int boardId) {
        final String sql = """
                select c.id
                from card c
                join board_column bc on c.column_id = bc.id
                where bc.board_id = :board_id
                  and c.id not in (
                      select cd.card_id
                      from card_dependency cd
                      join card blocker on cd.depends_on_card_id = blocker.id
                      where blocker.is_complete = false
                  )
                """;
        return jdbcClient.sql(sql)
                .param("board_id", boardId)
                .query(Integer.class)
                .list();
    }
}