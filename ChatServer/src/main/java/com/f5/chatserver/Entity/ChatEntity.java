package com.f5.chatserver.Entity;

import com.f5.chatserver.DTO.ChatDTO;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="chat")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String sender;

    @Column
    private Boolean bot;

    public ChatDTO toChatDTO(){
        return ChatDTO.builder()
                .chatId(chatId)
                .email(email)
                .sender(sender)
                .bot(bot)
                .build();
    }
}
