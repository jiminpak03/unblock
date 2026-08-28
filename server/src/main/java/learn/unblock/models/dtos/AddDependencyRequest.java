package learn.unblock.models.dtos;

public class AddDependencyRequest {
    private int dependsOnCardId;
    public int getDependsOnCardId() { return dependsOnCardId; }
    public void setDependsOnCardId(int dependsOnCardId) { this.dependsOnCardId = dependsOnCardId; }
}