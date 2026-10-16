package com.multiaceites.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserDetailsServiceImpl users;

    public JwtAuthenticationFilter(JwtService jwt, UserDetailsServiceImpl users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, java.io.IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            String t = h.substring(7);
            if (jwt.valid(t)) {
                try {
                    String u = jwt.username(t);
                    UserDetails d = users.loadUserByUsername(u);
                    var a = new UsernamePasswordAuthenticationToken(d, null, d.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(a);
                } catch (Exception ignored) {
                }
            }
        }
        chain.doFilter(req, res);
    }
}
