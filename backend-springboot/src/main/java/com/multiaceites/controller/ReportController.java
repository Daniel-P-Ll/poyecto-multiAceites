package com.multiaceites.controller;

import com.multiaceites.service.SaleService;
import com.multiaceites.service.ProductService;
import com.multiaceites.model.entity.Sale;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReportController {

    private final SaleService sales;
    private final ProductService products;

    public ReportController(SaleService sales, ProductService products) {
        this.sales = sales;
        this.products = products;
    }

    @GetMapping("/dashboard")
    public Object dashboard() {
        return sales.dashboard();
    }

    @GetMapping("/productos-mas-vendidos")
    public Object top(
            @RequestParam(required = false) Long vendedorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long productoId) {
        return sales.topProducts(filteredSales(vendedorId, desde, hasta, productoId), productoId);
    }

    @GetMapping("/ingresos-facturacion")
    public Object income() {
        return sales.history();
    }

    @GetMapping("/bajo-stock")
    public Object low() {
        return products.lowStock();
    }

    @GetMapping("/ventas-vendedor")
    public Object bySeller(
            @RequestParam(required = false) Long vendedorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long productoId) {
        return filteredSales(vendedorId, desde, hasta, productoId);
    }

    private List<Sale> filteredSales(Long vendedorId, LocalDate desde, LocalDate hasta, Long productoId) {
        if (desde != null && hasta != null && hasta.isBefore(desde))
            throw new IllegalArgumentException("La fecha hasta no puede ser anterior a desde");
        return sales.reportByFilters(
                vendedorId,
                desde == null ? null : desde.atStartOfDay(),
                hasta == null ? null : hasta.plusDays(1).atStartOfDay().minusNanos(1),
                productoId);
    }

    @GetMapping(value = "/descarga-global", produces = "text/csv")
    public ResponseEntity<String> downloadGlobal() {
        StringBuilder csv = new StringBuilder("Comprobante,Fecha,Cliente,Vendedor,Subtotal,Impuesto,Total\n");
        for (var v : sales.history()) {
            csv.append(csv(v.getNumeroComprobante())).append(',')
               .append(csv(String.valueOf(v.getFecha()))).append(',')
               .append(csv(v.getCliente().getNombre())).append(',')
               .append(csv(v.getUsuario().getNombre())).append(',')
               .append(v.getSubtotal()).append(',')
               .append(v.getImpuesto()).append(',')
               .append(v.getTotal()).append('\n');
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ventas-globales.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.toString());
    }

    private String csv(String value) {
        return "\"" + (value == null ? "" : value.replace("\"", "\"\"")) + "\"";
    }
}
