package learn.unblock.data;

import learn.unblock.models.BoardColumn;

import java.util.List;

public interface BoardColumnRepository {
    BoardColumn create(BoardColumn column);
    BoardColumn findById(int id);
    List<BoardColumn> findByBoardId(int boardId);
    boolean update(BoardColumn column);
    boolean delete(int id);
}