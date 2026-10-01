package learn.unblock.boardqa;

import learn.unblock.boardqa.dtos.AskBoardQuestionRequest;
import learn.unblock.boardqa.dtos.AskBoardQuestionResponse;
import learn.unblock.data.BoardRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.domain.BoardAccessService;
import learn.unblock.models.Board;
import learn.unblock.models.MemberRole;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/boards")
public class BoardQAController {

    private final BoardQAService service;
    private final BoardRepository boardRepository;
    private final BoardAccessService accessService;
    private final JwtConverter jwtConverter;

    public BoardQAController(BoardQAService service, BoardRepository boardRepository,
                              BoardAccessService accessService, JwtConverter jwtConverter) {
        this.service = service;
        this.boardRepository = boardRepository;
        this.accessService = accessService;
        this.jwtConverter = jwtConverter;
    }

    @PostMapping("/{boardId}/ask")
    public ResponseEntity<?> ask(@PathVariable int boardId, @RequestBody AskBoardQuestionRequest request,
                                  @RequestHeader("Authorization") String authHeader) throws DataAccessException {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            return new ResponseEntity<>("Question is required.", HttpStatus.BAD_REQUEST);
        }

        Board board = boardRepository.findById(boardId);
        if (board == null) {
            return new ResponseEntity<>("Board not found.", HttpStatus.NOT_FOUND);
        }

        if (!accessService.hasAtLeast(boardId, user.getId(), MemberRole.VIEWER)) {
            return new ResponseEntity<>("You do not have access to this board.", HttpStatus.FORBIDDEN);
        }

        try {
            String answer = service.ask(boardId, request.getQuestion());
            return new ResponseEntity<>(new AskBoardQuestionResponse(answer), HttpStatus.OK);
        } catch (IOException | InterruptedException e) {
            return new ResponseEntity<>("Could not reach the local Ollama server. Is it running?", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
