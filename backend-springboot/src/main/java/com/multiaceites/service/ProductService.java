package com.multiaceites.service;

import com.multiaceites.dto.ProductRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.*;
import com.multiaceites.repository.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final PriceHistoryRepository history;
    private final SucursalService sucursales;

    public ProductService(ProductRepository repo, PriceHistoryRepository history, SucursalService sucursales) {
        this.repo = repo;
        this.history = history;
        this.sucursales = sucursales;
    }

    public List<Product> all(String q) {
        return q == null || q.isBlank()
                ? repo.findByActivoTrue()
                : repo.findByActivoTrueAndNombreContainingIgnoreCase(q);
    }

    public Product one(Long id) {
        return repo.findById(id).filter(Product::isActivo)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado"));
    }

    public Product save(ProductRequest r) {
        Product p = new Product();
        copy(p, r);
        return repo.save(p);
    }

    public Product update(Long id, ProductRequest r) {
        Product p = one(id);
        copy(p, r);
        return repo.save(p);
    }

    private void copy(Product p, ProductRequest r) {
        BigDecimal tarifa = r.tarifaIva() != null ? r.tarifaIva() : sucursales.tarifaIvaVigente();
        if (tarifa.compareTo(new BigDecimal("15.00")) != 0 && tarifa.compareTo(new BigDecimal("8.00")) != 0) {
            throw new IllegalArgumentException("La tarifa IVA debe ser 15% u 8%");
        }
        p.setNombre(r.nombre());
        p.setDescripcion(r.descripcion());
        p.setPrecio(r.precio());
        p.setStock(r.stock());
        p.setStockMinimo(r.stockMinimo());
        p.setTarifaIva(tarifa);
    }

    public void delete(Long id) {
        Product p = one(id);
        p.setActivo(false);
        repo.save(p);
    }

    public List<Product> lowStock() {
        return repo.findByActivoTrueAndStockLessThanEqual(Integer.MAX_VALUE).stream()
                .filter(p -> p.getStock() <= p.getStockMinimo()).toList();
    }

    public List<PriceHistory> priceHistory(Long id) {
        one(id);
        return history.findByProductoIdOrderByFechaDesc(id);
    }
}
