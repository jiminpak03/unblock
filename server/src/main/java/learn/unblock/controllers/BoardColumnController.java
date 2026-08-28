package learn.unblock.controllers;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.models.BoardColumn;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardColumnController {

    private final BoardColumnRepository repository;

    public BoardColumnController(BoardColumnRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{boardId}/column")
    public ResponseEntity<?> findByBoardId(@PathVariable int boardId) {
        List<BoardColumn> columns = repository.findByBoardId(boardId);
        return new ResponseEntity<>(columns, HttpStatus.OK);
    }
}