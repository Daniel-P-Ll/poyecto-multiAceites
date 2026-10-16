package com.multiaceites.model.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_ventas")
public class SaleDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    private Sale venta;

    @ManyToOne(optional = false)
    private Product producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal importe;

    @Column(precision = 4, scale = 2)
    private BigDecimal tarifaIva = new BigDecimal("15.00");

    @Column(precision = 12, scale = 2)
    private BigDecimal impuesto = BigDecimal.ZERO;

    public SaleDetail() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sale getVenta() { return venta; }
    public void setVenta(Sale venta) { this.venta = venta; }

    public Product getProducto() { return producto; }
    public void setProducto(Product producto) { this.producto = producto; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getImporte() { return importe; }
    public void setImporte(BigDecimal importe) { this.importe = importe; }

    public BigDecimal getTarifaIva() { return tarifaIva; }
    public void setTarifaIva(BigDecimal tarifaIva) { this.tarifaIva = tarifaIva; }

    public BigDecimal getImpuesto() { return impuesto; }
    public void setImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; }
}
