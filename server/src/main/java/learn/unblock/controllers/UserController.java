package learn.unblock.controllers;

import jakarta.validation.Valid;
import learn.unblock.data.DataAccessException;
import learn.unblock.domain.Result;
import learn.unblock.domain.UserService;
import learn.unblock.models.dtos.LoginRequest;
import learn.unblock.models.dtos.RegisterRequest;
import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService service;
    private final JwtConverter jwtConverter;

    public UserController(UserService service, JwtConverter jwtConverter) {
        this.service = service;
        this.jwtConverter = jwtConverter;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request, BindingResult bindingResult) throws DataAccessException {
        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(bindingResult.getAllErrors(), HttpStatus.BAD_REQUEST);
        }

        Result<UserWithoutPassword> result = service.register(request.getUsername(), request.getPassword());
        if (!result.isSuccess()) {
            return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(result.getpayload(), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) throws DataAccessException {
        Result<UserWithoutPassword> result = service.login(request.getUsername(), request.getPassword());
        if (!result.isSuccess()) {
            return new ResponseEntity<>(result.getErrorMessages(), HttpStatus.UNAUTHORIZED);
        }

        String token = jwtConverter.getToken(result.getpayload());

        Map<String, Object> response = new HashMap<>();
        response.put("user", result.getpayload());
        response.put("token", token);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}