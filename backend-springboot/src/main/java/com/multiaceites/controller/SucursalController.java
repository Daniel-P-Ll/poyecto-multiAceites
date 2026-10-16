package com.multiaceites.controller;

import com.multiaceites.model.entity.Sucursal;
import com.multiaceites.service.SucursalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    private final SucursalService service;

    public SucursalController(SucursalService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Sucursal> empresa() {
        return service.empresaComoLista();
    }

    @GetMapping("/activas")
    public List<Sucursal> empresaActiva() {
        return service.empresaComoLista();
    }
}
