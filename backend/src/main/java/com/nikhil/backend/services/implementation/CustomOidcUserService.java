package com.nikhil.backend.services.implementation;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import com.nikhil.backend.entity.Role;
import com.nikhil.backend.entity.User;
import com.nikhil.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class CustomOidcUserService extends OidcUserService {

    public final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        String registrationId = userRequest
                .getClientRegistration()
                .getRegistrationId();

        log.info("Registration ID: {}", registrationId);

        // Load user from the OAuth2 provider
        OidcUser oidcUser = super.loadUser(userRequest);

        String userEmail = oidcUser.getEmail();
        String userName = oidcUser.getFullName();

        User user = userRepository.findByEmail(userEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(userEmail);
            newUser.setName(userName);
            newUser.setRole(Role.USER);
            return userRepository.save(newUser);
        });
        
        var authorities = Set.of(new SimpleGrantedAuthority(user.getRole().name()));

        return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}