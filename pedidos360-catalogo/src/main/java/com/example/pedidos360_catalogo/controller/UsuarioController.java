package com.example.pedidos360_catalogo.controller;

import com.example.pedidos360_catalogo.entity.Rol;
import com.example.pedidos360_catalogo.entity.Usuario;
import com.example.pedidos360_catalogo.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodos() {
        log.info("GET /api/usuarios - Obteniendo todos los usuarios");
        List<Usuario> usuarios = usuarioService.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<Usuario>> obtenerPorRol(@PathVariable String rol) {
        log.info("GET /api/usuarios/rol/{} - Obteniendo por rol", rol);
        try {
            Rol rolEnum = Rol.valueOf(rol.toUpperCase());
            List<Usuario> usuarios = usuarioService.obtenerPorRol(rolEnum);
            return ResponseEntity.ok(usuarios);
        } catch (IllegalArgumentException e) {
            log.error("Rol inválido: {}", rol);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Usuario> obtenerPorEmail(@PathVariable String email) {
        log.info("GET /api/usuarios/email/{} - Obteniendo por email", email);
        Usuario usuario = usuarioService.obtenerPorEmail(email);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/registrar")
    public ResponseEntity<Usuario> registrar(@RequestBody Map<String, String> datos) {
        log.info("POST /api/usuarios/registrar - Registrando usuario: {}", datos.get("email"));
        try {
            String email = datos.get("email");
            String nombre = datos.get("nombre");
            String rolStr = datos.get("rol");
            Rol rol = null;
            if (rolStr != null && !rolStr.isBlank()) {
                try {
                    rol = Rol.valueOf(rolStr.toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }
            Usuario usuario = usuarioService.registrarSiNoExiste(email, nombre, rol);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (Exception e) {
            log.error("Error al registrar usuario: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<Usuario> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        log.info("PUT /api/usuarios/{}/rol - Cambiando rol", id);
        try {
            Rol nuevoRol = Rol.valueOf(datos.get("rol").toUpperCase());
            Usuario usuario = usuarioService.cambiarRol(id, nuevoRol);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al cambiar rol: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/suspender")
    public ResponseEntity<Usuario> suspender(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        log.info("PUT /api/usuarios/{}/suspender - Suspendiendo usuario", id);
        try {
            String rolSolicitante = datos.get("rolSolicitante");
            Usuario usuario = usuarioService.suspender(id, rolSolicitante);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al suspender usuario: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<Usuario> activar(@PathVariable Long id) {
        log.info("PUT /api/usuarios/{}/activar - Activando usuario", id);
        try {
            Usuario usuario = usuarioService.activar(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al activar usuario: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}