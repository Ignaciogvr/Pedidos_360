package com.example.pedidos360_mensajeria.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;
import java.util.List;

/**
 * Centralized RabbitMQ configuration (Requirement 8)
 * Defines all exchanges, queues, and bindings for the messaging infrastructure
 */
@Configuration
public class RabbitConfig {

    // ===== EXCHANGE NAMES (Requirement 8) =====
    public static final String DIRECT_EXCHANGE = "pedidos360.direct.exchange";
    public static final String TOPIC_EXCHANGE = "pedidos360.topic.exchange";  // Req 27
    public static final String RETRY_EXCHANGE = "pedidos360.retry.exchange";
    public static final String DLX_EXCHANGE = "pedidos360.dlx";

    // ===== DOMAIN NAMES (Requirement 8) =====
    public static final String[] DOMINIOS = {"notificaciones", "auditoria", "inventario"};

    // ===== MONITORING QUEUE (Requirement 27) =====
    public static final String MONITOREO_QUEUE = "pedidos360.monitoreo.queue";
    public static final String MONITOREO_PATTERN = "pedido.*";

    // ===== RETRY CONFIGURATION (Requirement 6) =====
    public static final int RETRY_TTL_MS = 5000;  // 5 seconds
    public static final int MAX_RETRY_ATTEMPTS = 2;

    // ===== HELPER METHODS (Requirement 8) =====
    public static String principalQueue(String dominio) {
        return "pedidos360." + dominio + ".queue";
    }

    public static String retryQueue(String dominio) {
        return "pedidos360." + dominio + ".retry";
    }

    public static String dlqQueue(String dominio) {
        return "pedidos360." + dominio + ".dlq";
    }

    /**
     * Declares all messaging infrastructure in a single bean (Requirement 8)
     * Creates exchanges, queues, and bindings for all domains
     */
    @Bean
    public Declarables messagingInfrastructure() {
        List<Declarable> declarables = new ArrayList<>();

        // ===== EXCHANGES =====
        DirectExchange directExchange = new DirectExchange(DIRECT_EXCHANGE, true, false);
        TopicExchange topicExchange = new TopicExchange(TOPIC_EXCHANGE, true, false);  // Req 27
        DirectExchange retryExchange = new DirectExchange(RETRY_EXCHANGE, true, false);
        DirectExchange dlxExchange = new DirectExchange(DLX_EXCHANGE, true, false);

        declarables.add(directExchange);
        declarables.add(topicExchange);
        declarables.add(retryExchange);
        declarables.add(dlxExchange);

        // ===== MONITORING QUEUE (Requirement 27) =====
        Queue monitoreoQueue = QueueBuilder.durable(MONITOREO_QUEUE).build();
        declarables.add(monitoreoQueue);
        declarables.add(BindingBuilder.bind(monitoreoQueue)
                .to(topicExchange)
                .with(MONITOREO_PATTERN));

        // ===== DOMAIN-SPECIFIC QUEUES =====
        for (String dominio : DOMINIOS) {
            // Main Queue with DLX (Requirements 5, 7)
            Queue mainQueue = QueueBuilder.durable(principalQueue(dominio))
                    .deadLetterExchange(DLX_EXCHANGE)
                    .deadLetterRoutingKey(dominio + ".failed")
                    .build();

            // Retry Queue with TTL (Requirement 6)
            Queue retryQueue = QueueBuilder.durable(retryQueue(dominio))
                    .ttl(RETRY_TTL_MS)
                    .deadLetterExchange(DIRECT_EXCHANGE)
                    .deadLetterRoutingKey(dominio)
                    .build();

            // Dead Letter Queue (Requirement 7)
            Queue dlqQueue = QueueBuilder.durable(dlqQueue(dominio)).build();

            // Add queues
            declarables.add(mainQueue);
            declarables.add(retryQueue);
            declarables.add(dlqQueue);

            // Bindings for Direct Exchange
            declarables.add(BindingBuilder.bind(mainQueue)
                    .to(directExchange)
                    .with(dominio));

            // Bindings for Retry Exchange
            declarables.add(BindingBuilder.bind(retryQueue)
                    .to(retryExchange)
                    .with(dominio));

            // Bindings for DLX
            declarables.add(BindingBuilder.bind(dlqQueue)
                    .to(dlxExchange)
                    .with(dominio + ".failed"));
        }

        return new Declarables(declarables);
    }
}
