package com.example.pedidos360_streaming.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class StreamProcessingService {

    /**
     * Procesar evento de pedido en tiempo real
     */
    public void procesarEventoPedido(Map<String, Object> evento) {
        log.info("🔄 Procesando pedido stream:");
        log.info("   - Pedido ID: {}", evento.get("pedidoId"));
        log.info("   - Cliente: {}", evento.get("clienteNombre"));
        log.info("   - Producto: {}", evento.get("productoNombre"));
        log.info("   - Total: ${}", evento.get("total"));
        log.info("   - Estado: {}", evento.get("estado"));
        log.info("   - Tipo Evento: {}", evento.get("eventType"));
        
        // Aquí puedes agregar lógica de negocio:
        // - Actualizar dashboard en tiempo real
        // - Enviar notificación WebSocket
        // - Detectar patrones de fraude
        // - Calcular métricas en tiempo real
        
        String eventType = (String) evento.get("eventType");
        if ("CREATED".equals(eventType)) {
            log.info("✨ Nuevo pedido detectado - Actualizar dashboard de ventas en vivo");
        }
    }
}
