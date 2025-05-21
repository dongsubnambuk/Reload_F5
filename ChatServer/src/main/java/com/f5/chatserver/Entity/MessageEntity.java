package com.f5.chatserver.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="message")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chat_id", referencedColumnName = "chatId", nullable = false)
    private ChatEntity chatEntity;

    @Lob
    @Column(nullable = false, length = 10000)
    private String content;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false)
    private LocalDateTime sendTime;
}
