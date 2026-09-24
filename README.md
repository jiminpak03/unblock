# unblock
kanban board with dependency visualization for group projects, game jams, and more

## Running with Docker

```
cp .env.example .env   # fill in real secrets
docker compose up --build
```

- Client: http://localhost:5173
- Server: http://localhost:8080

The client and server are published on the same ports the app already
hardcodes for local dev (5173/8080), so no source changes were needed to
containerize them. The `/api/help/ask` feature needs an Ollama instance
reachable at `OLLAMA_BASE_URL` (defaults to one running on the host).
