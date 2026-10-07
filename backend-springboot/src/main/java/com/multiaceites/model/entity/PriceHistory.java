package com.multiaceites.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="historial_precios") @Getter @Setter @NoArgsConstructor
public class PriceHistory {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Product producto;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal precioVenta;
 @Column(nullable=false) private LocalDateTime fecha=LocalDateTime.now();
 @ManyToOne(optional=false) private Sale venta;
}
