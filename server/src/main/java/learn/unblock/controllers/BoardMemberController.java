package learn.unblock.controllers;

import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.domain.BoardMemberService;
import learn.unblock.domain.Result;
import learn.unblock.models.BoardMember;
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

    public BoardMemberController(BoardMemberService service, BoardMemberRepository repository, JwtConverter jwtConverter) {
        this.service = service;
        this.repository = repository;
        this.jwtConverter = jwtConverter;
    }

    @PostMapping("/{id}/member")
    public ResponseEntity<?> addBoardMember(@RequestHeader("Authorization") String authHeader, @RequestBody InviteMemberRequest request, @PathVariable("id") int boardId) throws DataAccessException {
        UserWithoutPassword user = getAuthenticatedUser(authHeader);

        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        Result<BoardMember> result = service.inviteMember(boardId, request.getUsername(), request.getRole());

        if (!result.isSuccess()) {
            return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(result.getpayload(), HttpStatus.CREATED);
    }

    private UserWithoutPassword getAuthenticatedUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtConverter.getUserFromToken(token);
    }
}
