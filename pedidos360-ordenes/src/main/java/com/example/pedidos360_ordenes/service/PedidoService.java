package com.example.pedidos360_ordenes.service;

import com.example.pedidos360_ordenes.entity.Pedido;
import com.example.pedidos360_ordenes.repository.PedidoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    private final PedidoRepository repository;
    private final PedidoEventoPublisher eventoPublisher;

    public PedidoService(PedidoRepository repository, PedidoEventoPublisher eventoPublisher) {
        this.repository = repository;
        this.eventoPublisher = eventoPublisher;
    }

    @Transactional(readOnly = true)
    public List<Pedido> findAll() {
        log.debug("Fetching all orders");
        List<Pedido> pedidos = repository.findAll();
        log.debug("Found {} orders", pedidos.size());
        return pedidos;
    }

    @Transactional(readOnly = true)
    public List<Pedido> findByCliente(String email) {
        log.debug("Fetching orders for client: {}", email);
        List<Pedido> pedidos = repository.findByClienteEmailIgnoreCase(email);
        log.debug("Found {} orders for client: {}", pedidos.size(), email);
        return pedidos;
    }

    public Pedido create(Pedido pedido) {
        if (pedido.getEstado() == null || pedido.getEstado().isEmpty()) {
            pedido.setEstado("PENDIENTE");
        }
        log.info("Creating order for product: {}, quantity: {}, client: {}", 
            pedido.getProducto(), pedido.getCantidad(), pedido.getClienteEmail());
        Pedido guardado = repository.save(pedido);
        log.info("Order saved to database with ID: {}", guardado.getId());
        eventoPublisher.publicarPedidoCreado(guardado);
        return guardado;
    }

    public Optional<Pedido> updateEstado(Long id, String estado, String comentario) {
        log.info("Updating order {} to status: {}", id, estado);
        return repository.findById(id).map(p -> {
            String oldEstado = p.getEstado();
            p.setEstado(estado);
            if (comentario != null && !comentario.isBlank()) {
                p.setComentarioAdmin(comentario);
            }
            Pedido actualizado = repository.save(p);
            log.info("Order {} status changed from {} to {}", id, oldEstado, estado);
            eventoPublisher.publicarPedidoActualizado(actualizado);
            return actualizado;
        });
    }

    public boolean delete(Long id) {
        if (repository.existsById(id)) {
            log.info("Deleting order: {}", id);
            repository.deleteById(id);
            log.info("Order {} deleted from database", id);
            eventoPublisher.publicarPedidoEliminado(id);
            return true;
        }
        log.warn("Attempted to delete non-existent order: {}", id);
        return false;
    }
}
