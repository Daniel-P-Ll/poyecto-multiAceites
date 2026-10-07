package com.multiaceites.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name="productos") @Getter @Setter @NoArgsConstructor
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, length=120) private String nombre;
 @Column(length=500) private String descripcion;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal precio;
 @Column(nullable=false) private Integer stock=0;
 @Column(nullable=false) private Integer stockMinimo=5;
 @Column(nullable=false) private boolean activo=true;
}
