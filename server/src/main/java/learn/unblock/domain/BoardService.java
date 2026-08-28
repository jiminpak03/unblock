package learn.unblock.domain;

import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.BoardRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.models.Board;
import learn.unblock.models.BoardMember;
import learn.unblock.models.MemberRole;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final BoardMemberRepository memberRepository;

    public BoardService(BoardRepository boardRepository, BoardMemberRepository memberRepository) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
    }

    public Result<Board> create(String name, int creatorUserId) throws DataAccessException {
        Result<Board> result = new Result<>();

        if (name == null || name.isBlank()) {
            result.addErrorMessage("Board name cannot be blank", ResultType.INVALID);
            return result;
        }

        Board board = new Board();
        board.setName(name);
        board.setOwnerId(creatorUserId);
        Board created = boardRepository.create(board);

        BoardMember creatorMembership = new BoardMember();
        creatorMembership.setBoardId(created.getId());
        creatorMembership.setUserId(creatorUserId);
        creatorMembership.setRole(MemberRole.OWNER);
        memberRepository.create(creatorMembership);

        result.setpayload(created);
        return result;
    }

    public boolean canDelete(Board board, int userId) {
        return board.getOwnerId() == userId;
    }
}