package com.example.pedidos360_streaming;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@EnableKafka
@SpringBootApplication
public class Pedidos360StreamingApplication {

	public static void main(String[] args) {
		SpringApplication.run(Pedidos360StreamingApplication.class, args);
	}

}
