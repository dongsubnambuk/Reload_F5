package com.f5.pickupserver.waste;

import com.f5.pickupserver.DTO.WasteTypeDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 폐기물 단가 데이터 캐시
@Component
public class WasteCache {
    private final Map<String, WasteTypeDTO> wasteItemMap = new HashMap<>();
    private final Map<String, List<WasteTypeDTO>> wasteItemListMap = new HashMap<>();

    @PostConstruct
    public void init() {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            Map<String, List<WasteTypeDTO>> allData = objectMapper.readValue(
                    new ClassPathResource("data/waste_price_data.json").getInputStream(),
                    new TypeReference<>() {}
            );
            wasteItemListMap.putAll(allData);
            for (List<WasteTypeDTO> list : allData.values()) {
                for (WasteTypeDTO dto : list) {
                    wasteItemMap.put(dto.getId(), dto);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("폐기물 단가 JSON 로드 실패", e);
        }
    }

    public Map<String, List<WasteTypeDTO>> getAll() {
        return wasteItemListMap;
    }

    public WasteTypeDTO getById(String id) {
        return wasteItemMap.get(id);
    }

    public String getTypeById(String id) {
        WasteTypeDTO dto = getById(id);
        return dto != null ? dto.getType() : null;
    }

    public long getPriceById(String id) {
        WasteTypeDTO dto = getById(id);
        return dto != null ? dto.getPrice() : 0;
    }
}