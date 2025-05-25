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
    @Value("${faiss_uri}")
    private String faiss_uri;
    @Value("${openai.openai_request_uri}")
    private String openai_request_uri;
    @Value("${pickup_server}")
    private String pickup_server;
    @Value("${account_server}")
    private String account_server;

    ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;
    private final MessageService messageService;

    public List<IndexDTO> searchQuestion(String question) {
        RestTemplate rt = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);  // JSON으로 변경 (필수!)

        // 요청 보낼 JSON 데이터 구성 (query를 담은 JSON)
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("query", question);

        HttpEntity<Map<String, String>> queryBody = new HttpEntity<>(requestBody, headers);
        ResponseEntity<IndexDTO[]> response = rt.exchange(
                faiss_uri,
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
        log.info("chatRequest: {}", chatRequest);
        chatResponse = restTemplate.postForEntity(
//                "https://8e93-34-59-222-17.ngrok-free.app/v1/chat/completions",
                openai_request_uri,
                chatRequest,
                String.class
        );
        log.info("chatResponse: {}", chatResponse);

        // chatResponse에서 body를 JSON으로 파싱하여 처리
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(chatResponse.getBody());
            String answerContent = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();
            log.info("message 원본: {}", answerContent);
            // ** 문자 삭제
            return ChatResponseDTO.builder()
                    // ** 문자 삭제
                    .answer(answerContent.replaceAll("[*][*]", ""))
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
//                "https://8e93-34-59-222-17.ngrok-free.app/v1/chat/completions",
                openai_request_uri,
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
            log.info("message 원본: {}", answerContent);

            // ** 문자 삭제
            return ChatResponseDTO.builder()
                    .answer(answerContent.replaceAll("[*][*]", ""))
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
                        당신은 '새로고침'의 고객 지원 챗봇 에코봇입니다. 친절하고 도움이 되는 태도로 응답해주세요.\s
                        \
                        사용자 질문과 제공된 'contents' 정보를 바탕으로 수거 상태에 관한 정보를 알려주세요.\
                        - 현재 총 수거 건수를 먼저 안내하세요\
                        - 최근 3건의 수거 정보만 날짜별로 정리해서 보여주세요\
                        - '오늘'이 언급된 질문에는 오늘 날짜(pickupDate)의 정보만 제공하세요\
                        - 진행 중인 수거가 없으면(빈 리스트) 그 사실을 알려주세요\
                        - 나머지 수거 정보는 마이페이지에서 확인 가능함을 안내하세요\
                        \
                        대답의 내용을 깔끔하고 가독성 좋게 정리해서 보여주세요.\
                        읽기 편하도록 내용에 스타일을 추가해주세요(이모지, 굵은 글씨 등).\
                        개행은 무조건 <br/> 태그를 사용하고, 굵은 글씨는 <span style="font-weight: 600;">텍스트</span> 형식으로 작성하세요.\
                        중요: 응답 내용에 절대로 별표(**)와 언더바 기호(__) 같은 마크다운 문법 기호를 사용하지 마세요. 강조가 필요할 때는 오직 <span style="font-weight: 600;">텍스트</span> HTML 태그만 사용하세요. 이모지는 사용해도 괜찮습니다.\
                        당신이 할 수 있을 만큼 최대한 프롬프트를 예쁘게 꾸며서 대답하세요.""";
            } else if (type.contains("price")) {
                return
                        """
                        당신은 '새로고침'의 고객 지원 챗봇 에코봇입니다. 친절하고 도움이 되는 태도로 응답해주세요.\s
                        \
                        사용자 질문과 제공된 'contents' 정보를 바탕으로 가격 정보를 알려주세요.\
                        - pricePreview가 아닌 price 값을 기준으로 정보를 정리해주세요\
                        - '오늘'이 언급된 질문에는 오늘 날짜(pickupDate)의 정보만 제공하세요\
                        - 진행 중인 수거가 없으면(빈 리스트) 그 사실을 알려주세요\
                        \
                        대답의 내용을 깔끔하고 가독성 좋게 정리해서 보여주세요.\
                        읽기 편하도록 내용에 스타일을 추가해주세요(이모지, 굵은 글씨 등).\
                        개행은 무조건 <br/> 태그를 사용하고, 굵은 글씨는 <span style="font-weight: 600;">텍스트</span> 형식으로 작성하세요.\
                        중요: 응답 내용에 절대로 별표(**)와 언더바 기호(__) 같은 마크다운 문법 기호를 사용하지 마세요. 강조가 필요할 때는 오직 <span style="font-weight: 600;">텍스트</span> HTML 태그만 사용하세요. 이모지는 사용해도 괜찮습니다.\
                        당신이 할 수 있을 만큼 최대한 프롬프트를 예쁘게 꾸며서 대답하세요.""";
            } else {
                return
                        """
                        당신은 '새로고침'의 고객 지원 챗봇 에코봇입니다. 친절하고 도움이 되는 태도로 응답해주세요.\s
                        \
                        사용자 질문과 제공된 'contents' 정보를 바탕으로 수거 관련 정보를 알려주세요.\
                        - 사용자의 질문에 맞게 정보를 선별하여 제공하세요\
                        - 정보를 명확하고 이해하기 쉽게 설명해주세요\
                        \
                        대답의 내용을 깔끔하고 가독성 좋게 정리해서 보여주세요.\
                        읽기 편하도록 내용에 스타일을 추가해주세요(이모지, 굵은 글씨 등).\
                        개행은 무조건 <br/> 태그를 사용하고, 굵은 글씨는 <span style="font-weight: 600;">텍스트</span> 형식으로 작성하세요.\
                        중요: 응답 내용에 절대로 별표(**)와 언더바 기호(__) 같은 마크다운 문법 기호를 사용하지 마세요. 강조가 필요할 때는 오직 <span style="font-weight: 600;">텍스트</span> HTML 태그만 사용하세요. 이모지는 사용해도 괜찮습니다.\
                        당신이 할 수 있을 만큼 최대한 프롬프트를 예쁘게 꾸며서 대답하세요.""";
            }
        } else {
            return
                    """
                    당신은 '새로고침'의 고객 지원 챗봇 에코봇입니다. 친절하고 도움이 되는 태도로 응답해주세요.\
                    \
                    사용자 질문과 제공된 'indexDTO' 정보를 바탕으로 답변을 작성해주세요.\
                    - 사용자 질문에 가장 적합한 title과 content를 선택하세요\
                    - 정보를 명확하고 간결하게 전달하세요\
                    - 임의로 내용을 추가하지 마세요\
                    \
                    대답의 내용을 깔끔하고 가독성 좋게 정리해서 보여주세요.\
                    읽기 편하도록 내용에 스타일을 추가해주세요(이모지, 굵은 글씨 등).\
                    개행은 무조건 <br/> 태그를 사용하고, 굵은 글씨는 <span style="font-weight: 600;">텍스트</span> 형식으로 작성하세요.\
                    중요: 응답 내용에 절대로 별 기호(**)와 언더바 기호(__) 같은 마크다운 문법 기호를 사용하지 마세요. 강조가 필요할 때는 오직 <span style="font-weight: 600;">텍스트</span> HTML 태그만 사용하세요. 이모지는 사용해도 괜찮습니다.\
                    당신이 할 수 있을 만큼 최대한 프롬프트를 예쁘게 꾸며서 대답하세요.""";
        }
    }

    private static HttpEntity<Map<String, Object>> getMapHttpEntity(String indexDTOs, HttpHeaders headers, String question, String type) {
        Map<String, Object> chatBody = Map.of(
                "model", "gpt-4.1-nano",
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

        log.info("account 요청");
        Map<String, String> body = Map.of("today", today.toString());
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map<String, UserDetailDTO>> response = restTemplate.exchange(
                account_server+"/user-list",
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<>() {
                }
        );
        log.info("account 응답");

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

                log.info("pickup 요청");
                // 일치하는 이메일을 사용해 요청을 보냄
                ResponseEntity<PickupStatusDTO[]> innerResponse = restTemplate.exchange(
                        pickup_server+"/my-pickup?email={email}",
                        HttpMethod.GET,
                        entity,
                        PickupStatusDTO[].class,
                        email
                );
                log.info("pickup 응답");

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
