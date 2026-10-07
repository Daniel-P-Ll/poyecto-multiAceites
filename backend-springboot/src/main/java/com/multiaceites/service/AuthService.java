package com.multiaceites.service;

import com.multiaceites.dto.*;
import com.multiaceites.repository.UserRepository;
import com.multiaceites.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager auth;
    private final UserRepository users;
    private final JwtService jwt;

    public LoginResponse login(LoginRequest r) {
        auth.authenticate(new UsernamePasswordAuthenticationToken(r.username(), r.password()));
        var u = users.findByUsername(r.username()).orElseThrow();
        return new LoginResponse(jwt.generate(u.getUsername(), u.getRole().name()), u.getId(), u.getUsername(),
                u.getNombre(), u.getRole().name());
    }
}
