package learn.unblock.data;

import learn.unblock.models.BoardMember;

import java.util.List;

public interface BoardMemberRepository {
    BoardMember create(BoardMember member);
    BoardMember findByBoardIdAndUserId(int boardId, int userId);
    List<BoardMember> findByBoardId(int boardId);
}