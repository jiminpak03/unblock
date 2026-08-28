package learn.unblock.controllers;

import learn.unblock.data.CardDependencyRepository;
import learn.unblock.domain.CardDependencyService;
import learn.unblock.domain.Result;
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

    public CardDependencyController(CardDependencyService service, CardDependencyRepository repository, JwtConverter jwtConverter) {
        this.service = service;
        this.repository = repository;
        this.jwtConverter = jwtConverter;
    }

    @PostMapping("/{cardId}/dependency")
    public ResponseEntity<?> addDependency(@PathVariable int cardId, @RequestBody AddDependencyRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        Result<Void> result = service.addDependency(cardId, request.getDependsOnCardId());
        if (!result.isSuccess()) return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{cardId}/dependency")
    public ResponseEntity<?> findDependencies(@PathVariable int cardId) {
        return new ResponseEntity<>(repository.findDependencies(cardId), HttpStatus.OK);
    }
}