package com.multiaceites.controller;

import com.multiaceites.dto.SucursalRequest;
import com.multiaceites.model.entity.Sucursal;
import com.multiaceites.service.SucursalService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresa")
public class EmpresaController {

    private final SucursalService service;

    public EmpresaController(SucursalService service) {
        this.service = service;
    }

    @GetMapping
    public Sucursal get() {
        return service.empresa();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Sucursal update(@Valid @RequestBody SucursalRequest request) {
        return service.actualizarEmpresa(request);
    }
}
