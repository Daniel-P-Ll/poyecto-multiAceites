package com.multiaceites.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="clientes") @Getter @Setter @NoArgsConstructor
public class Client {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, length=100) private String nombre;
 @Column(nullable=false, unique=true, length=20) private String cedula;
 @Column(length=120) private String correo;
 @Column(length=20) private String telefono;
 @Column(nullable=false) private boolean activo=true;
}
