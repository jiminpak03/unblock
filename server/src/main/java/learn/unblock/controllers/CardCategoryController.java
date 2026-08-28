package learn.unblock.controllers;

import learn.unblock.data.CardCategoryRepository;
import learn.unblock.models.CardCategory;
import learn.unblock.models.dtos.CreateCategoryRequest;
import learn.unblock.security.JwtConverter;
import learn.unblock.models.dtos.UserWithoutPassword;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class CardCategoryController {

    private final CardCategoryRepository repository;
    private final JwtConverter jwtConverter;

    public CardCategoryController(CardCategoryRepository repository, JwtConverter jwtConverter) {
        this.repository = repository;
        this.jwtConverter = jwtConverter;
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

        CardCategory category = new CardCategory();
        category.setBoardId(boardId);
        category.setName(request.getName());
        category.setColor(request.getColor());

        CardCategory created = repository.create(category);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}