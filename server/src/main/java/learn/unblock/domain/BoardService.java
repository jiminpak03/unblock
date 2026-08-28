package learn.unblock.domain;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.BoardRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.models.Board;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.BoardMember;
import learn.unblock.models.MemberRole;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final BoardMemberRepository memberRepository;
    private final BoardColumnRepository boardColumnRepository;

    public BoardService(BoardRepository boardRepository, BoardMemberRepository memberRepository, BoardColumnRepository boardColumnRepository) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.boardColumnRepository = boardColumnRepository;
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

        List<String> defaultColumns = List.of("Backlog", "In Progress", "Done");
        int position = 0;
        for (String columnName : defaultColumns) {
            BoardColumn column = new BoardColumn();
            column.setBoardId(created.getId());
            column.setName(columnName);
            column.setPosition(position++);
            boardColumnRepository.create(column);
        }

        result.setpayload(created);
        return result;
    }

    public boolean canDelete(Board board, int userId) {
        return board.getOwnerId() == userId;
    }
}