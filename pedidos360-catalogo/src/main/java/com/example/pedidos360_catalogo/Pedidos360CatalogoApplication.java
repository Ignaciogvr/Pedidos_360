package com.example.pedidos360_catalogo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class Pedidos360CatalogoApplication {
    public static void main(String[] args) {
        SpringApplication.run(Pedidos360CatalogoApplication.class, args);
    }
}
