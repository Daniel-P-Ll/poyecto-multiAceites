package com.multiaceites.model.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Entity @Table(name="usuarios") @Getter @Setter @NoArgsConstructor
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, unique=true, length=50) private String username;
 @JsonIgnore @Column(nullable=false) private String password;
 @Column(nullable=false, length=100) private String nombre;
 @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Role role;
 @Column(nullable=false) private boolean activo=true;
}
