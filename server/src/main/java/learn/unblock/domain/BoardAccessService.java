package learn.unblock.domain;

import learn.unblock.data.BoardColumnRepository;
import learn.unblock.data.BoardMemberRepository;
import learn.unblock.data.CardCategoryRepository;
import learn.unblock.data.CardRepository;
import learn.unblock.models.BoardColumn;
import learn.unblock.models.BoardMember;
import learn.unblock.models.Card;
import learn.unblock.models.CardCategory;
import learn.unblock.models.MemberRole;
import org.springframework.stereotype.Service;

@Service
public class BoardAccessService {
    private final BoardMemberRepository memberRepository;
    private final BoardColumnRepository columnRepository;
    private final CardRepository cardRepository;
    private final CardCategoryRepository categoryRepository;

    public BoardAccessService(BoardMemberRepository memberRepository, BoardColumnRepository columnRepository,
                               CardRepository cardRepository, CardCategoryRepository categoryRepository) {
        this.memberRepository = memberRepository;
        this.columnRepository = columnRepository;
        this.cardRepository = cardRepository;
        this.categoryRepository = categoryRepository;
    }

    public MemberRole roleOf(int boardId, int userId) {
        BoardMember member = memberRepository.findByBoardIdAndUserId(boardId, userId);
        return member == null ? null : member.getRole();
    }

    public boolean hasAtLeast(int boardId, int userId, MemberRole required) {
        MemberRole role = roleOf(boardId, userId);
        return role != null && role.atLeast(required);
    }

    public Integer boardIdForColumn(int columnId) {
        BoardColumn column = columnRepository.findById(columnId);
        return column == null ? null : column.getBoardId();
    }

    public Integer boardIdForCategory(int categoryId) {
        CardCategory category = categoryRepository.findById(categoryId);
        return category == null ? null : category.getBoardId();
    }

    public Integer boardIdForCard(int cardId) {
        Card card = cardRepository.findById(cardId);
        if (card == null) return null;
        return boardIdForColumn(card.getColumnId());
    }
}
