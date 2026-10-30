package com.example.pedidos360_catalogo.service;

import com.example.pedidos360_catalogo.entity.Rol;
import com.example.pedidos360_catalogo.entity.Usuario;
import com.example.pedidos360_catalogo.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UsuarioService {
    
    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);
    private final UsuarioRepository usuarioRepository;
    
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    public List<Usuario> obtenerTodos() {
        log.info("Obteniendo todos los usuarios");
        return usuarioRepository.findAll();
    }
    
    public List<Usuario> obtenerPorRol(Rol rol) {
        log.info("Obteniendo usuarios con rol: {}", rol);
        return usuarioRepository.findByRol(rol);
    }
    
    public Usuario obtenerPorEmail(String email) {
        log.info("Obteniendo usuario con email: {}", email);
        return usuarioRepository.findByEmail(email)
            .orElse(null);
    }
    
    public Usuario registrarSiNoExiste(String email, String nombre) {
        return registrarSiNoExiste(email, nombre, null);
    }

    public Usuario registrarSiNoExiste(String email, String nombre, Rol rolInicial) {
        log.info("Verificando registro de usuario: {}", email);
        return usuarioRepository.findByEmail(email)
            .map(existente -> {
                // Auto-corrección si admin u operador tenían rol cliente por defecto
                if (email != null && email.toLowerCase().startsWith("admin") && existente.getRol() != Rol.ADMIN) {
                    existente.setRol(Rol.ADMIN);
                    return usuarioRepository.save(existente);
                }
                if (email != null && email.toLowerCase().startsWith("operador") && existente.getRol() == Rol.CLIENTE) {
                    existente.setRol(Rol.OPERADOR);
                    return usuarioRepository.save(existente);
                }
                return existente;
            })
            .orElseGet(() -> {
                log.info("Registrando nuevo usuario: {}", email);
                Rol rol = rolInicial;
                if (rol == null) {
                    if (email != null && email.toLowerCase().startsWith("admin")) {
                        rol = Rol.ADMIN;
                    } else if (email != null && email.toLowerCase().startsWith("operador")) {
                        rol = Rol.OPERADOR;
                    } else {
                        rol = Rol.CLIENTE;
                    }
                }
                Usuario nuevoUsuario = new Usuario(email, nombre, rol);
                return usuarioRepository.save(nuevoUsuario);
            });
    }
    
    public Usuario cambiarRol(Long id, Rol nuevoRol) {
        log.info("Cambiando rol de usuario id: {} a {}", id, nuevoRol);
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        if (usuario.getRol() == Rol.ADMIN) {
            throw new RuntimeException("No se puede cambiar el rol del ADMIN");
        }
        
        if (nuevoRol == Rol.ADMIN) {
            throw new RuntimeException("No se puede asignar rol ADMIN a otros usuarios");
        }
        
        usuario.setRol(nuevoRol);
        return usuarioRepository.save(usuario);
    }
    
    public Usuario suspender(Long id, String rolSolicitante) {
        log.info("Suspendiendo usuario id: {} por rol: {}", id, rolSolicitante);
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        if (usuario.getRol() == Rol.ADMIN) {
            throw new RuntimeException("No se puede suspender al ADMIN");
        }
        
        if ("OPERADOR".equals(rolSolicitante) && usuario.getRol() != Rol.CLIENTE) {
            throw new RuntimeException("OPERADOR solo puede suspender CLIENTES");
        }
        
        usuario.setActivo(false);
        return usuarioRepository.save(usuario);
    }
    
    public Usuario activar(Long id) {
        log.info("Activando usuario id: {}", id);
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        usuario.setActivo(true);
        return usuarioRepository.save(usuario);
    }
}