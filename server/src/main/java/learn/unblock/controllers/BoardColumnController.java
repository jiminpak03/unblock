package learn.unblock.controllers;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardColumnController {

    private final BoardColumnRepository repository;
    private final JwtConverter jwtConverter;

    public BoardColumnController(BoardColumnRepository repository, JwtConverter jwtConverter) {
        this.repository = repository;
        this.jwtConverter = jwtConverter;
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

        column.setId(id);
        repository.update(column);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/column/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        repository.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{boardId}/column")
    public ResponseEntity<?> create(@PathVariable int boardId, @RequestBody BoardColumn column,
                                    @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        column.setBoardId(boardId);
        BoardColumn created = repository.create(column);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}