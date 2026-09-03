package learn.unblock.data;

import learn.unblock.models.Board;

import java.util.List;

public interface BoardRepository {
    Board findById(int id) throws DataAccessException;

    Board create(Board board) throws DataAccessException;

    List<Board> findByUserId(int userId) throws DataAccessException;

    boolean delete(int id);
}
