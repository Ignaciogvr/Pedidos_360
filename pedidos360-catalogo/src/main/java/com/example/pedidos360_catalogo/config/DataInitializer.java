package com.example.pedidos360_catalogo.config;

import com.example.pedidos360_catalogo.entity.Producto;
import com.example.pedidos360_catalogo.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ProductoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Producto("Laptop Pro X", "Intel i7, 16GB RAM, 512GB SSD", 899990.0, 5, "ComputaciÃƒÂ³n", "https://picsum.photos/seed/laptop1/400/250"));
                repository.save(new Producto("Monitor 24\"", "Full HD 1080p, 75Hz", 189990.0, 12, "PerifÃƒÂ©ricos", "https://picsum.photos/seed/monitor2/400/250"));
                repository.save(new Producto("Teclado MecÃƒÂ¡nico", "Switches Blue, RGB", 79990.0, 20, "PerifÃƒÂ©ricos", "https://picsum.photos/seed/keyboard3/400/250"));
                repository.save(new Producto("Smartphone X12", "6.7\" AMOLED, 5G", 599990.0, 0, "MÃƒÂ³viles", "https://picsum.photos/seed/phone6/400/250"));
            }
        };
    }
}
