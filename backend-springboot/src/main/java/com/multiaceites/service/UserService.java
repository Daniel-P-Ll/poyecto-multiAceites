package com.multiaceites.service;

import com.multiaceites.dto.UserRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.*;
import com.multiaceites.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public List<User> all() {
        return repo.findByActivoTrue();
    }

    public User save(UserRequest r) {
        if (repo.findByUsername(r.username()).isPresent())
            throw new IllegalArgumentException("El usuario ya existe");
        User u = new User();
        u.setUsername(r.username());
        u.setPassword(encoder.encode(r.password() == null ? "" : r.password()));
        u.setNombre(r.nombre());
        u.setRole(r.role());
        return repo.save(u);
    }

    public User update(Long id, UserRequest r) {
        User u = repo.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        u.setNombre(r.nombre());
        u.setRole(r.role());
        if (r.password() != null && !r.password().isBlank())
            u.setPassword(encoder.encode(r.password()));
        return repo.save(u);
    }

    public void delete(Long id) {
        User u = repo.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        u.setActivo(false);
        repo.save(u);
    }
}
