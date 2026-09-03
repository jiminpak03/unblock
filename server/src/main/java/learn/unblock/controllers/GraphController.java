package learn.unblock.controllers;

import learn.unblock.domain.GraphService;
import learn.unblock.models.dtos.GraphResponse;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
@CrossOrigin
public class GraphController {
    private final GraphService service;
    private final JwtConverter jwtConverter;

    public GraphController(GraphService service, JwtConverter jwtConverter) {
        this.service = service;
        this.jwtConverter = jwtConverter;
    }

    @GetMapping("/{boardId}/graph")
    public ResponseEntity<?> getGraph(@PathVariable int boardId, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);

        GraphResponse graph = service.getGraph(boardId);
        return new ResponseEntity<>(graph, HttpStatus.OK);
    }
}