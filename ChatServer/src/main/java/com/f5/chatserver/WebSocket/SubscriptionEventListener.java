package com.f5.chatserver.WebSocket;

import com.f5.chatserver.DTO.MessageDTO;
import com.f5.chatserver.Entity.ChatEntity;
import com.f5.chatserver.Entity.MessageEntity;
import com.f5.chatserver.Repository.ChatRepository;
import com.f5.chatserver.Repository.MessageRepository;
import com.f5.chatserver.Service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final MessageService messageService;
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    private Map<Long, List<String>> chatRoomMap;

    @EventListener
    public void handleSubscription(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination(); // 예: "/topic/chat/80"
        String sessionId = accessor.getSessionId();
        if (destination != null && destination.startsWith("/topic/chat/")) {
            // chatId 추출
            Long chatId = Long.parseLong(destination.substring("/topic/chat/".length()));
            try {
                List<MessageEntity> messageEntityList = messageRepository.findAllByChatEntity(chatRepository.findByChatId(chatId));
                messageEntityList.sort(Comparator.comparing(MessageEntity::getSendTime));
                for (MessageEntity messageEntity : messageEntityList) {
                    messagingTemplate.convertAndSend("/topic/chat/" + chatId,
                            MessageDTO.builder()
                                    .chatId(chatId)
                                    .content(messageEntity.getContent())
                                    .sender(messageEntity.getSender())
                                    .sendTime(messageEntity.getSendTime())
                                    .build());
                }

                // 환영 메시지 전송
                MessageDTO welcomeMessage = MessageDTO.builder()
                        .chatId(chatId)
                        .sender("새로고침")
                        .content("""
                               안녕하세요! 😊<br>\
                               <br>새로고침의 고객 지원 챗봇 <span style="font-weight: 600;">에코봇</span>입니다.\
                               <br>혹시 궁금하신 점이나 도움이 필요하시면 언제든 말씀해 주세요!<br>\
                               <br>상담사와의 <span style="font-weight: 600;">1대1 문의</span>가 필요하신 경우<br>\
                               좌측 하단의 <span style="font-weight: 600;">상담사</span> 버튼을 눌러주세요.<br>\
                               <br>감사합니다. 💌
                               """)
                        .build();

                messagingTemplate.convertAndSend(destination, welcomeMessage);

                messageService.saveMessage(welcomeMessage);
                log.info("채팅방 {} 시작 메시지 전송 성공 (구독 감지 기반)", chatId);
            } catch (NumberFormatException e) {
                log.warn("채팅방 구독 destination 파싱 실패: {}", destination);
            }
        } else if (destination != null && destination.startsWith("/topic/admin/new-room")) {
            List<ChatEntity> chatEntities = chatRepository.findAll();
            for (Long chatId : chatEntities.stream().map(ChatEntity::getChatId).toList()) {
                List<MessageEntity> messageEntityList = messageRepository.findAllByChatEntity(chatRepository.findByChatId(chatId));
                messageEntityList.sort(Comparator.comparing(MessageEntity::getSendTime));
                for (MessageEntity messageEntity : messageEntityList) {
                    messagingTemplate.convertAndSend("/topic/admin/new-room",
                            MessageDTO.builder()
                                    .chatId(chatId)
                                    .content(messageEntity.getContent())
                                    .sender(messageEntity.getSender())
                                    .sendTime(messageEntity.getSendTime())
                                    .build());
                }
            }
            log.info("어드민 방 로드 메시지 전송 성공 (구독 감지 기반)");
        }
    }
}

