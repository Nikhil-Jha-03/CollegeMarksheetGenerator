package com.nikhil.backend.config;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${frontend.url}")
    private String frontendUrl;

    private final CustomOidcUserService customOidcUserService;

    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    // http
    // .cors(cors -> cors.configurationSource(request -> {
    // CorsConfiguration cfg = new CorsConfiguration();
    // cfg.addAllowedOriginPattern(frontendUrl);
    // cfg.addAllowedHeader("*");
    // cfg.addAllowedMethod("*");
    // cfg.setAllowCredentials(true);
    // return cfg;
    // }))
    // .csrf(csrf -> csrf.disable())
    // .authorizeHttpRequests(auth -> auth
    // .requestMatchers("/", "/login", "/api/user", "/login",
    // "/oauth2/**",
    // "/login/oauth2/**")
    // .permitAll()
    // .anyRequest().authenticated())
    // .oauth2Login(oauth2 -> oauth2
    // .userInfoEndpoint(userInfo -> userInfo
    // .oidcUserService(customOidcUserService))
    // .defaultSuccessUrl(frontendUrl, true))
    // .logout(logout -> logout
    // .logoutSuccessHandler((request, response, authentication) -> {
    // response.setStatus(HttpServletResponse.SC_OK);
    // response.setContentType("application/json");
    // response.getWriter().write("{\"message\": \"Logged out\"}");
    // })
    // .invalidateHttpSession(true)
    // .clearAuthentication(true)
    // .deleteCookies("JSESSIONID"))
    // .exceptionHandling(ex -> ex
    // .authenticationEntryPoint((req, res, e) -> res
    // .sendError(HttpServletResponse.SC_UNAUTHORIZED))
    // .accessDeniedHandler((req, res, e) -> res
    // .sendError(HttpServletResponse.SC_FORBIDDEN)));

    // return http.build();
    // }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration cfg = new CorsConfiguration();
                    cfg.addAllowedOriginPattern(frontendUrl);
                    cfg.addAllowedHeader("*");
                    cfg.addAllowedMethod("*");
                    cfg.setAllowCredentials(true);
                    return cfg;
                }))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/login",
                                "/api/user",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/leavingcertificate/**")
                        .permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOidcUserService))
                        .defaultSuccessUrl(frontendUrl, true))
                .logout(logout -> logout
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\": \"Logged out\"}");
                        })
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID"));

        return http.build();
    }

//     @Bean
// public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//     http
//         .csrf(csrf -> csrf.disable())
//         .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

//     return http.build();
// }


}