package com.multiaceites.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SaleRequest(
    @NotNull(message = "Debe seleccionar un cliente")
    Long clienteId,

    @NotEmpty(message = "Debe incluir al menos un producto en la venta")
    List<@Valid Detail> detalles
) {
    public record Detail(
        @NotNull(message = "El producto es obligatorio")
        Long productoId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima a vender debe ser de al menos 1 unidad")
        Integer cantidad
    ) {}
}
