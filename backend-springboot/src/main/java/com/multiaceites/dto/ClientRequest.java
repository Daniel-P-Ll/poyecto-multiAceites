package com.multiaceites.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ClientRequest(
    @NotBlank(message = "El nombre del cliente es obligatorio")
    String nombre,

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "^[0-9]+$", message = "La cédula debe contener solo números")
    String cedula,

    String correo,

    @Pattern(regexp = "^[0-9+\\s-]*$", message = "El teléfono debe contener valores numéricos válidos")
    String telefono
) {}
