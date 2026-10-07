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
}
