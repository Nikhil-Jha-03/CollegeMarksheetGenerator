package com.nikhil.backend.services.implementation;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        String registrationId = userRequest
                .getClientRegistration()
                .getRegistrationId();

        log.info("Registration ID: {}", registrationId);

        // Load user from the OAuth2 provider
        OidcUser oidcUser = super.loadUser(userRequest);

        // Log user info
        log.info("User Email: {}", oidcUser.getEmail());
        log.info("User Name: {}", oidcUser.getFullName());
        log.info("User Subject: {}", oidcUser.getSubject());

        // TODO: Save or update user in your database here
        // Example: userRepository.save(...)

        return oidcUser;
    }
}