package learn.unblock.controllers;

import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.domain.BoardAccessService;
import learn.unblock.domain.BoardMemberService;
import learn.unblock.domain.Result;
import learn.unblock.models.BoardMember;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.InviteMemberRequest;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
public class BoardMemberController {
    private final BoardMemberService service;
    private final BoardMemberRepository repository;
    private final JwtConverter jwtConverter;
    private final BoardMemberRepository memberRepository;
    private final BoardAccessService accessService;

    public BoardMemberController(BoardMemberService service, BoardMemberRepository repository, JwtConverter jwtConverter,
                                  BoardMemberRepository memberRepository, BoardAccessService accessService) {
        this.service = service;
        this.repository = repository;
        this.jwtConverter = jwtConverter;
        this.memberRepository = memberRepository;
        this.accessService = accessService;
    }

    @PostMapping("/{id}/member")
    public ResponseEntity<?> addBoardMember(@RequestHeader("Authorization") String authHeader, @RequestBody InviteMemberRequest request, @PathVariable("id") int boardId) throws DataAccessException {
        UserWithoutPassword user = getAuthenticatedUser(authHeader);

        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.OWNER)) {
            return new ResponseEntity<>("Only an owner can invite members.", HttpStatus.FORBIDDEN);
        }

        Result<BoardMember> result = service.inviteMember(boardId, request.getUsername(), request.getRole());

        if (!result.isSuccess()) {
            return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(result.getpayload(), HttpStatus.CREATED);
    }

    @GetMapping("/{boardId}/member")
    public ResponseEntity<?> findMembers(@PathVariable int boardId) {
        return new ResponseEntity<>(repository.findByBoardId(boardId), HttpStatus.OK);
    }

    private UserWithoutPassword getAuthenticatedUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtConverter.getUserFromToken(token);
    }

    @DeleteMapping("/{boardId}/member/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable int boardId, @PathVariable int userId,
                                          @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.OWNER)) {
            return new ResponseEntity<>("Only an owner can remove members.", HttpStatus.FORBIDDEN);
        }

        memberRepository.delete(boardId, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{boardId}/member/{userId}")
    public ResponseEntity<?> changeRole(@PathVariable int boardId, @PathVariable int userId,
                                        @RequestBody InviteMemberRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.OWNER)) {
            return new ResponseEntity<>("Only an owner can change member roles.", HttpStatus.FORBIDDEN);
        }

        memberRepository.updateRole(boardId, userId, request.getRole());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
