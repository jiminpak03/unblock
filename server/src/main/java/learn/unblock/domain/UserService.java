package learn.unblock.domain;

import learn.unblock.data.DataAccessException;
import learn.unblock.data.UserRepository;
import learn.unblock.models.User;
import learn.unblock.models.dtos.UserWithoutPassword;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, BCryptPasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Result<UserWithoutPassword> register(String username, String password) throws DataAccessException {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));

        Result<User> createResult = create(user);

        Result<UserWithoutPassword> result = new Result<>();
        if (!createResult.isSuccess()) {
            for (String message : createResult.getErrorMessages()) {
                result.addErrorMessage(message, createResult.getResultType());
            }
            return result;
        }

        result.setpayload(UserWithoutPassword.fromUser(createResult.getpayload()));
        return result;
    }

    public Result<UserWithoutPassword> login(String username, String password) throws DataAccessException {
        Result<UserWithoutPassword> result = new Result<>();

        if (username == null || username.isBlank()) {
            result.addErrorMessage("Username cannot be blank", ResultType.INVALID);
            return result;
        }

        User user = repository.findByUsername(username);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            result.addErrorMessage("Username or password is wrong", ResultType.INVALID);
            return result;
        }

        result.setpayload(UserWithoutPassword.fromUser(user));
        return result;
    }

    public Result<User> create(User user) throws DataAccessException {
        Result<User> result = new Result<>();

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            result.addErrorMessage("Username cannot be blank", ResultType.INVALID);
        } else if (repository.findByUsername(user.getUsername()) != null) {
            result.addErrorMessage("Username is already taken", ResultType.INVALID);
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            result.addErrorMessage("Password cannot be blank", ResultType.INVALID);
        }

        if (result.isSuccess()) {
            User created = repository.create(user);
            result.setpayload(created);
        }
        return result;
    }
}
