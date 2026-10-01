package learn.unblock.boardqa.dtos;

public class AskBoardQuestionResponse {
    private String answer;

    public AskBoardQuestionResponse() {
    }

    public AskBoardQuestionResponse(String answer) {
        this.answer = answer;
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
}
