package com.f5.chatserver.WebSocket;

import com.f5.chatserver.DTO.MessageDTO;
import com.f5.chatserver.Service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final MessageService messageService;

    @EventListener
    public void handleSubscription(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination(); // 예: "/topic/chat/80"

        if (destination != null && destination.startsWith("/topic/chat/")) {
            // chatId 추출
            try {
                Long chatId = Long.parseLong(destination.substring("/topic/chat/".length()));

                // 환영 메시지 전송
                MessageDTO welcomeMessage = MessageDTO.builder()
                        .chatId(chatId)
                        .sender("새로고침")
                        .content(" 안녕하세요! 저는 새로고침의 진짜 친구, 챗봇 새진이에요!<br/> 사이트 이용 방법, 환경 보호, 재활용, 쓰레기 수거, 업사이클링까지!<br/> 궁금한 게 있으면 언제든지 저를 불러주세요.")
                        .build();

                messagingTemplate.convertAndSend(destination, welcomeMessage);

                messageService.saveMessage(welcomeMessage);
                log.info("채팅방 {} 시작 메시지 전송 성공 (구독 감지 기반)", chatId);
            } catch (NumberFormatException e) {
                log.warn("채팅방 구독 destination 파싱 실패: {}", destination);
            }
        }
    }
}

