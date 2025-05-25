package com.f5.chatserver.WebSocket;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class WebSocketSessionTracker {

    // 연결된 세션 ID 저장용
    private final Set<String> connectedSessions = ConcurrentHashMap.newKeySet();

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        connectedSessions.add(sessionId);

        log.info("✅ 새 WebSocket 연결: sessionId = {} (총 {}개 연결됨)", sessionId, connectedSessions.size());
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        connectedSessions.remove(sessionId);

        log.info("❌ WebSocket 연결 해제: sessionId = {} (총 {}개 연결됨)", sessionId, connectedSessions.size());
    }

    public int getCurrentConnectionCount() {
        return connectedSessions.size();
    }

    @Scheduled(fixedRate = 600000)
    public void logActiveConnections() {
        log.info("📊 현재 WebSocket 연결 수: {}", connectedSessions.size());
    }
}
