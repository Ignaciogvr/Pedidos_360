package com.example.pedidos360_ordenes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEventDTO {
    private Long pedidoId;
    private String clienteEmail;
    private String clienteNombre;
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private String estado;
    private String eventType; // "CREATED", "UPDATED", "CANCELLED"
    private LocalDateTime timestamp;
    private String categoria; // Para analítica de productos
}
