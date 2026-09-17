package learn.unblock.controllers;

import learn.unblock.data.CardCategoryRepository;
import learn.unblock.domain.BoardAccessService;
import learn.unblock.models.CardCategory;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.CreateCategoryRequest;
import learn.unblock.security.JwtConverter;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.websocket.BoardEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class CardCategoryController {

    private final CardCategoryRepository repository;
    private final JwtConverter jwtConverter;
    private final BoardAccessService accessService;
    private final BoardEventPublisher eventPublisher;

    public CardCategoryController(CardCategoryRepository repository, JwtConverter jwtConverter, BoardAccessService accessService, BoardEventPublisher eventPublisher) {
        this.repository = repository;
        this.jwtConverter = jwtConverter;
        this.accessService = accessService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/{boardId}/category")
    public ResponseEntity<?> findByBoardId(@PathVariable int boardId) {
        List<CardCategory> categories = repository.findByBoardId(boardId);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @PostMapping("/{boardId}/category")
    public ResponseEntity<?> create(@PathVariable int boardId, @RequestBody CreateCategoryRequest request,
                                    @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UserWithoutPassword user = jwtConverter.getUserFromToken(token);
        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        CardCategory category = new CardCategory();
        category.setBoardId(boardId);
        category.setName(request.getName());
        category.setColor(request.getColor());

        CardCategory created = repository.create(category);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/category/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody CardCategory category,
                                    @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForCategory(id);
        if (boardId == null) return new ResponseEntity<>("Category not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        category.setId(id);
        repository.update(category);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/category/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForCategory(id);
        if (boardId == null) return new ResponseEntity<>("Category not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        repository.delete(id);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
