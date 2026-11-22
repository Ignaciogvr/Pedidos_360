package com.example.pedidos360_streaming.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class AnalyticsService {

    // Simulación de agregación en memoria (en producción usarías Redis o base de datos)
    private final Map<String, AtomicInteger> productoContador = new ConcurrentHashMap<>();
    private final Map<String, Double> productoIngresos = new ConcurrentHashMap<>();

    /**
     * Procesar analítica de producto
     */
    public void procesarEventoProducto(Map<String, Object> evento) {
        String productoId = String.valueOf(evento.get("productoId"));
        String productoNombre = (String) evento.get("productoNombre");
        Integer cantidad = (Integer) evento.get("cantidad");
        
        // Convertir total a Double
        Object totalObj = evento.get("total");
        Double total = 0.0;
        if (totalObj instanceof Number) {
            total = ((Number) totalObj).doubleValue();
        }
        
        String categoria = (String) evento.get("categoria");
        
        log.info("📊 Procesando analítica de producto:");
        log.info("   - Producto: {} (ID: {})", productoNombre, productoId);
        log.info("   - Categoría: {}", categoria);
        log.info("   - Cantidad vendida: {}", cantidad);
        log.info("   - Ingresos: ${}", total);
        
        // Actualizar contadores
        productoContador.computeIfAbsent(productoId, k -> new AtomicInteger(0))
                .addAndGet(cantidad != null ? cantidad : 0);
        
        final Double finalTotal = total;
        productoIngresos.merge(productoId, finalTotal, Double::sum);
        
        // Log de agregación
        int totalVendido = productoContador.get(productoId).get();
        double totalIngresos = productoIngresos.get(productoId);
        
        log.info("📈 ACUMULADO - Producto {}: {} unidades vendidas, ${} generados",
                productoNombre, totalVendido, totalIngresos);
        
        // Detectar trending products
        if (totalVendido > 10) {
            log.warn("🔥 TRENDING: {} superó las 10 ventas!", productoNombre);
        }
    }
    
    /**
     * Obtener top productos (para endpoint REST)
     */
    public Map<String, AtomicInteger> getTopProductos() {
        return productoContador;
    }
    
    /**
     * Obtener ingresos por producto (para endpoint REST)
     */
    public Map<String, Double> getIngresosProductos() {
        return productoIngresos;
    }
}
