package com.f5.chatserver.Service;

import com.f5.chatserver.DTO.ChatResponseDTO;

public interface ChatbotService {
    ChatResponseDTO searchAnswer(String question, String sender);
}
