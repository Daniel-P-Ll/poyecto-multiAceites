package com.multiaceites.service;

import com.multiaceites.dto.*;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.repository.UserRepository;
import com.multiaceites.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager auth;
    private final UserRepository users;
    private final JwtService jwt;

    public AuthService(AuthenticationManager auth, UserRepository users, JwtService jwt) {
        this.auth = auth;
        this.users = users;
        this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest r) {
        var userOpt = users.findByUsername(r.username());
        if (userOpt.isPresent() && !userOpt.get().isActivo()) {
            throw new IllegalArgumentException("No se pudo iniciar sesión, bloqueo por administrador");
        }

        try {
            auth.authenticate(new UsernamePasswordAuthenticationToken(r.username(), r.password()));
        } catch (DisabledException | LockedException e) {
            throw new IllegalArgumentException("No se pudo iniciar sesión, bloqueo por administrador");
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        var u = userOpt.orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return new LoginResponse(jwt.generate(u.getUsername(), u.getRole().name()),
                u.getId(), u.getUsername(), u.getNombre(), u.getRole().name());
    }
}
