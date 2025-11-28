package com.nikhil.backend.services.implementation;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
                Authentication auth = (Authentication) SecurityContextHolder.getContext().getAuthentication();


                if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate" );
                    response.setHeader("Pragma", "no-cache");
                    response.setDateHeader("Expires", 0);
                }

                filterChain.doFilter(request, response);
    }

}
