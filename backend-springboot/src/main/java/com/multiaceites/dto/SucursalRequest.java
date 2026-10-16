package com.multiaceites.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SucursalRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        String ruc,
        @NotBlank(message = "La provincia es obligatoria") String provincia,
        @NotBlank(message = "La ciudad es obligatoria") String ciudad,
        String direccion,
        String telefono,
        @NotNull(message = "La tarifa de IVA es obligatoria") BigDecimal tarifaIva) {
}