package com.f5.chatserver.DAO;

import com.f5.chatserver.DTO.MessageDTO;
import com.f5.chatserver.Entity.ChatEntity;
import com.f5.chatserver.Entity.MessageEntity;
import com.f5.chatserver.Repository.ChatRepository;
import com.f5.chatserver.Repository.MessageRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Slf4j
@Component
@Transactional
public class MessageDAOImpl implements MessageDAO {
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    public MessageDAOImpl(MessageRepository messageRepository, ChatRepository chatRepository) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
    }

    @Override
    public void addMessage(MessageDTO messageDTO) {
        try {
            ChatEntity chatEntity = chatRepository.findByChatId(messageDTO.getChatId());
            if (chatEntity == null) {
                log.error("❌ 채팅방 ID {} 에 해당하는 ChatEntity 없음", messageDTO.getChatId());
                throw new IllegalArgumentException("유효하지 않은 채팅방 ID입니다.");
            }

            if (messageDTO.getContent() == null || messageDTO.getSender() == null) {
                log.error("❌ 메세지 내용 또는 보낸 사람 정보 누락됨: content={}, sender={}",
                        messageDTO.getContent(), messageDTO.getSender());
                throw new IllegalArgumentException("메세지 내용이나 보낸 사람이 비어있습니다.");
            }

            MessageEntity messageEntity = new MessageEntity();
            messageEntity.setChatEntity(chatEntity);
            messageEntity.setContent(messageDTO.getContent());
            messageEntity.setSender(messageDTO.getSender());

            // 한국 시간 기준으로 설정
            LocalDateTime koreaTime = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDateTime();
            messageEntity.setSendTime(koreaTime);

            messageRepository.save(messageEntity);
        } catch (Exception e) {
            log.error("❗ 메세지 저장 중 예외 발생", e);
            throw new IllegalStateException("메세지 저장 실패");
        }
    }
}
