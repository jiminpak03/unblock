package learn.unblock.data;

import learn.unblock.models.BoardMember;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.BoardMemberWithUsername;

import java.util.List;

public interface BoardMemberRepository {
    BoardMember create(BoardMember member);
    BoardMember findByBoardIdAndUserId(int boardId, int userId);
    List<BoardMemberWithUsername> findByBoardId(int boardId);
    boolean delete(int boardId, int userId);
    boolean updateRole(int boardId, int userId, MemberRole role);
}