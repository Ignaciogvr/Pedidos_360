package com.example.pedidos360_ordenes.service;

import com.example.pedidos360_ordenes.entity.Pedido;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * PedidoEventoPublisher - Component responsible for publishing order domain events to RabbitMQ
 * Implements Requirements 2 and 27
 */
@Component
public class PedidoEventoPublisher {

    private static final Logger log = LoggerFactory.getLogger(PedidoEventoPublisher.class);
    
    // Exchange definitions (Requirement 2, 27)
    private static final String DIRECT_EXCHANGE = "pedidos360.direct.exchange";
    private static final String TOPIC_EXCHANGE = "pedidos360.topic.exchange";
    
    // Domain routing keys (Requirement 2)
    private static final String[] DOMINIOS = {"notificaciones", "auditoria", "inventario"};

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public PedidoEventoPublisher(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Publishes PEDIDO_CREADO event when an order is created
     * Requirement 2: Publish to DirectExchange with 3 routing keys + TopicExchange for monitoring
     */
    public void publicarPedidoCreado(Pedido pedido) {
        try {
            // Build event payload (Requirement 2)
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "PEDIDO_CREADO");
            evento.put("origen", "ORDENES");
            evento.put("pedidoId", pedido.getId());
            evento.put("clienteEmail", pedido.getClienteEmail());
            evento.put("producto", pedido.getProducto());
            evento.put("cantidad", pedido.getCantidad());
            evento.put("total", calculateTotal(pedido)); // Calculate total from quantity
            evento.put("estado", pedido.getEstado());

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains (Requirement 2)
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "ORDENES");
                    message.getMessageProperties().setHeader("x-p360-tipo", "PEDIDO_CREADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PEDIDO_CREADO Ã¢â€ â€™ DirectExchange '{}', pedidoId={}", dominio, pedido.getId());
            }

            // Publish to TopicExchange for monitoring (Requirement 27)
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.creado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "ORDENES");
                message.getMessageProperties().setHeader("x-p360-tipo", "PEDIDO_CREADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PEDIDO_CREADO Ã¢â€ â€™ TopicExchange 'pedido.creado', pedidoId={}", pedido.getId());

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando PEDIDO_CREADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback (Requirement 2)
        }
    }

    /**
     * Publishes PEDIDO_ACTUALIZADO event when an order is updated
     * Requirement 2: Same pattern as PEDIDO_CREADO
     */
    public void publicarPedidoActualizado(Pedido pedido) {
        try {
            // Build event payload
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "PEDIDO_ACTUALIZADO");
            evento.put("origen", "ORDENES");
            evento.put("pedidoId", pedido.getId());
            evento.put("clienteEmail", pedido.getClienteEmail());
            evento.put("producto", pedido.getProducto());
            evento.put("cantidad", pedido.getCantidad());
            evento.put("total", calculateTotal(pedido));
            evento.put("estado", pedido.getEstado());

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "ORDENES");
                    message.getMessageProperties().setHeader("x-p360-tipo", "PEDIDO_ACTUALIZADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PEDIDO_ACTUALIZADO Ã¢â€ â€™ DirectExchange '{}', pedidoId={}", dominio, pedido.getId());
            }

            // Publish to TopicExchange for monitoring
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.actualizado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "ORDENES");
                message.getMessageProperties().setHeader("x-p360-tipo", "PEDIDO_ACTUALIZADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PEDIDO_ACTUALIZADO Ã¢â€ â€™ TopicExchange 'pedido.actualizado', pedidoId={}", pedido.getId());

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando PEDIDO_ACTUALIZADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback
        }
    }

    /**
     * Publishes PEDIDO_ELIMINADO event when an order is deleted
     * Requirement 2: Same pattern with only pedidoId in payload
     */
    public void publicarPedidoEliminado(Long pedidoId) {
        try {
            // Build event payload
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "PEDIDO_ELIMINADO");
            evento.put("origen", "ORDENES");
            evento.put("pedidoId", pedidoId);

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "ORDENES");
                    message.getMessageProperties().setHeader("x-p360-tipo", "PEDIDO_ELIMINADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PEDIDO_ELIMINADO Ã¢â€ â€™ DirectExchange '{}', pedidoId={}", dominio, pedidoId);
            }

            // Publish to TopicExchange for monitoring
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.eliminado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "ORDENES");
                message.getMessageProperties().setHeader("x-p360-tipo", "PEDIDO_ELIMINADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PEDIDO_ELIMINADO Ã¢â€ â€™ TopicExchange 'pedido.eliminado', pedidoId={}", pedidoId);

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando PEDIDO_ELIMINADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback
        }
    }

    /**
     * Helper method to calculate order total
     * Since Pedido entity doesn't have a total field, we calculate it as quantity * assumed unit price
     * For real implementation, this would fetch product price from catalog service
     */
    private double calculateTotal(Pedido pedido) {
        // Placeholder calculation - in production this would integrate with catalog service
        return pedido.getCantidad() != null ? pedido.getCantidad() * 10.0 : 0.0;
    }
}
