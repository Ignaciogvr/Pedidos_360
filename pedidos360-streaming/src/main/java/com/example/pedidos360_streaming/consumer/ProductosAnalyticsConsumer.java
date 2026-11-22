package com.example.pedidos360_streaming.consumer;

import com.example.pedidos360_streaming.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductosAnalyticsConsumer {

    private final AnalyticsService analyticsService;

    @KafkaListener(
            topics = "productos.analytics",
            groupId = "pedidos360-streaming-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeProductoAnalytics(
            @Payload Map<String, Object> evento,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("📈 [ANALYTICS] Evento recibido: partition={}, offset={}, key={}, productoId={}", 
                    partition, offset, key, evento.get("productoId"));
            
            // Procesar analítica de producto
            analyticsService.procesarEventoProducto(evento);
            
            // ACK manual
            acknowledgment.acknowledge();
            log.info("✅ [ANALYTICS] ACK confirmado - Analítica actualizada");
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Error procesando analítica: {}", e.getMessage(), e);
            // No hacer ACK - reintento
        }
    }
}
