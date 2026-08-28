package learn.unblock.data;

import learn.unblock.models.BoardColumn;

import java.util.List;

public interface BoardColumnRepository {
    BoardColumn create(BoardColumn column);
    List<BoardColumn> findByBoardId(int boardId);
}