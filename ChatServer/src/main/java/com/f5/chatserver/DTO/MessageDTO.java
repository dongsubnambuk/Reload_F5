package com.f5.chatserver.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class MessageDTO {
    private Long chatId;
    private String content;
    private String sender;
    private LocalDateTime sendTime;
}