package learn.unblock.domain;

import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.BoardRepository;
import learn.unblock.data.DataAccessException;
import learn.unblock.models.Board;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class BoardServiceTest {
    @Autowired
    private BoardService service;
    @MockitoBean private BoardRepository boardRepository;
    @MockitoBean
    private BoardMemberRepository memberRepository;

    @Test
    void createFailsWhenNameBlank() throws DataAccessException{
        Result<Board> actual = service.create("", 1);
        assertEquals(ResultType.INVALID, actual.getResultType());
        verify(boardRepository, never()).create(any());
    }

    @Test
    void createHappyPath() throws DataAccessException {
        Board saved = new Board();
        saved.setId(5);
        saved.setName("Test Board");
        saved.setOwnerId(1);
        when(boardRepository.create(any())).thenReturn(saved);

        Result<Board> actual = service.create("Test Board", 1);

        assertTrue(actual.isSuccess());
        verify(memberRepository).create(any());
    }
}