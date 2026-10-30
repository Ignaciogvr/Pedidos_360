package com.example.pedidos360_mensajeria.consumer;

import com.example.pedidos360_mensajeria.config.RabbitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Map;

/**
 * Processes messages with ACK/NACK and retry logic (Requirements 4, 5, 6, 7)
 */
@Component
public class ProcesadorMensajes {

    private static final Logger log = LoggerFactory.getLogger(ProcesadorMensajes.class);

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public ProcesadorMensajes(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Process message with manual ACK/NACK (Requirement 5)
     */
    public void procesar(String dominio, Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        
        // Extract retry attempt count (Requirement 6)
        Object intentosHeader = message.getMessageProperties().getHeaders().get("x-p360-intentos");
        int intentos = (intentosHeader instanceof Number) 
            ? ((Number) intentosHeader).intValue() 
            : 0;

        try {
            String body = new String(message.getBody());
            log.info("[{}] Processing message (attempt {}): {}", dominio, intentos, body);

            // Parse message to extract event type
            @SuppressWarnings("unchecked")
            Map<String, Object> eventData = objectMapper.readValue(body, Map.class);
            String tipo = (String) eventData.get("tipo");
            String origen = (String) eventData.getOrDefault("origen", "UNKNOWN");

            // Business logic by domain (Requirement 4)
            procesarPorDominio(dominio, tipo, origen, eventData);

            // SUCCESS: Manual ACK (Requirement 5)
            channel.basicAck(deliveryTag, false);
            log.info("[{}] ✅ ACK - Message processed successfully", dominio);

        } catch (Exception error) {
            log.warn("[{}] ⚠️ Error processing message (attempt {}): {}", 
                dominio, intentos, error.getMessage());

            if (intentos < RabbitConfig.MAX_RETRY_ATTEMPTS) {
                // RETRY: Publish to retry exchange (Requirement 6)
                try {
                    MessageProperties retryProps = new MessageProperties();
                    retryProps.setContentType("application/json");
                    retryProps.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    retryProps.setHeader("x-p360-intentos", intentos + 1);
                    retryProps.setHeader("x-p360-dominio", dominio);
                    
                    // Copy original headers if present
                    if (message.getMessageProperties().getHeaders().containsKey("x-p360-origen")) {
                        retryProps.setHeader("x-p360-origen", 
                            message.getMessageProperties().getHeader("x-p360-origen"));
                    }
                    if (message.getMessageProperties().getHeaders().containsKey("x-p360-tipo")) {
                        retryProps.setHeader("x-p360-tipo", 
                            message.getMessageProperties().getHeader("x-p360-tipo"));
                    }

                    rabbitTemplate.send(
                        RabbitConfig.RETRY_EXCHANGE,
                        dominio,
                        new Message(message.getBody(), retryProps)
                    );

                    channel.basicAck(deliveryTag, false);
                    log.info("[{}] 🔄 Retry scheduled (attempt {} of {})", 
                        dominio, intentos + 1, RabbitConfig.MAX_RETRY_ATTEMPTS);

                } catch (Exception retryError) {
                    channel.basicNack(deliveryTag, false, true);
                    log.error("[{}] ❌ Retry publishing failed, message requeued", dominio);
                }
            } else {
                // EXHAUSTED: Send to DLQ (Requirement 7)
                channel.basicNack(deliveryTag, false, false);
                log.error("[{}] 💀 Max retries exhausted - Message sent to DLQ", dominio);
            }
        }
    }

    private void procesarPorDominio(String dominio, String tipo, String origen, Map<String, Object> data) {
        switch (dominio) {
            case "notificaciones" -> procesarNotificacion(tipo, origen, data);
            case "auditoria" -> procesarAuditoria(tipo, origen, data);
            case "inventario" -> procesarInventario(tipo, origen, data);
            default -> log.warn("Unknown domain: {}", dominio);
        }
    }

    private void procesarNotificacion(String tipo, String origen, Map<String, Object> data) {
        if (tipo != null) {
            switch (tipo) {
                case "PEDIDO_CREADO" -> 
                    log.info("[NOTIFICACIONES] ✉️ Email enviado: Pedido creado (origen: {})", origen);
                case "PRODUCTO_CREADO" -> 
                    log.info("[NOTIFICACIONES] ✉️ Email enviado: Nuevo producto disponible (origen: {})", origen);
                case "STOCK_MODIFICADO" -> 
                    log.info("[NOTIFICACIONES] ✉️ Email enviado: Stock actualizado (origen: {})", origen);
                default -> 
                    log.info("[NOTIFICACIONES] ✉️ Email enviado: {} (origen: {})", tipo, origen);
            }
        }
    }

    private void procesarAuditoria(String tipo, String origen, Map<String, Object> data) {
        if (tipo != null) {
            switch (tipo) {
                case "PEDIDO_CREADO" -> 
                    log.info("[AUDITORIA] 📋 Auditoría: Pedido creado registrado (origen: {})", origen);
                case "PRODUCTO_ELIMINADO" -> 
                    log.info("[AUDITORIA] 📋 Auditoría: Producto eliminado del catálogo (origen: {})", origen);
                case "PEDIDO_ACTUALIZADO" -> 
                    log.info("[AUDITORIA] 📋 Auditoría: Estado de pedido actualizado (origen: {})", origen);
                default -> 
                    log.info("[AUDITORIA] 📋 Auditoría: {} registrado (origen: {})", tipo, origen);
            }
        }
    }

    private void procesarInventario(String tipo, String origen, Map<String, Object> data) {
        if (tipo != null) {
            switch (tipo) {
                case "PEDIDO_CREADO" -> 
                    log.info("[INVENTARIO] 📦 Inventario: Stock decrementado (origen: {})", origen);
                case "STOCK_MODIFICADO" -> 
                    log.info("[INVENTARIO] 📦 Inventario: Stock sincronizado (origen: {})", origen);
                default -> 
                    log.info("[INVENTARIO] 📦 Inventario: {} procesado (origen: {})", tipo, origen);
            }
        }
    }
}
