package com.multiaceites.service;

import com.multiaceites.dto.UserRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.*;
import com.multiaceites.repository.SucursalRepository;
import com.multiaceites.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final SucursalRepository sucursalRepo;

    public UserService(UserRepository repo, PasswordEncoder encoder, SucursalRepository sucursalRepo) {
        this.repo = repo;
        this.encoder = encoder;
        this.sucursalRepo = sucursalRepo;
    }

    public List<User> all() {
        return repo.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public User toggleActivo(Long id) {
        User u = repo.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        String currentAuthName = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        if (currentAuthName != null && u.getUsername().equalsIgnoreCase(currentAuthName) && u.isActivo()) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta de usuario");
        }
        u.setActivo(!u.isActivo());
        return repo.save(u);
    }

    public User save(UserRequest r) {
        if (repo.findByUsername(r.username()).isPresent())
            throw new IllegalArgumentException("El usuario ya existe");
        User u = new User();
        u.setUsername(r.username());
        u.setPassword(encoder.encode(r.password() == null ? "" : r.password()));
        u.setNombre(r.nombre());
        u.setRole(r.role());
        applySucursal(u, r.sucursalId());
        return repo.save(u);
    }

    public User update(Long id, UserRequest r) {
        User u = repo.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        u.setNombre(r.nombre());
        u.setRole(r.role());
        u.setUsername(r.username());
        if (r.password() != null && !r.password().isBlank())
            u.setPassword(encoder.encode(r.password()));
        applySucursal(u, r.sucursalId());
        return repo.save(u);
    }

    private void applySucursal(User u, Long sucursalId) {
        if (sucursalId != null) {
            Sucursal s = sucursalRepo.findById(sucursalId)
                    .orElseThrow(() -> new NotFoundException("Sucursal no encontrada"));
            u.setSucursal(s);
        } else {
            u.setSucursal(null);
        }
    }

    public void delete(Long id) {
        User u = repo.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        String currentAuthName = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        if (currentAuthName != null && u.getUsername().equalsIgnoreCase(currentAuthName)) {
            throw new IllegalArgumentException("No puedes eliminar tu propia cuenta en sesión activa");
        }
        repo.delete(u);
    }
}