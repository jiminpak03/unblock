package learn.unblock.controllers;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.domain.BoardAccessService;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import learn.unblock.websocket.BoardEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardColumnController {

    private final BoardColumnRepository repository;
    private final JwtConverter jwtConverter;
    private final BoardAccessService accessService;
    private final BoardEventPublisher eventPublisher;

    public BoardColumnController(BoardColumnRepository repository, JwtConverter jwtConverter, BoardAccessService accessService, BoardEventPublisher eventPublisher) {
        this.repository = repository;
        this.jwtConverter = jwtConverter;
        this.accessService = accessService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/{boardId}/column")
    public ResponseEntity<?> findByBoardId(@PathVariable int boardId) {
        List<BoardColumn> columns = repository.findByBoardId(boardId);
        return new ResponseEntity<>(columns, HttpStatus.OK);
    }

    @PutMapping("/column/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody BoardColumn column,
                                    @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForColumn(id);
        if (boardId == null) return new ResponseEntity<>("Column not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        column.setId(id);
        repository.update(column);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/column/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForColumn(id);
        if (boardId == null) return new ResponseEntity<>("Column not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        repository.delete(id);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{boardId}/column")
    public ResponseEntity<?> create(@PathVariable int boardId, @RequestBody BoardColumn column,
                                    @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        column.setBoardId(boardId);
        BoardColumn created = repository.create(column);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
