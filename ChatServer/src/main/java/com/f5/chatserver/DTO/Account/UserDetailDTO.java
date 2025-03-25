package com.f5.chatserver.DTO.Account;

import lombok.*;

@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {
    private Long id;
    private String name;
    private Long postalCode;
    private String roadNameAddress;
    private String detailedAddress;
    private String phoneNumber;
}
