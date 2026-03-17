package com.myfin.userservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.myfin.userservice.entity.User;
import com.myfin.userservice.repository.UserRepository;
import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepo;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
            request.getHeader("Authorization");

        if (authHeader != null
                && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.extractEmail(token);
                String role  = jwtUtil.extractRole(token);

                // ✅ Check if user is still active in DB
                User user = userRepo.findByEmail(email);
                if (user != null &&
                    !user.isActive()) {
                    // ✅ Return 401 - forces frontend logout
                    response.setStatus(
                        HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(
                        "application/json");
                    response.getWriter().write(
                        "{\"message\":\"ACCOUNT_DEACTIVATED\"," +
                        "\"status\":401}");
                    return;
                }

                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        email, null,
                        List.of(new SimpleGrantedAuthority(
                            "ROLE_" + role))
                    );
                SecurityContextHolder.getContext()
                    .setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }
}