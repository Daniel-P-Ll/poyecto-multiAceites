package com.multiaceites.service;

import com.multiaceites.dto.ProductRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.*;
import com.multiaceites.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final PriceHistoryRepository history;

    public List<Product> all(String q) {
        return q == null || q.isBlank() ? repo.findByActivoTrue()
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
        p.setNombre(r.nombre());
        p.setDescripcion(r.descripcion());
        p.setPrecio(r.precio());
        p.setStock(r.stock());
        p.setStockMinimo(r.stockMinimo());
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
