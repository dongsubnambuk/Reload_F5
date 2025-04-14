package com.f5.chatserver.Service;

import com.f5.chatserver.DTO.MessageDTO;
import com.f5.chatserver.Entity.ChatEntity;
import com.f5.chatserver.Entity.MessageEntity;
import com.f5.chatserver.Repository.ChatRepository;
import com.f5.chatserver.Repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatManageServiceImpl implements ChatManageService {
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void loadDetails(){
        LinkedHashMap<Long, List<MessageDTO>> details = new LinkedHashMap<>();
        List<ChatEntity> chatEntityList = chatRepository.findAll();
        for(ChatEntity chatEntity : chatEntityList){
            List<MessageEntity> messageEntityList = messageRepository.findAllByChatEntity(chatEntity);
            List<MessageDTO> messageDTOS = new ArrayList<>();
            for(MessageEntity messageEntity : messageEntityList){
                messageDTOS.add(MessageDTO.builder()
                        .chatId(chatEntity.getChatId())
                        .content(messageEntity.getContent())
                        .sender(messageEntity.getSender())
                        .build());
            }
            details.put(chatEntity.getChatId(), messageDTOS);
        }
        messagingTemplate.convertAndSend("/topic/admin/new-room", details);
        log.info("어드민 전체 채팅방 전송 성공");
    }

    @Override
    public void sendMessageList(Long chatId) {
        List<MessageDTO> messageDTOS = new ArrayList<>();
        List<MessageEntity> messageEntityList = messageRepository.findAllByChatEntity(chatRepository.findByChatId(chatId));

        for (MessageEntity messageEntity : messageEntityList) {
            messageDTOS.add(MessageDTO.builder()
                    .chatId(chatId)
                    .content(messageEntity.getContent())
                    .sender(messageEntity.getSender())
                    .build());
        }
        log.info(messageDTOS.toString());

        messagingTemplate.convertAndSend("/topic/chat/" + chatId, messageDTOS);
        log.info("유저 {} 채팅방 이전 메세지 전송 성공", chatId);
    }
}