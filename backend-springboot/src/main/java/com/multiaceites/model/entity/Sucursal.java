package com.multiaceites.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sucursales")
public class Sucursal {

    @Id
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20)
    private String ruc;

    @Column(nullable = false, length = 100)
    private String provincia;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(length = 250)
    private String direccion;

    @Column(length = 50)
    private String telefono;

    @Column(name = "tarifa_iva", precision = 5, scale = 2)
    private BigDecimal tarifaIva = new BigDecimal("15.00");

    @Column(nullable = false)
    private boolean activo = true;

    public Sucursal() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }

    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public BigDecimal getTarifaIva() { return tarifaIva; }
    public void setTarifaIva(BigDecimal tarifaIva) { this.tarifaIva = tarifaIva; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
