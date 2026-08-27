package learn.unblock.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import learn.unblock.models.dtos.UserWithoutPassword;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtConverter {

    private final SecretKey key;
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours

    public JwtConverter(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String getToken(UserWithoutPassword user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("username", user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(EXPIRATION_MS)))
                .signWith(key)
                .compact();
    }

    public UserWithoutPassword getUserFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            int id = Integer.parseInt(claims.getSubject());
            String username = claims.get("username", String.class);
            return new UserWithoutPassword(id, username);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}