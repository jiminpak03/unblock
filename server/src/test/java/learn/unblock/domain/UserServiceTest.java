package learn.unblock.domain;

import learn.unblock.data.DataAccessException;
import learn.unblock.data.TestDataHelper;
import learn.unblock.data.UserRepository;
import learn.unblock.models.User;
import learn.unblock.models.dtos.UserWithoutPassword;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserServiceTest {

    @Autowired
    UserService service;

    @MockitoBean
    UserRepository repository;

    @Test
    void createFailsWhenUsernameIsBlank() throws DataAccessException {
        User toCreate = TestDataHelper.userToCreate();
        toCreate.setUsername("");

        Result<User> actual = service.create(toCreate);

        assertEquals(ResultType.INVALID, actual.getResultType());
        assertTrue(actual.getErrorMessages().contains("Username cannot be blank"));
    }

    @Test
    void createFailsWhenPasswordIsBlank() throws DataAccessException {
        User toCreate = TestDataHelper.userToCreate();
        toCreate.setPassword("");

        Result<User> actual = service.create(toCreate);

        assertEquals(ResultType.INVALID, actual.getResultType());
        assertTrue(actual.getErrorMessages().contains("Password cannot be blank"));
    }

    @Test
    void createFailsWhenUsernameIsDuplicated() throws DataAccessException {
        when(repository.findByUsername(TestDataHelper.userToCreate().getUsername())).thenReturn(TestDataHelper.existingUser());

        Result<User> actual = service.create(TestDataHelper.userToCreate());

        assertEquals(ResultType.INVALID, actual.getResultType());
        assertTrue(actual.getErrorMessages().contains("Username is already taken"));
    }

    @Test
    void createHappyPath() throws DataAccessException {
        when(repository.create(TestDataHelper.userToCreate())).thenReturn(TestDataHelper.userAfterCreate());

        Result<User> actual = service.create(TestDataHelper.userToCreate());

        assertTrue(actual.isSuccess());
        assertEquals(TestDataHelper.userAfterCreate(), actual.getpayload());
    }

    @Test
    void registerFailsWhenUsernameIsBlank() throws DataAccessException {
        Result<UserWithoutPassword> actual = service.register("", "password123");

        assertEquals(ResultType.INVALID, actual.getResultType());
        assertTrue(actual.getErrorMessages().contains("Username cannot be blank"));
        verify(repository, never()).create(any());
    }

    @Test
    void registerHappyPath() throws DataAccessException {
        when(repository.findByUsername("test")).thenReturn(null);
        when(repository.create(any())).thenReturn(TestDataHelper.userAfterCreate());

        Result<UserWithoutPassword> actual = service.register("test", "password123");

        assertTrue(actual.isSuccess());
        assertEquals("test", actual.getpayload().getUsername());
    }
}