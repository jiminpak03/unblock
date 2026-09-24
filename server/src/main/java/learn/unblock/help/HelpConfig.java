package learn.unblock.help;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HelpConfig {

    @Bean
    public OllamaClient ollamaClient(@Value("${ollama.base-url}") String baseUrl) {
        return new OllamaClient(baseUrl);
    }
}
