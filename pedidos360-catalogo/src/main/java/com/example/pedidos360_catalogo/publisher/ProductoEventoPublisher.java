package com.example.pedidos360_catalogo.publisher;

import com.example.pedidos360_catalogo.entity.Producto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * ProductoEventoPublisher - Component responsible for publishing product domain events to RabbitMQ
 * Implements Requirements 3 and 27
 */
@Component
public class ProductoEventoPublisher {

    private static final Logger log = LoggerFactory.getLogger(ProductoEventoPublisher.class);
    
    // Exchange definitions (Requirement 3, 27)
    private static final String DIRECT_EXCHANGE = "pedidos360.direct.exchange";
    private static final String TOPIC_EXCHANGE = "pedidos360.topic.exchange";
    
    // Domain routing keys (Requirement 3)
    private static final String[] DOMINIOS = {"notificaciones", "auditoria", "inventario"};

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public ProductoEventoPublisher(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Publishes PRODUCTO_CREADO event when a product is created
     * Requirement 3: Publish to DirectExchange with 3 routing keys + TopicExchange for monitoring
     */
    public void publicarProductoCreado(Producto producto) {
        try {
            // Build event payload (Requirement 3)
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "PRODUCTO_CREADO");
            evento.put("origen", "CATALOGO");
            evento.put("productoId", producto.getId());
            evento.put("nombre", producto.getNombre());
            evento.put("descripcion", producto.getDescripcion());
            evento.put("precio", producto.getPrecio());
            evento.put("stock", producto.getStock());
            evento.put("categoria", producto.getCategoria());
            evento.put("imagen", producto.getImagen());

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains (Requirement 3)
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                    message.getMessageProperties().setHeader("x-p360-tipo", "PRODUCTO_CREADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PRODUCTO_CREADO Ã¢â€ â€™ DirectExchange '{}', productoId={}", dominio, producto.getId());
            }

            // Publish to TopicExchange for monitoring (Requirement 27)
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.producto_creado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                message.getMessageProperties().setHeader("x-p360-tipo", "PRODUCTO_CREADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PRODUCTO_CREADO Ã¢â€ â€™ TopicExchange 'pedido.producto_creado', productoId={}", producto.getId());

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando PRODUCTO_CREADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback (Requirement 3)
        }
    }

    /**
     * Publishes PRODUCTO_ACTUALIZADO event when a product is updated
     * Requirement 3: Same pattern as PRODUCTO_CREADO
     */
    public void publicarProductoActualizado(Producto producto) {
        try {
            // Build event payload
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "PRODUCTO_ACTUALIZADO");
            evento.put("origen", "CATALOGO");
            evento.put("productoId", producto.getId());
            evento.put("nombre", producto.getNombre());
            evento.put("descripcion", producto.getDescripcion());
            evento.put("precio", producto.getPrecio());
            evento.put("stock", producto.getStock());
            evento.put("categoria", producto.getCategoria());
            evento.put("imagen", producto.getImagen());

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                    message.getMessageProperties().setHeader("x-p360-tipo", "PRODUCTO_ACTUALIZADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PRODUCTO_ACTUALIZADO Ã¢â€ â€™ DirectExchange '{}', productoId={}", dominio, producto.getId());
            }

            // Publish to TopicExchange for monitoring
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.producto_actualizado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                message.getMessageProperties().setHeader("x-p360-tipo", "PRODUCTO_ACTUALIZADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PRODUCTO_ACTUALIZADO Ã¢â€ â€™ TopicExchange 'pedido.producto_actualizado', productoId={}", producto.getId());

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando PRODUCTO_ACTUALIZADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback
        }
    }

    /**
     * Publishes PRODUCTO_ELIMINADO event when a product is deleted
     * Requirement 3: Same pattern with only productoId in payload
     */
    public void publicarProductoEliminado(Long productoId) {
        try {
            // Build event payload
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "PRODUCTO_ELIMINADO");
            evento.put("origen", "CATALOGO");
            evento.put("productoId", productoId);

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                    message.getMessageProperties().setHeader("x-p360-tipo", "PRODUCTO_ELIMINADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PRODUCTO_ELIMINADO Ã¢â€ â€™ DirectExchange '{}', productoId={}", dominio, productoId);
            }

            // Publish to TopicExchange for monitoring
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.producto_eliminado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                message.getMessageProperties().setHeader("x-p360-tipo", "PRODUCTO_ELIMINADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] PRODUCTO_ELIMINADO Ã¢â€ â€™ TopicExchange 'pedido.producto_eliminado', productoId={}", productoId);

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando PRODUCTO_ELIMINADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback
        }
    }

    /**
     * Publishes STOCK_MODIFICADO event when product stock changes
     * Requirement 3: Includes stockAnterior field for inventory tracking
     */
    public void publicarStockModificado(Producto producto, Integer stockAnterior) {
        try {
            // Build event payload with stockAnterior
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", "STOCK_MODIFICADO");
            evento.put("origen", "CATALOGO");
            evento.put("productoId", producto.getId());
            evento.put("nombre", producto.getNombre());
            evento.put("stockAnterior", stockAnterior);
            evento.put("stockActual", producto.getStock());
            evento.put("diferencia", producto.getStock() - stockAnterior);

            String json = objectMapper.writeValueAsString(evento);

            // Publish to DirectExchange for 3 domains
            for (String dominio : DOMINIOS) {
                rabbitTemplate.convertAndSend(DIRECT_EXCHANGE, dominio, json, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    message.getMessageProperties().setHeader("x-p360-intentos", 0);
                    message.getMessageProperties().setHeader("x-p360-dominio", dominio);
                    message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                    message.getMessageProperties().setHeader("x-p360-tipo", "STOCK_MODIFICADO");
                    return message;
                });
                log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] STOCK_MODIFICADO Ã¢â€ â€™ DirectExchange '{}', productoId={}, stockAnterior={}, stockActual={}", 
                    dominio, producto.getId(), stockAnterior, producto.getStock());
            }

            // Publish to TopicExchange for monitoring
            rabbitTemplate.convertAndSend(TOPIC_EXCHANGE, "pedido.stock_modificado", json, message -> {
                message.getMessageProperties().setContentType("application/json");
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                message.getMessageProperties().setHeader("x-p360-origen", "CATALOGO");
                message.getMessageProperties().setHeader("x-p360-tipo", "STOCK_MODIFICADO");
                return message;
            });
            log.info("Ã°Å¸â€œÂ¤ [PUBLISHER] STOCK_MODIFICADO Ã¢â€ â€™ TopicExchange 'pedido.stock_modificado', productoId={}", producto.getId());

        } catch (Exception e) {
            log.error("Ã¢ÂÅ’ [PUBLISHER] Error publicando STOCK_MODIFICADO: {}", e.getMessage(), e);
            // Do NOT rethrow - prevent transaction rollback
        }
    }
}
