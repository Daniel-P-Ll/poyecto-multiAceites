package com.multiaceites.controller;

import com.multiaceites.dto.SaleRequest;
import com.multiaceites.model.entity.Sale;
import com.multiaceites.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class SaleController {

    private final SaleService s;

    public SaleController(SaleService s) {
        this.s = s;
    }

    @GetMapping
    public List<Sale> all() {
        return s.all();
    }

    @GetMapping("/{id}")
    public Sale one(@PathVariable Long id) {
        return s.one(id);
    }

    @PostMapping
    public ResponseEntity<Sale> create(@Valid @RequestBody SaleRequest r, Authentication a) {
        Sale sale = s.create(r, a.getName());
        return ResponseEntity.ok(sale);
    }
}