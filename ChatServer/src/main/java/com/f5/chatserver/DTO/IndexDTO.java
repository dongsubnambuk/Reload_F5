package com.f5.chatserver.DTO;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IndexDTO {
    private String title;
    private String content;
}
