package com.multiaceites.exception;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<?> notFound(NotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<?> bad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        String m = e.getBindingResult().getFieldErrors().stream().map(x -> x.getField() + ": " + x.getDefaultMessage())
                .findFirst().orElse("Datos inválidos");
        return ResponseEntity.badRequest().body(Map.of("error", m));
    }

    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    ResponseEntity<?> disabled(org.springframework.security.authentication.DisabledException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "No se pudo iniciar sesión, bloqueo por administrador"));
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    ResponseEntity<?> badCredentials(org.springframework.security.authentication.BadCredentialsException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Credenciales inválidas"));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    ResponseEntity<?> denied(org.springframework.security.access.AccessDeniedException e) {
        return ResponseEntity.status(403).body(Map.of("error", "No tiene permisos para realizar esta acción"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<?> general(Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error interno del servidor"));
    }
}
