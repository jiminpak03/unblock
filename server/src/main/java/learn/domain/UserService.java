package learn.domain;

import learn.data.DataAccessException;
import learn.data.UserRepository;
import learn.models.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
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
