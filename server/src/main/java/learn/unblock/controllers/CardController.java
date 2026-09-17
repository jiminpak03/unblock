package learn.unblock.controllers;

import learn.unblock.data.CardRepository;
import learn.unblock.domain.BoardAccessService;
import learn.unblock.domain.CardService;
import learn.unblock.domain.Result;
import learn.unblock.models.Card;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.CreateCardRequest;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import learn.unblock.websocket.BoardEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/card")
public class CardController {
    private final CardService service;
    private final JwtConverter jwtConverter;
    private final CardRepository repository;
    private final BoardAccessService accessService;
    private final BoardEventPublisher eventPublisher;

    public CardController(CardService service, JwtConverter jwtConverter, CardRepository repository, BoardAccessService accessService, BoardEventPublisher eventPublisher) {
        this.service = service;
        this.jwtConverter = jwtConverter;
        this.repository = repository;
        this.accessService = accessService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/column/{columnId}")
    public ResponseEntity<?> findByColumnId(@PathVariable int columnId) {
        return new ResponseEntity<>(repository.findByColumnId(columnId), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateCardRequest request, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForColumn(request.getColumnId());
        if (boardId == null) return new ResponseEntity<>("Column not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        Result<Card> result = service.create(request.getColumnId(), request.getCategoryId(), request.getTitle(), request.getDescription());
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(result.getpayload(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Card card, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForCard(id);
        if (boardId == null) return new ResponseEntity<>("Card not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        card.setId(id);
        Result<Card> result = service.update(card);
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(result.getpayload(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Integer boardId = accessService.boardIdForCard(id);
        if (boardId == null) return new ResponseEntity<>("Card not found.", HttpStatus.NOT_FOUND);
        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.EDITOR)) {
            return new ResponseEntity<>("You do not have permission to edit this board.", HttpStatus.FORBIDDEN);
        }

        boolean deleted = repository.delete(id);
        if (!deleted) return new ResponseEntity<>("Card not found.", HttpStatus.NOT_FOUND);
        eventPublisher.notifyBoardChanged(boardId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
