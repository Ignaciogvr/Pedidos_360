package com.example.pedidos360_ordenes.controller;

import com.example.pedidos360_ordenes.entity.Pedido;
import com.example.pedidos360_ordenes.service.PedidoService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidosController {

    private static final Logger log = LoggerFactory.getLogger(PedidosController.class);

    private final PedidoService pedidoService;

    public PedidosController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // EXTRACCIÓN DE IDENTIDAD DEL USUARIO
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerPedidos(@AuthenticationPrincipal Jwt jwt) {
        List<String> roles = jwt != null ? jwt.getClaimAsStringList("roles") : null;
        if (roles == null) roles = List.of();
        
        if (roles.contains("Admin") || roles.contains("Operador")) {
            log.info("Admin/Operador requesting all orders");
            return ResponseEntity.ok(pedidoService.findAll());
        } else {
            String email = null;
            if (jwt != null) {
                email = jwt.getClaimAsString("preferred_username"); 
                if (email == null) email = jwt.getClaimAsString("upn");
                if (email == null) email = jwt.getClaimAsString("email");
                if (email == null) email = jwt.getClaimAsString("unique_name");
            }
            log.info("User {} requesting their orders", email);
            if (email == null || email.isBlank()) {
                return ResponseEntity.ok(pedidoService.findAll());
            }
            List<Pedido> orders = pedidoService.findByCliente(email);
            if (orders.isEmpty()) {
                return ResponseEntity.ok(pedidoService.findAll());
            }
            return ResponseEntity.ok(orders);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin') or hasRole('Operador') or hasRole('Cliente') or isAuthenticated()")
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody Pedido pedido, @AuthenticationPrincipal Jwt jwt) {
        String email = null;
        if (jwt != null) {
            email = jwt.getClaimAsString("preferred_username");
            if (email == null) email = jwt.getClaimAsString("upn");
            if (email == null) email = jwt.getClaimAsString("email");
            if (email == null) email = jwt.getClaimAsString("unique_name");
        }
        if ((email == null || email.isBlank()) && pedido.getClienteEmail() != null && !pedido.getClienteEmail().isBlank()) {
            email = pedido.getClienteEmail();
        }
        if (email == null || email.isBlank()) {
            email = "usuario@pedidos360.com";
        }
        
        String nombre = null;
        if (jwt != null) {
            nombre = jwt.getClaimAsString("name");
        }
        if ((nombre == null || nombre.isBlank()) && pedido.getClienteNombre() != null && !pedido.getClienteNombre().isBlank()) {
            nombre = pedido.getClienteNombre();
        }
        if (nombre == null || nombre.isBlank()) {
            nombre = "Usuario Pedidos360";
        }

        pedido.setClienteEmail(email);
        pedido.setClienteNombre(nombre);
        
        log.info("Creating order for user {}: {}", email, pedido.getProducto());
        Pedido created = pedidoService.create(pedido);
        log.info("Order created successfully with ID: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('Admin') or hasRole('Operador')")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        String comentario = body.get("comentarioAdmin");
        log.info("Updating order {} status to: {}", id, nuevoEstado);
        return pedidoService.updateEstado(id, nuevoEstado, comentario)
                .map(pedido -> {
                    log.info("Order {} status updated successfully to: {}", id, nuevoEstado);
                    return ResponseEntity.ok(pedido);
                })
                .orElseGet(() -> {
                    log.warn("Order {} not found for status update", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        log.info("Attempting to delete order: {}", id);
        if (pedidoService.delete(id)) {
            log.info("Order {} deleted successfully", id);
            return ResponseEntity.noContent().build();
        }
        log.warn("Order {} not found for deletion", id);
        return ResponseEntity.notFound().build();
    }
}
