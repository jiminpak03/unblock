package learn.unblock.domain;

import learn.unblock.data.CardDependencyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class CardDependencyServiceTest {

    @Autowired
    CardDependencyService service;

    @MockitoBean
    CardDependencyRepository repository;

    @Test
    void shouldRejectSelfDependency() {
        Result<Void> result = service.addDependency(1, 1);

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(repository, never()).create(anyInt(), anyInt());
    }

    @Test
    void shouldRejectDirectCycle() {
        when(repository.findDependencies(2)).thenReturn(List.of(1));

        Result<Void> result = service.addDependency(1, 2);

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(repository, never()).create(anyInt(), anyInt());
    }

    @Test
    void shouldRejectIndirectCycle() {
        when(repository.findDependencies(3)).thenReturn(List.of(2));
        when(repository.findDependencies(2)).thenReturn(List.of(1));
        when(repository.findDependencies(1)).thenReturn(List.of());

        Result<Void> result = service.addDependency(1, 3);

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(repository, never()).create(anyInt(), anyInt());
    }

    @Test
    void shouldAcceptValidDependency() {
        when(repository.findDependencies(anyInt())).thenReturn(List.of());

        Result<Void> result = service.addDependency(1, 2);

        assertTrue(result.isSuccess());
        verify(repository).create(1, 2);
    }
}