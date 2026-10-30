package com.example.pedidos360_catalogo.repository;

import com.example.pedidos360_catalogo.entity.Rol;
import com.example.pedidos360_catalogo.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRol(Rol rol);
    List<Usuario> findByActivo(Boolean activo);
}