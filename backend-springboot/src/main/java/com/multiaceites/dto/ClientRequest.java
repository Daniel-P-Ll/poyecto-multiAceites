package com.multiaceites.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ClientRequest(
        @NotBlank(message = "El nombre del cliente es obligatorio") String nombre,

        @NotBlank(message = "La cédula es obligatoria") @Pattern(regexp = "^(?:[0-9]{10}|[0-9]{13})$", message = "La cédula debe tener 10 dígitos o el RUC 13 dígitos, sin letras") String cedula,

        String correo,

        @Pattern(regexp = "^$|^[0-9]{10}$", message = "El teléfono debe contener exactamente 10 dígitos, sin letras") String telefono,

        String direccion) {
}