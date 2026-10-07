package com.multiaceites.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="ventas") @Getter @Setter @NoArgsConstructor
public class Sale {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, unique=true, length=30) private String numeroComprobante;
 @ManyToOne(optional=false) private Client cliente;
 @ManyToOne(optional=false) private User usuario;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal total;
 @Column(nullable=false) private LocalDateTime fecha=LocalDateTime.now();
 @OneToMany(mappedBy="venta", cascade=CascadeType.ALL, orphanRemoval=true) private List<SaleDetail> detalles=new ArrayList<>();
}
