package learn.unblock.models.dtos;

public class GraphEdge {
    private int cardId;
    private int dependsOnCardId;

    public GraphEdge(int cardId, int dependsOnCardId) {
        this.cardId = cardId;
        this.dependsOnCardId = dependsOnCardId;
    }

    public int getCardId() {
        return cardId;
    }

    public int getDependsOnCardId() {
        return dependsOnCardId;
    }
}