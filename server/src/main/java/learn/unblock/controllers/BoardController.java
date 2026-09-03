package learn.unblock.controllers;

import learn.unblock.data.BoardJdbcClientRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.domain.BoardService;
import learn.unblock.domain.Result;
import learn.unblock.models.Board;
import learn.unblock.models.dtos.CreateBoardRequest;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardController {
    private final BoardService service;
    private final JwtConverter jwtConverter;
    private final BoardJdbcClientRepository boardRepository;

    public BoardController(BoardService service, JwtConverter jwtConverter, BoardJdbcClientRepository boardRepository) {
        this.service = service;
        this.jwtConverter = jwtConverter;
        this.boardRepository = boardRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateBoardRequest request, @RequestHeader("Authorization") String authHeader) throws DataAccessException {
        UserWithoutPassword user = getAuthenticatedUser(authHeader);

        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        Result<Board> result = service.create(request.getName(), user.getId());

        if (!result.isSuccess()) {
            return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(result.getpayload(), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<?> findByUserId(@RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = getAuthenticatedUser(authHeader);

        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        List<Board> boards = boardRepository.findByUserId(user.getId());
        return new ResponseEntity<>(boards, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, @RequestHeader("Authorization") String authHeader) throws DataAccessException {
        UserWithoutPassword user = getAuthenticatedUser(authHeader);
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Result<Void> result = service.delete(id, user.getId());
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private UserWithoutPassword getAuthenticatedUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtConverter.getUserFromToken(token);
    }
}
