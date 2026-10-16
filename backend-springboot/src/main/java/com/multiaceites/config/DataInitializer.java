package com.multiaceites.config;

import com.multiaceites.model.entity.*;
import com.multiaceites.model.entity.Role;
import com.multiaceites.repository.*;
import com.multiaceites.service.SucursalService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seed(UserRepository users, ProductRepository products, ClientRepository clients,
            SucursalService sucursales, PasswordEncoder enc) {
        return args -> {
            sucursales.empresa();
            if (users.count() == 0) {
                User u = new User();
                u.setUsername("admin");
                u.setPassword(enc.encode("admin123"));
                u.setNombre("Administrador");
                u.setRole(Role.ADMIN);
                users.save(u);
                User v = new User();
                v.setUsername("vendedor");
                v.setPassword(enc.encode("vendedor123"));
                v.setNombre("Vendedor");
                v.setRole(Role.VENDEDOR);
                users.save(v);
            }
            if (products.count() == 0) {
                products.save(product("Aceite Motor 10W-40", "Aceite para motor", new BigDecimal("12.50"), 20, 5));
                products.save(product("Aceite Motor 20W-50", "Aceite para motor", new BigDecimal("11.75"), 15, 5));
                products.save(product("Aceite Sintético 5W-30", "Aceite sintético", new BigDecimal("18.90"), 8, 5));
            }
            if (clients.count() == 0) {
                Client c = new Client();
                c.setNombre("Consumidor General");
                c.setCedula("9999999999");
                c.setCorreo("cliente@demo.com");
                clients.save(c);
            }
        };
    }

    private Product product(String n, String d, BigDecimal p, int s, int m) {
        Product x = new Product();
        x.setNombre(n);
        x.setDescripcion(d);
        x.setPrecio(p);
        x.setStock(s);
        x.setStockMinimo(m);
        return x;
    }
}
