package com.multiaceites.service;

import com.multiaceites.dto.SaleRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.*;
import com.multiaceites.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SaleService {
    private final SaleRepository sales;
    private final ClientRepository clients;
    private final ProductRepository products;
    private final UserRepository users;
    private final PriceHistoryRepository history;

    @Transactional
    public Sale create(SaleRequest r, String username) {
        Client c = clients.findById(r.clienteId()).filter(Client::isActivo)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));
        User u = users.findByUsername(username).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        Sale s = new Sale();
        s.setCliente(c);
        s.setUsuario(u);
        s.setNumeroComprobante("MA-" + System.currentTimeMillis());
        BigDecimal total = BigDecimal.ZERO;
        for (var d : r.detalles()) {
            Product p = products.findById(d.productoId()).filter(Product::isActivo)
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + d.productoId()));
            if (p.getStock() < d.cantidad())
                throw new IllegalArgumentException("Stock insuficiente para " + p.getNombre());
            BigDecimal importe = p.getPrecio().multiply(BigDecimal.valueOf(d.cantidad()));
            SaleDetail sd = new SaleDetail();
            sd.setVenta(s);
            sd.setProducto(p);
            sd.setCantidad(d.cantidad());
            sd.setPrecioUnitario(p.getPrecio());
            sd.setImporte(importe);
            s.getDetalles().add(sd);
            p.setStock(p.getStock() - d.cantidad());
            total = total.add(importe);
        }
        s.setTotal(total);
        s.setFecha(LocalDateTime.now());
        Sale saved = sales.save(s);
        for (var d : saved.getDetalles()) {
            PriceHistory h = new PriceHistory();
            h.setProducto(d.getProducto());
            h.setPrecioVenta(d.getPrecioUnitario());
            h.setFecha(saved.getFecha());
            h.setVenta(saved);
            history.save(h);
        }
        return saved;
    }

    public List<Sale> all() {
        return sales.findAllByOrderByFechaDesc();
    }

    public Sale one(Long id) {
        return sales.findById(id).orElseThrow(() -> new NotFoundException("Venta no encontrada"));
    }

    public Map<String, Object> dashboard() {
        LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay(), end = start.plusDays(1);
        return Map.of("ventasHoy", sales.countByFechaBetween(start, end), "ingresosHoy", sales.totalEntre(start, end),
                "ventasTotales", sales.count(), "ingresosTotales",
                sales.findAll().stream().map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    public List<Map<String, Object>> topProducts() {
        Map<Long, Map<String, Object>> m = new HashMap<>();
        for (Sale s : sales.findAll()) {
            for (SaleDetail d : s.getDetalles()) {
                var x = m.computeIfAbsent(d.getProducto().getId(), k -> {
                    Map<String, Object> z = new HashMap<>();
                    z.put("producto", d.getProducto().getNombre());
                    z.put("cantidad", 0);
                    z.put("ingresos", BigDecimal.ZERO);
                    return z;
                });
                x.put("cantidad", (Integer) x.get("cantidad") + d.getCantidad());
                x.put("ingresos", ((BigDecimal) x.get("ingresos")).add(d.getImporte()));
            }
        }
        return m.values().stream()
                .sorted((a, b) -> Integer.compare((Integer) b.get("cantidad"), (Integer) a.get("cantidad"))).limit(10)
                .toList();
    }

    public List<Sale> history() {
        return all();
    }
}
