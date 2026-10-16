package com.multiaceites.controller;

import com.multiaceites.dto.UserRequest;
import com.multiaceites.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService s;

    public UserController(UserService s) {
        this.s = s;
    }

    @GetMapping
    public Object all() {
        return s.all();
    }

    @PostMapping
    public Object save(@Valid @RequestBody UserRequest r) {
        return s.save(r);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable Long id, @Valid @RequestBody UserRequest r) {
        return s.update(id, r);
    }

    @RequestMapping(value = "/{id}/toggle-activo", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public Object toggleActivo(@PathVariable Long id) {
        return s.toggleActivo(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        s.delete(id);
    }
}
