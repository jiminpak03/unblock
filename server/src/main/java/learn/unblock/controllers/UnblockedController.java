package learn.unblock.controllers;

import learn.unblock.data.CardDependencyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/board")
public class UnblockedController {
    private final CardDependencyRepository repository;

    public UnblockedController(CardDependencyRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{boardId}/unblocked")
    public ResponseEntity<?> findUnblocked(@PathVariable int boardId) {
        return new ResponseEntity<>(repository.findUnblockedCardIds(boardId), HttpStatus.OK);
    }
}