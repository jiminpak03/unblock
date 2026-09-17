import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function useBoardSocket(
  token: string,
  boardId: string | undefined,
  onChange: () => void,
) {
  useEffect(() => {
    if (!boardId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/board/${boardId}`, () => onChange());
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [token, boardId, onChange]);
}

export default useBoardSocket;
