package learn.unblock.help;

import learn.unblock.help.dtos.AskHelpRequest;
import learn.unblock.help.dtos.AskHelpResponse;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/help")
public class HelpController {

    private final HelpService helpService;
    private final JwtConverter jwtConverter;

    public HelpController(HelpService helpService, JwtConverter jwtConverter) {
        this.helpService = helpService;
        this.jwtConverter = jwtConverter;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody AskHelpRequest request, @RequestHeader("Authorization") String authHeader) {
        UserWithoutPassword user = jwtConverter.getUserFromToken(authHeader.replace("Bearer ", ""));
        if (user == null) {
            return new ResponseEntity<>("Invalid or missing token.", HttpStatus.UNAUTHORIZED);
        }

        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            return new ResponseEntity<>("Question is required.", HttpStatus.BAD_REQUEST);
        }

        try {
            AskHelpResponse response = helpService.ask(request.getQuestion());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException | InterruptedException e) {
            return new ResponseEntity<>("Could not reach the local Ollama server. Is it running?", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
