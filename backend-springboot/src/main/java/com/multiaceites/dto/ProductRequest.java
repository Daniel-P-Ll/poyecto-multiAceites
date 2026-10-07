package com.multiaceites.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank(message = "El nombre del producto es obligatorio")
    String nombre,

    String descripcion,

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser un número válido mayor a 0")
    BigDecimal precio,

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock debe ser un número entero mayor o igual a 0")
    Integer stock,

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 5, message = "Alerta: El stock mínimo no puede ser inferior a 5 unidades")
    Integer stockMinimo
) {}
