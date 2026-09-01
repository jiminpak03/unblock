package learn.unblock.domain;

import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.data.UserRepository;
import learn.unblock.models.BoardMember;
import learn.unblock.models.MemberRole;
import learn.unblock.models.User;
import org.springframework.stereotype.Service;

@Service
public class BoardMemberService {
    private final BoardMemberRepository memberRepository;
    private final UserRepository userRepository;

    public BoardMemberService(BoardMemberRepository memberRepository, UserRepository userRepository) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public Result<BoardMember> inviteMember(int boardId, String username, MemberRole role) throws DataAccessException {
        Result<BoardMember> result = new Result<>();

        User toInvite = userRepository.findByUsername(username);
        if (toInvite == null) {
            result.addErrorMessage("User cannot be found", ResultType.NOT_FOUND);
            return result;
        }


        BoardMember invitedMember = new BoardMember(boardId, toInvite.getId(), role);
        memberRepository.create(invitedMember);
        result.setpayload(invitedMember);
        return result;
    }
}