package com.f5.accountserver.Service.Communication;

import java.net.URISyntaxException;

public interface CommunicationService {
    String getEmail(Long id) throws URISyntaxException;
    Long searchInfo(String username) throws URISyntaxException;
}
