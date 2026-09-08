package learn.unblock.controllers;

import learn.unblock.data.CardDependencyRepository;
import learn.unblock.domain.BoardAccessService;
import learn.unblock.domain.CardDependencyService;
import learn.unblock.domain.Result;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.AddDependencyRequest;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/card")
public class CardDependencyController {
    private final CardDependencyService service;
    private final CardDependencyRepository repository;
    private final JwtConverter jwtConverter;
    private final BoardAccessService accessService;

    public CardDependencyController(CardDependencyService service, CardDependencyRepository repository,
                                     JwtConverter jwtConverter, BoardAccessService accessService) {
        this.service = service;
        this.repository = repository;
        this.jwtConverter = jwtConverter;
        this.accessService = accessService;
    }

    @PostMapping("/{cardId}/dependency")
    public ResponseEntity<?> addDependency(@PathVariable int cardId, @RequestBody AddDependencyRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForCard(cardId);
        if (boardId == null) return new ResponseEntity<>("Card not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        Result<Void> result = service.addDependency(cardId, request.getDependsOnCardId());
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{cardId}/dependency")
    public ResponseEntity<?> findDependencies(@PathVariable int cardId) {
        return new ResponseEntity<>(repository.findDependencies(cardId), HttpStatus.OK);
    }

    @DeleteMapping("/{cardId}/dependency/{dependsOnCardId}")
    public ResponseEntity<?> removeDependency(@PathVariable int cardId, @PathVariable int dependsOnCardId,
                                              @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForCard(cardId);
        if (boardId == null) return new ResponseEntity<>("Card not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        repository.delete(cardId, dependsOnCardId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
