package learn.unblock.domain;

import learn.unblock.data.*;
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
    BoardService service;

    @MockitoBean
    BoardRepository boardRepository;

    @MockitoBean
    BoardMemberRepository memberRepository;

    @MockitoBean
    BoardColumnRepository columnRepository;

    @Test
    void createShouldFailWhenNameBlank() throws DataAccessException {
        Result<Board> result = service.create("", 1);

        assertEquals(ResultType.INVALID, result.getResultType());
        verify(boardRepository, never()).create(any());
    }

    @Test
    void createShouldAddCreatorAsOwnerAndSeedColumns() throws DataAccessException {
        Board saved = new Board();
        saved.setId(5);
        saved.setName("Test Board");
        saved.setOwnerId(1);
        when(boardRepository.create(any())).thenReturn(saved);

        Result<Board> result = service.create("Test Board", 1);

        assertTrue(result.isSuccess());
        verify(memberRepository).create(any());
        verify(columnRepository, times(3)).create(any());
    }

    @Test
    void deleteShouldFailForNonCreator() throws DataAccessException {
        Board board = new Board();
        board.setId(5);
        board.setOwnerId(1);
        when(boardRepository.findById(5)).thenReturn(board);

        Result<Void> result = service.delete(5, 2);

        assertFalse(result.isSuccess());
        verify(boardRepository, never()).delete(anyInt());
    }

    @Test
    void deleteShouldSucceedForCreator() throws DataAccessException {
        Board board = new Board();
        board.setId(5);
        board.setOwnerId(1);
        when(boardRepository.findById(5)).thenReturn(board);

        Result<Void> result = service.delete(5, 1);

        assertTrue(result.isSuccess());
        verify(boardRepository).delete(5);
    }
}