package com.multiaceites.model.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name="detalle_ventas") @Getter @Setter @NoArgsConstructor
public class SaleDetail {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @JsonIgnore @ManyToOne(optional=false) private Sale venta;
 @ManyToOne(optional=false) private Product producto;
 @Column(nullable=false) private Integer cantidad;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal precioUnitario;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal importe;
}
