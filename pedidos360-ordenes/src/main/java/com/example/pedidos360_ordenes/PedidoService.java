package com.example.pedidos360_ordenes;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    public List<Pedido> findAll() {
        return repository.findAll();
    }

    public List<Pedido> findByCliente(String email) {
        return repository.findByClienteEmailIgnoreCase(email);
    }

    public Pedido create(Pedido pedido) {
        if (pedido.getEstado() == null || pedido.getEstado().isEmpty()) {
            pedido.setEstado("PENDIENTE");
        }
        return repository.save(pedido);
    }

    public Optional<Pedido> updateEstado(Long id, String estado, String comentario) {
        return repository.findById(id).map(p -> {
            p.setEstado(estado);
            if (comentario != null && !comentario.isBlank()) {
                p.setComentarioAdmin(comentario);
            }
            return repository.save(p);
        });
    }

    public boolean delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}
