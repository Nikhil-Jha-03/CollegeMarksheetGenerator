package com.nikhil.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class AuthController {

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserInfo(OAuth2AuthenticationToken authentication) {

        log.info("Fetching user info");
        if (authentication == null) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(null);
        }

        String userName = authentication.getPrincipal().getAttribute("name");
        String userEmail = authentication.getPrincipal().getAttribute("email");

        Map<String, Object> map = Map.of(
                "name", userName,
                "email", userEmail);

        return ResponseEntity.ok(map);
    }

}
