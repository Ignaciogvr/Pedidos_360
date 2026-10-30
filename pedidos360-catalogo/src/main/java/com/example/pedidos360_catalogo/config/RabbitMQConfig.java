package com.example.pedidos360_catalogo.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Centralized RabbitMQ configuration for MS Catalogo
 * Defines exchange names and routing keys as constants (Requirement 8)
 */
@Configuration
public class RabbitMQConfig {

    // ===== CENTRALIZED EXCHANGE NAMES =====
    public static final String DIRECT_EXCHANGE = "pedidos360.direct.exchange";
    public static final String TOPIC_EXCHANGE  = "pedidos360.topic.exchange";

    // ===== CENTRALIZED ROUTING KEYS =====
    public static final String ROUTING_KEY_NOTIFICACIONES = "notificaciones";
    public static final String ROUTING_KEY_AUDITORIA      = "auditoria";
    public static final String ROUTING_KEY_INVENTARIO     = "inventario";

    @Bean
    public RabbitAdmin rabbitAdminCatalogo(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public RabbitTemplate rabbitTemplateCatalogo(ConnectionFactory connectionFactory) {
        return new RabbitTemplate(connectionFactory);
    }
}
