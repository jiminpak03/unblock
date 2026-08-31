package learn.unblock.controllers;

import learn.unblock.data.CardRepository;
import learn.unblock.domain.CardService;
import learn.unblock.domain.Result;
import learn.unblock.models.Card;
import learn.unblock.models.dtos.CreateCardRequest;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/card")
public class CardController {
    private final CardService service;
    private final JwtConverter jwtConverter;
    private final CardRepository repository;

    public CardController(CardService service, JwtConverter jwtConverter, CardRepository repository) {
        this.service = service;
        this.jwtConverter = jwtConverter;
        this.repository = repository;
    }

    @GetMapping("/column/{columnId}")
    public ResponseEntity<?> findByColumnId(@PathVariable int columnId) {
        return new ResponseEntity<>(repository.findByColumnId(columnId), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateCardRequest request, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Result<Card> result = service.create(request.getColumnId(), request.getCategoryId(), request.getTitle(), request.getDescription());
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        return new RespgitonseEntity<>(result.getpayload(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Card card, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        card.setId(id);
        Result<Card> result = service.update(card);
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(result.getpayload(), HttpStatus.OK);
    }
}