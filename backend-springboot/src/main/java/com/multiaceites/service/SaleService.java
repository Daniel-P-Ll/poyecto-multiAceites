package com.multiaceites.service;

import com.multiaceites.dto.SaleRequest;
import com.multiaceites.exception.NotFoundException;
import com.multiaceites.model.entity.*;
import com.multiaceites.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SaleService {

    private final SaleRepository sales;
    private final ClientRepository clients;
    private final ProductRepository products;
    private final UserRepository users;
    private final PriceHistoryRepository history;
    private final SucursalService sucursales;

    public SaleService(SaleRepository sales, ClientRepository clients, ProductRepository products,
                       UserRepository users, PriceHistoryRepository history, SucursalService sucursales) {
        this.sales = sales;
        this.clients = clients;
        this.products = products;
        this.users = users;
        this.history = history;
        this.sucursales = sucursales;
    }

    @Transactional
    public Sale create(SaleRequest r, String username) {
        Client c = clients.findById(r.clienteId()).filter(Client::isActivo)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));

        User u = users.findByUsername(username).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!u.isActivo())
            throw new IllegalArgumentException("El vendedor está inactivo y no puede registrar ventas");

        Sale s = new Sale();
        s.setCliente(c);
        s.setUsuario(u);
        s.setNumeroComprobante("MA-" + System.currentTimeMillis());

        BigDecimal subtotal = BigDecimal.ZERO;

        for (var d : r.detalles()) {
            Product p = products.findByIdForUpdate(d.productoId()).filter(Product::isActivo)
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + d.productoId()));
            if (p.getStock() < d.cantidad())
                throw new IllegalArgumentException("Stock insuficiente para " + p.getNombre());

            BigDecimal tarifaIva = p.getTarifaIva() != null ? p.getTarifaIva() : sucursales.tarifaIvaVigente();
            BigDecimal importe = p.getPrecio().multiply(BigDecimal.valueOf(d.cantidad()));
            SaleDetail sd = new SaleDetail();
            sd.setVenta(s);
            sd.setProducto(p);
            sd.setCantidad(d.cantidad());
            sd.setPrecioUnitario(p.getPrecio());
            sd.setImporte(importe);

            BigDecimal impuestoDetalle = importe.multiply(tarifaIva).divide(new BigDecimal("100"), 2,
                    java.math.RoundingMode.HALF_UP);
            sd.setTarifaIva(tarifaIva);
            sd.setImpuesto(impuestoDetalle);

            s.getDetalles().add(sd);
            p.setStock(p.getStock() - d.cantidad());
            subtotal = subtotal.add(importe);
        }

        BigDecimal impuestoTotal = s.getDetalles().stream()
                .map(SaleDetail::getImpuesto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        s.setSubtotal(subtotal);
        s.setImpuesto(impuestoTotal);
        s.setTotal(subtotal.add(impuestoTotal));
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

    private void reconcileDetailTaxes(List<SaleDetail> details, BigDecimal invoiceTax) {
        BigDecimal detailTax = details.stream()
                .map(SaleDetail::getImpuesto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal difference = invoiceTax.subtract(detailTax);
        if (difference.signum() > 0) {
            SaleDetail lastDetail = details.get(details.size() - 1);
            lastDetail.setImpuesto(lastDetail.getImpuesto().add(difference));
            return;
        }

        BigDecimal remaining = difference.negate();
        for (int i = details.size() - 1; i >= 0 && remaining.signum() > 0; i--) {
            SaleDetail detail = details.get(i);
            BigDecimal deduction = detail.getImpuesto().min(remaining);
            detail.setImpuesto(detail.getImpuesto().subtract(deduction));
            remaining = remaining.subtract(deduction);
        }
        if (remaining.signum() > 0) {
            throw new IllegalStateException("No se pudo distribuir el redondeo del IVA entre los productos");
        }
    }

    public List<Sale> all() {
        return sales.findAllByOrderByFechaDesc();
    }

    public Sale one(Long id) {
        return sales.findById(id).orElseThrow(() -> new NotFoundException("Venta no encontrada"));
    }

    public Map<String, Object> dashboard() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        BigDecimal ingresosHoy = sales.totalEntre(start, end);
        if (ingresosHoy == null) ingresosHoy = BigDecimal.ZERO;

        BigDecimal ingresosTotales = sales.findAll().stream()
                .map(Sale::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> res = new HashMap<>();
        res.put("ventasHoy", sales.countByFechaBetween(start, end));
        res.put("ingresosHoy", ingresosHoy);
        res.put("ventasTotales", sales.count());
        res.put("ingresosTotales", ingresosTotales);
        return res;
    }

    public List<Map<String, Object>> topProducts() {
        return topProducts(sales.findAllByOrderByFechaDesc());
    }

    public List<Map<String, Object>> topProducts(List<Sale> filteredSales) {
        return topProducts(filteredSales, null);
    }

    public List<Map<String, Object>> topProducts(List<Sale> filteredSales, Long productoId) {
        Map<Long, Map<String, Object>> m = new HashMap<>();
        for (Sale s : filteredSales) {
            for (SaleDetail d : s.getDetalles()) {
                if (productoId != null && !productoId.equals(d.getProducto().getId())) {
                    continue;
                }
                var x = m.computeIfAbsent(d.getProducto().getId(), k -> {
                    Map<String, Object> z = new HashMap<>();
                    z.put("producto", d.getProducto().getNombre());
                    z.put("cantidad", 0);
                    z.put("ingresos", BigDecimal.ZERO);
                    return z;
                });
                x.put("cantidad", (Integer) x.get("cantidad") + d.getCantidad());
                BigDecimal importe = d.getImporte() != null ? d.getImporte() : BigDecimal.ZERO;
                x.put("ingresos", ((BigDecimal) x.get("ingresos")).add(importe));
            }
        }
        return m.values().stream()
                .sorted((a, b) -> Integer.compare((Integer) b.get("cantidad"), (Integer) a.get("cantidad")))
                .limit(10)
                .toList();
    }

    public List<Sale> reportByFilters(Long vendedorId, LocalDateTime desde, LocalDateTime hasta) {
        return reportByFilters(vendedorId, desde, hasta, null);
    }

    public List<Sale> reportByFilters(Long vendedorId, LocalDateTime desde, LocalDateTime hasta, Long productoId) {
        return sales.findAllByOrderByFechaDesc().stream()
                .filter(v -> vendedorId == null || (v.getUsuario() != null && v.getUsuario().getId().equals(vendedorId)))
                .filter(v -> desde == null || !v.getFecha().isBefore(desde))
                .filter(v -> hasta == null || !v.getFecha().isAfter(hasta))
                .filter(v -> productoId == null || v.getDetalles().stream()
                        .anyMatch(detail -> productoId.equals(detail.getProducto().getId())))
                .toList();
    }

    public List<Sale> history() {
        return all();
    }
}