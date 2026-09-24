package learn.unblock.help.dtos;

import java.util.List;

public class AskHelpResponse {
    private String answer;
    private List<String> sources;

    public AskHelpResponse() {
    }

    public AskHelpResponse(String answer, List<String> sources) {
        this.answer = answer;
        this.sources = sources;
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public List<String> getSources() { return sources; }
    public void setSources(List<String> sources) { this.sources = sources; }
}
