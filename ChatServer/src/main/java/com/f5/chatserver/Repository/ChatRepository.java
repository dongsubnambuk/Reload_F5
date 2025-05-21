package com.f5.chatserver.Repository;

import com.f5.chatserver.Entity.ChatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatEntity, Long> {
    ChatEntity findByChatId(Long chatId);
    List<ChatEntity> findAllByEmail(String email);
    Boolean existsByEmail(String email);
    ChatEntity findByEmail(String email);
}
