package com.f5.chatserver.Service;

import com.f5.chatserver.DTO.Account.UserDetailDTO;
import com.f5.chatserver.DTO.ChatResponseDTO;
import com.f5.chatserver.DTO.IndexDTO;
import com.f5.chatserver.DTO.PickupStatusDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {
    @Value("${openai.openai_api_key}")
    private String openai_api_key;
    @Value("${openai.project-id}")
    private String openai_project_id;
    @Value("${openai.organization-id}")
    private String openai_organization_id;

    private final RestTemplate restTemplate;

    public List<IndexDTO> searchQuestion(String question) {
        RestTemplate rt = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);  // JSON으로 변경 (필수!)

        // 요청 보낼 JSON 데이터 구성 (query를 담은 JSON)
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("query", question);

        HttpEntity<Map<String, String>> queryBody = new HttpEntity<>(requestBody, headers);
        ResponseEntity<IndexDTO[]> response = rt.exchange(
                "http://52.78.201.40:9000/search",
                HttpMethod.POST,
                queryBody,
                IndexDTO[].class
        );
        return Arrays.asList(Objects.requireNonNull(response.getBody()));
    }

    public static LocalDate convertStringToLocalDate(String dateStr, String format) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
            return LocalDate.parse(dateStr, formatter);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format or value: " + dateStr, e);
        }
    }

    @Override
    public ChatResponseDTO searchAnswer(String question, String sender) {
        String format = "yyyy-MM-dd";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + openai_api_key);
        headers.add("OpenAI-Organization", openai_organization_id);
        headers.add("OpenAI-Project", openai_project_id);
        headers.setContentType(MediaType.APPLICATION_JSON);
        if(question.contains("수거") &&
                question.contains("오늘") &&
                question.contains("상태") ||
                question.contains("진행")) {
            LocalDate today = LocalDate.now();
            LocalDate formattedToday = convertStringToLocalDate(today.toString(), format);
            List<PickupStatusDTO> pickups = getPickupStatus(formattedToday, sender);
            HttpEntity<Map<String, Object>> chatRequest = getMapHttpEntity(pickups.toString(), headers, question);

            ResponseEntity<String> chatResponse;
            chatResponse = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    chatRequest,
                    String.class
            );

            // chatResponse에서 body를 JSON으로 파싱하여 처리
            ObjectMapper mapper = new ObjectMapper();
            try {
                JsonNode root = mapper.readTree(chatResponse.getBody());
                String answerContent = root
                        .path("choices").get(0)
                        .path("message")
                        .path("content")
                        .asText();
                log.info("message: {}", answerContent);

                return ChatResponseDTO.builder()
                        .answer(answerContent)
                        .question(question)
                        .build();  // ChatResponseDTO 생성자 또는 setter 사용
            } catch (JsonProcessingException e) {
                throw new RuntimeException("JSON Parsing 실패: " + e.getMessage());
            }


        } else if (question.contains("수거") &&
                question.contains("오늘") &&
                question.contains("가격")){

        }
        IndexDTO[] indexDTOs = searchQuestion(question).toArray(new IndexDTO[0]);
        HttpEntity<Map<String, Object>> chatRequest = getMapHttpEntity(Arrays.toString(indexDTOs), headers, question);

        ResponseEntity<String> chatResponse = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions",
                chatRequest,
                String.class
        );

        // chatResponse에서 body를 JSON으로 파싱하여 처리
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(chatResponse.getBody());
            String answerContent = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();

            return ChatResponseDTO.builder()
                    .answer(answerContent)
                    .question(question)
                    .build();  // ChatResponseDTO 생성자 또는 setter 사용
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON Parsing 실패: " + e.getMessage());
        }
    }


    private static HttpEntity<Map<String, Object>> getMapHttpEntity(String indexDTOs, HttpHeaders headers, String question) {
        Map<String, Object> chatBody = Map.of(
                "model", "gpt-4",
                "messages", List.of(
                        Map.of("role", "system", "content", """
                                너는 고객 지원용 챗봇이야. 아래는 기본적인 너의 인격을 말해줄게.\s
                                안녕하세요! 저는 새로고침의 진짜 친구, 챗봇 새진이에요!\
                                환경 보호, 재활용, 쓰레기 수거, 업사이클링까지! 궁금한 게 있으면 언제든지 저를 불러주세요.
                                이걸 기반으로 보내준 벡터 DB의 결과인 'contents' 와 '사용자 질문'을 보고 답변을 만들어줘.\
                                DTO 같은 객체 그대로 보내지 말고 정리해서 보내.\
                                수거 상태 관련 질문의 경우 현재 수거 총 갯수는 몇개이며 날짜별로 진행상황이 어떤지 적어야해.\
                                만약 빈 리스트가 온다면 현재 진행중인게 없다고 답변하면 돼.\
                                개행문자는 HTML 형식으로 <br/>로 적어서 보내줘."""),
                        Map.of("role", "user", "content","contents: " +
                                indexDTOs +
                                "\n\n사용자 질문: " + question)
                )
        );
        return new HttpEntity<>(chatBody, headers);
    }

    public List<PickupStatusDTO> getPickupStatus(LocalDate today, String sender) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of("today", today.toString());
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map<String, UserDetailDTO>> response = restTemplate.exchange(
                "http://172.35.2.84:11000/api/account/user-list",
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<>() {
                }
        );

        Map<String, UserDetailDTO> users = response.getBody();
        List<PickupStatusDTO> pickupStatusDTOs = new ArrayList<>();

        if (users == null || users.isEmpty()) {
            return List.of();
        }

        for (Map.Entry<String, UserDetailDTO> entry : users.entrySet()) {
            String email = entry.getKey();
            UserDetailDTO userDetail = entry.getValue();

            if (userDetail.getName().equals(sender)) {
                HttpHeaders innerHeaders = new HttpHeaders();
                innerHeaders.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Void> entity = new HttpEntity<>(innerHeaders);

                // 일치하는 이메일을 사용해 요청을 보냄
                ResponseEntity<PickupStatusDTO[]> innerResponse = restTemplate.exchange(
                        "http://3.37.122.192:12000/api/pickup/my-pickup?email={email}",
                        HttpMethod.GET,
                        entity,
                        PickupStatusDTO[].class,
                        email
                );

                PickupStatusDTO[] result = innerResponse.getBody();
                pickupStatusDTOs.addAll(Arrays.asList(result));
                return pickupStatusDTOs;
            }

            // sender와 일치하는 항목이 없으면 빈 리스트 반환
            if (pickupStatusDTOs.isEmpty()) {
                return List.of();
            }

            return pickupStatusDTOs;
        }
        return List.of();
    }
}
