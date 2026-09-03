package learn.unblock.models.dtos;

import learn.unblock.models.Card;

import java.util.List;

public class GraphResponse {
    private List<Card> nodes;
    private List<GraphEdge> edges;

    public GraphResponse(List<Card> nodes, List<GraphEdge> edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    public List<Card> getNodes() {
        return nodes;
    }

    public List<GraphEdge> getEdges() {
        return edges;
    }
}