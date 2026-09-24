package learn.unblock.help;

public class HelpChunk {
    private String id;
    private String source;
    private String content;
    private float[] embedding;

    public HelpChunk() {
    }

    public HelpChunk(String id, String source, String content, float[] embedding) {
        this.id = id;
        this.source = source;
        this.content = content;
        this.embedding = embedding;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public float[] getEmbedding() { return embedding; }
    public void setEmbedding(float[] embedding) { this.embedding = embedding; }
}
