package com.example.pedidos360_ordenes;

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

    private final PedidoService pedidoService;

    public PedidosController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // EXTRACCIÓN DE IDENTIDAD DEL USUARIO (LO QUE PIDIÓ EL PROFE)
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerPedidos(@AuthenticationPrincipal Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null) roles = List.of();
        
        if (roles.contains("Admin") || roles.contains("Operador")) {
            return ResponseEntity.ok(pedidoService.findAll());
        } else {
            // El backend usa preferred_username u oid para saber quién es exactamente el usuario del token
            String email = jwt.getClaimAsString("preferred_username"); 
            if (email == null) email = jwt.getClaimAsString("upn");
            return ResponseEntity.ok(pedidoService.findByCliente(email));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin') or hasRole('Operador') or hasRole('Cliente')")
    public ResponseEntity<Pedido> crearPedido(@RequestBody Pedido pedido, @AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("preferred_username");
        if (email == null) email = jwt.getClaimAsString("upn");
        String nombre = jwt.getClaimAsString("name");

        pedido.setClienteEmail(email);
        pedido.setClienteNombre(nombre);
        
        return ResponseEntity.ok(pedidoService.create(pedido));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('Admin') or hasRole('Operador')")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        String comentario = body.get("comentarioAdmin");
        return pedidoService.updateEstado(id, nuevoEstado, comentario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        if (pedidoService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
