package learn.unblock.domain;

import learn.unblock.data.DataAccessException;
import learn.unblock.data.UserRepository;
import learn.unblock.models.User;
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
