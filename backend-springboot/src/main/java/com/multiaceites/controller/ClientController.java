package com.multiaceites.controller;

import com.multiaceites.dto.ClientRequest;
import com.multiaceites.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
public class ClientController {

    private final ClientService s;

    public ClientController(ClientService s) {
        this.s = s;
    }

    @GetMapping
    public Object all(@RequestParam(required = false) String q,
                     @RequestParam(required = false) String cedula) {
        return s.all(q != null ? q : cedula);
    }

    @PostMapping
    public Object save(@Valid @RequestBody ClientRequest r) {
        return s.save(r);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable Long id, @Valid @RequestBody ClientRequest r) {
        return s.update(id, r);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        s.delete(id);
    }
}
