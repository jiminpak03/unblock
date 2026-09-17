package learn.unblock.websocket;

import learn.unblock.models.dtos.UserWithoutPassword;
import learn.unblock.security.JwtConverter;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtConverter jwtConverter;

    public JwtChannelInterceptor(JwtConverter jwtConverter) {
        this.jwtConverter = jwtConverter;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String token = authHeader != null ? authHeader.replace("Bearer ", "") : null;
            UserWithoutPassword user = token != null ? jwtConverter.getUserFromToken(token) : null;

            if (user == null) {
                throw new MessagingException("Invalid or missing token.");
            }
        }

        return message;
    }
}
