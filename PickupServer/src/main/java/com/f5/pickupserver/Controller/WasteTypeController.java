package com.f5.pickupserver.Controller;

import com.f5.pickupserver.DTO.Respons.StatusCodeDTO;
import com.f5.pickupserver.DTO.WasteTypeDTO;
import com.f5.pickupserver.Service.WasteTypeService;
import com.f5.pickupserver.waste.WasteCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/pickup/waste")
@RequiredArgsConstructor
public class WasteTypeController {
    private final WasteTypeService wasteTypeService;
    private final WasteCache wasteCache;

    @GetMapping("/type-list")
    public ResponseEntity<?> getWasteTypeList() {
        return ResponseEntity.ok(wasteCache.getAll());
    }
}
