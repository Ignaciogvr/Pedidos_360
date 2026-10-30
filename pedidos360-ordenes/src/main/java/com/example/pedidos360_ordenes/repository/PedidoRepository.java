package com.example.pedidos360_ordenes.repository;

import com.example.pedidos360_ordenes.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteEmailIgnoreCase(String email);
}
