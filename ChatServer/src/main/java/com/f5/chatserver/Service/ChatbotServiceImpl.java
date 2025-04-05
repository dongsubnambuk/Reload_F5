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

    ObjectMapper objectMapper = new ObjectMapper();
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
        try {
            String json = objectMapper.writeValueAsString(response.getBody());
            log.info(json);
        } catch (Exception e) {
            log.error("응답을 JSON으로 변환하는 데 실패했습니다", e);
        }
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

    public ChatResponseDTO returnData(String index, HttpHeaders headers, String question, String type) {
        HttpEntity<Map<String, Object>> chatRequest = getMapHttpEntity(index, headers, question, type);

        ResponseEntity<String> chatResponse;
        chatResponse = restTemplate.postForEntity(
//                "https://7b0c-34-143-211-17.ngrok-free.app/v1/chat/completions",
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
    }

    @Override
    public ChatResponseDTO searchAnswer(String question, String sender) {
        String format = "yyyy-MM-dd";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + openai_api_key);
        headers.add("OpenAI-Organization", openai_organization_id);
        headers.add("OpenAI-Project", openai_project_id);
        headers.setContentType(MediaType.APPLICATION_JSON);
        if(question.contains("수거")) {
            if(question.contains("상태") ||
                    question.contains("진행")) {

                LocalDate today = LocalDate.now();
                LocalDate formattedToday = convertStringToLocalDate(today.toString(), format);
                List<PickupStatusDTO> pickups = getPickupStatus(formattedToday, sender);

                return returnData(pickups.toString(), headers, question, "pickup-status");

            } else if (question.contains("가격")) {

                LocalDate today = LocalDate.now();
                LocalDate formattedToday = convertStringToLocalDate(today.toString(), format);
                List<PickupStatusDTO> pickups = getPickupStatus(formattedToday, sender);

                return returnData(pickups.toString(), headers, question, "pickup-price");
            }
        }
        String json;
        try {
            json = objectMapper.writeValueAsString(searchQuestion(question));
            log.info(json);
        } catch (Exception e) {
            log.error("응답을 JSON으로 변환하는 데 실패했습니다", e);
            throw new IllegalStateException(e);
        }
        HttpEntity<Map<String, Object>> chatRequest = getMapHttpEntity(json, headers, question, "normal");

        ResponseEntity<String> chatResponse = restTemplate.postForEntity(
//                "https://7b0c-34-143-211-17.ngrok-free.app/v1/chat/completions",
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

    public static String gptContent(String type) {
        if(type.contains("pickup")) {
            if(type.contains("status")) {
                return
                        """
                                너는 고객 지원용 챗봇이야. 아래는 기본적인 너의 인격을 말해줄게.\s
                                안녕하세요! 저는 새로고침의 진짜 친구, 챗봇 새진이에요!\
                                사이트 이용 방법, 환경 보호, 재활용, 쓰레기 수거, 업사이클링까지! 궁금한 게 있으면 언제든지 저를 불러주세요.\
                                이걸 기반으로 보내준 벡터 DB의 결과인 'contents' 와 '사용자 질문'을 보고 답변을 만들어줘.\
                                DTO 같은 객체 그대로 보내지 말고 정리해서 보내.\
                                수거 상태 관련 질문의 경우 현재 수거 총 갯수는 몇개이며 날짜별로 진행상황이 어떤지 적어야해.\
                                만약 질문에 오늘이라는게 포함되어 있으면, pickupDate 가 오늘인 정보만 정리해서 보내면 돼.\
                                나머지 요청들은 적당히 사용자 질문을 보고 판단해서 보내줘.\
                                만약 빈 리스트가 온다면 현재 진행중인게 없다고 답변하면 돼.\
                                개행문자는 모두 HTML 형식으로 <br/>로 적어서 보내줘.""";
            } else if (type.contains("price")) {
                return
                        """
                                너는 고객 지원용 챗봇이야. 아래는 기본적인 너의 인격을 말해줄게.\s
                                안녕하세요! 저는 새로고침의 진짜 친구, 챗봇 새진이에요!\
                                사이트 이용 방법, 환경 보호, 재활용, 쓰레기 수거, 업사이클링까지! 궁금한 게 있으면 언제든지 저를 불러주세요.\
                                이걸 기반으로 보내준 벡터 DB의 결과인 'contents' 와 '사용자 질문'을 보고 답변을 만들어줘.\
                                DTO 같은 객체 그대로 보내지 말고 정리해서 보내.\
                                이 질문은 pricePreview 가 아닌 price 의 값을 보고 정리해서 보내면 돼.\
                                만약 질문에 오늘이라는게 포함되어 있으면 pickupDate 를 보고 오늘인 것만 보내면 돼.\
                                만약 빈 리스트가 온다면 현재 진행중인게 없다고 답변하면 돼.\
                                개행문자는 모두 HTML 형식으로 <br/>로 적어서 보내줘.""";
            } else {
                return
                        """
                        너는 고객 지원용 챗봇이야. 아래는 기본적인 너의 인격을 말해줄게.\s
                        안녕하세요! 저는 새로고침의 진짜 친구, 챗봇 새진이에요!\
                        사이트 이용 방법, 환경 보호, 재활용, 쓰레기 수거, 업사이클링까지! 궁금한 게 있으면 언제든지 저를 불러주세요.\
                        이걸 기반으로 보내준 벡터 DB의 결과인 'contents' 와 '사용자 질문'을 보고 답변을 만들어줘.\
                        """;
            }
        } else {
            return
                    """
                    너는 고객 지원용 챗봇이야. 아래는 기본적인 너의 인격을 말해줄게.\s
                    안녕하세요! 저는 새로고침의 진짜 친구, 챗봇 새진이에요!\
                    사이트 이용 방법, 환경 보호, 재활용, 쓰레기 수거, 업사이클링까지! 궁금한 게 있으면 언제든지 저를 불러주세요.\
                    이걸 기반으로 보내준 벡터 DB의 결과인 'indexDTO' 와 '사용자 질문'을 보고 답변을 만들어줘.\
                    사용자 질문에 맞게 indexDTO 의 title 과 content 를 보고 가장 알맞는 내용을 골라.\
                    깔끔하게 정리해서 보내.\
                    절대로 임의의 내용을 추가하지 마.\
                    """;
        }
    }

    private static HttpEntity<Map<String, Object>> getMapHttpEntity(String indexDTOs, HttpHeaders headers, String question, String type) {
        Map<String, Object> chatBody = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", gptContent(type)),
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
