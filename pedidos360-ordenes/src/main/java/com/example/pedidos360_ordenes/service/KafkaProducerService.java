package com.example.pedidos360_ordenes.service;

import com.example.pedidos360_ordenes.dto.PedidoEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String TOPIC_PEDIDOS_STREAM = "pedidos.stream";
    private static final String TOPIC_PRODUCTOS_ANALYTICS = "productos.analytics";

    /**
     * Enviar evento de pedido al stream
     */
    public void enviarEventoPedido(PedidoEventDTO evento) {
        try {
            String key = String.valueOf(evento.getPedidoId());
            
            CompletableFuture<SendResult<String, Object>> future = 
                    kafkaTemplate.send(TOPIC_PEDIDOS_STREAM, key, evento);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("✅ [KAFKA] Evento pedido enviado: topic={}, partition={}, offset={}, key={}", 
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset(),
                            key);
                } else {
                    log.error("❌ [KAFKA] Error enviando evento pedido: {}", ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("❌ [KAFKA] Excepción enviando evento: {}", e.getMessage(), e);
        }
    }

    /**
     * Enviar evento de producto para analítica
     */
    public void enviarEventoProducto(PedidoEventDTO evento) {
        try {
            String key = String.valueOf(evento.getProductoId());
            
            CompletableFuture<SendResult<String, Object>> future = 
                    kafkaTemplate.send(TOPIC_PRODUCTOS_ANALYTICS, key, evento);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("✅ [KAFKA] Evento producto enviado: topic={}, partition={}, offset={}, key={}", 
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset(),
                            key);
                } else {
                    log.error("❌ [KAFKA] Error enviando evento producto: {}", ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("❌ [KAFKA] Excepción enviando evento producto: {}", e.getMessage(), e);
        }
    }
}
