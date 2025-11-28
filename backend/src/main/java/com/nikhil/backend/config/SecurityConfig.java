package com.nikhil.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import com.nikhil.backend.services.implementation.CustomOidcUserService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOidcUserService customOidcUserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration cfg = new CorsConfiguration();
                cfg.addAllowedOrigin("http://localhost:3000");
                cfg.addAllowedHeader("*");
                cfg.addAllowedMethod("*");
                cfg.setAllowCredentials(true);
                return cfg;
            }))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/api/public").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> 
                    userInfo.oidcUserService(customOidcUserService)
                )
                .defaultSuccessUrl("http://localhost:3000/dashboard", true)
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/logout-success")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> 
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED)
                )
                .accessDeniedHandler((req, res, e) -> 
                    res.sendError(HttpServletResponse.SC_FORBIDDEN)
                )
            );

        return http.build();
    }
}