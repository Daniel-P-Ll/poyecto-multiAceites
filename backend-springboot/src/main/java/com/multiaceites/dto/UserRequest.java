package com.multiaceites.dto; import com.multiaceites.model.entity.Role; import jakarta.validation.constraints.*;
public record UserRequest(@NotBlank String username,String password,@NotBlank String nombre,@NotNull Role role){}
