package learn.unblock.domain;

import learn.unblock.data.DataAccessException;
import learn.unblock.data.TestDataHelper;
import learn.unblock.data.UserRepository;
import learn.unblock.models.User;
import learn.unblock.models.dtos.UserWithoutPassword;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserServiceTest {

    @Autowired
    UserService service;

    @Autowired
    BCryptPasswordEncoder encoder;

    @MockitoBean
    UserRepository repository;

    @Test
    void registerShouldFailWhenUsernameBlank() throws DataAccessException {
        Result<UserWithoutPassword> result = service.register("", "password123");

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(repository, never()).create(any());
    }

    @Test
    void registerShouldFailWhenPasswordBlank() throws DataAccessException {
        Result<UserWithoutPassword> result = service.register("newuser", "");

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(repository, never()).create(any());
    }

    @Test
    void registerShouldFailWhenUsernameTaken() throws DataAccessException {
        when(repository.findByUsername("mallardmike")).thenReturn(TestDataHelper.existingUser());

        Result<UserWithoutPassword> result = service.register("mallardmike", "password123");

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(repository, never()).create(any());
    }

    @Test
    void registerShouldSucceedAndHashPassword() throws DataAccessException {
        when(repository.findByUsername("newuser")).thenReturn(null);
        when(repository.create(any())).thenAnswer(invocation -> {
            User passed = invocation.getArgument(0);
            // the password reaching the repository must NOT be the plaintext
            assertNotEquals("password123", passed.getPassword());
            assertTrue(encoder.matches("password123", passed.getPassword()));
            passed.setId(4);
            return passed;
        });

        Result<UserWithoutPassword> result = service.register("newuser", "password123");

        assertTrue(result.isSuccess());
        assertEquals("newuser", result.getpayload().getUsername());
    }

    @Test
    void loginShouldFailForUnknownUsername() throws DataAccessException {
        when(repository.findByUsername("nobody")).thenReturn(null);

        Result<UserWithoutPassword> result = service.login("nobody", "password123");

        assertEquals(ResultType.INVALID, result.getResultType());
    }

    @Test
    void loginShouldFailForWrongPassword() throws DataAccessException {
        User stored = new User();
        stored.setId(1);
        stored.setUsername("mallardmike");
        stored.setPassword(encoder.encode("correctpassword"));
        when(repository.findByUsername("mallardmike")).thenReturn(stored);

        Result<UserWithoutPassword> result = service.login("mallardmike", "wrongpassword");

        assertEquals(ResultType.INVALID, result.getResultType());
    }

    @Test
    void loginShouldSucceedWithCorrectPassword() throws DataAccessException {
        User stored = new User();
        stored.setId(1);
        stored.setUsername("mallardmike");
        stored.setPassword(encoder.encode("correctpassword"));
        when(repository.findByUsername("mallardmike")).thenReturn(stored);

        Result<UserWithoutPassword> result = service.login("mallardmike", "correctpassword");

        assertTrue(result.isSuccess());
        assertEquals("mallardmike", result.getpayload().getUsername());
    }
}