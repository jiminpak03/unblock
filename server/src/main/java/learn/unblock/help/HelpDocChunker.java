package learn.unblock.help;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class HelpDocChunker {

    private static final int MAX_CHUNK_CHARS = 800;

    private HelpDocChunker() {
    }

    public static List<HelpChunk> chunkDirectory(Path docsDir) throws IOException {
        List<HelpChunk> chunks = new ArrayList<>();
        try (Stream<Path> files = Files.list(docsDir)) {
            List<Path> sorted = files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".md") || p.toString().endsWith(".txt"))
                    .sorted()
                    .toList();

            for (Path file : sorted) {
                String source = file.getFileName().toString();
                List<String> pieces = chunkText(Files.readString(file));
                for (int i = 0; i < pieces.size(); i++) {
                    chunks.add(new HelpChunk(source + "#" + i, source, pieces.get(i), null));
                }
            }
        }
        return chunks;
    }

    public static List<String> chunkText(String text) {
        String[] paragraphs = text.split("\\n\\s*\\n");
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            String trimmed = paragraph.trim();
            if (trimmed.isEmpty()) continue;

            if (!current.isEmpty() && current.length() + trimmed.length() + 2 > MAX_CHUNK_CHARS) {
                chunks.add(current.toString());
                current.setLength(0);
            }
            if (!current.isEmpty()) current.append("\n\n");
            current.append(trimmed);
        }
        if (!current.isEmpty()) chunks.add(current.toString());

        return chunks;
    }
}
