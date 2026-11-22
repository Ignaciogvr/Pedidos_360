package com.example.pedidos360_streaming.consumer;

import com.example.pedidos360_streaming.service.StreamProcessingService;
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
public class PedidosStreamConsumer {

    private final StreamProcessingService streamProcessingService;

    @KafkaListener(
            topics = "pedidos.stream",
            groupId = "pedidos360-streaming-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePedidoStream(
            @Payload Map<String, Object> evento,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("📊 [STREAMING] Evento recibido: partition={}, offset={}, key={}, pedidoId={}", 
                    partition, offset, key, evento.get("pedidoId"));
            
            // Procesar evento en tiempo real
            streamProcessingService.procesarEventoPedido(evento);
            
            // ACK manual
            acknowledgment.acknowledge();
            log.info("✅ [STREAMING] ACK confirmado - Evento procesado exitosamente");
            
        } catch (Exception e) {
            log.error("❌ [STREAMING] Error procesando evento: {}", e.getMessage(), e);
            // No hacer ACK - el mensaje se reintentará según configuración
        }
    }
}
