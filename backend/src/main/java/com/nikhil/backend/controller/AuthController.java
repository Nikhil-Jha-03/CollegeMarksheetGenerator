package com.nikhil.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nikhil.backend.entity.User;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserInfo(
        OAuth2AuthenticationToken authentication) {

    if (authentication == null) {
        return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED)
                .body(new ApiResponse<>(false, "Unauthorized", null));
    }

    String email = authentication.getPrincipal().getAttribute("email");

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Map<String, Object> map = Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name()
    );

    return ResponseEntity.ok(new ApiResponse<>(true, "User Fetched", map));
}

    @GetMapping("/logout-success")
    public ResponseEntity<ApiResponse<Void>> logoutSuccess() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful", null));
    }

}
