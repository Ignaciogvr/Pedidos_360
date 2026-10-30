package com.example.pedidos360_bff.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuariosController {

    private static final Logger log = LoggerFactory.getLogger(UsuariosController.class);

    private final RestTemplate restTemplate;

    @Value("${usuarios.service.url:http://localhost:8082/api/usuarios}")
    private String usuariosUrl;

    public UsuariosController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private HttpHeaders createHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null && !token.isBlank()) {
            headers.set("Authorization", token);
        }
        return headers;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(
            @RequestBody Map<String, String> usuario,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("BFF: POST /api/usuarios/registrar - reenviando a MS Catálogo");
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(usuario, createHeaders(token));
        return restTemplate.exchange(usuariosUrl + "/registrar", HttpMethod.POST, entity, Object.class);
    }

    @GetMapping
    public ResponseEntity<?> listarUsuarios(
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("BFF: GET /api/usuarios - reenviando a MS Catálogo");
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));
        return restTemplate.exchange(usuariosUrl, HttpMethod.GET, entity, Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuario(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("BFF: GET /api/usuarios/{} - reenviando a MS Catálogo", id);
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));
        return restTemplate.exchange(usuariosUrl + "/" + id, HttpMethod.GET, entity, Object.class);
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<?> cambiarRol(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("BFF: PUT /api/usuarios/{}/rol - reenviando a MS Catálogo", id);
        // Compatibilidad: aceptar tanto "nuevoRol" como "rol"
        if (request.containsKey("nuevoRol") && !request.containsKey("rol")) {
            request.put("rol", request.get("nuevoRol"));
        }
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, createHeaders(token));
        return restTemplate.exchange(usuariosUrl + "/" + id + "/rol", HttpMethod.PUT, entity, Object.class);
    }

    @PutMapping("/{id}/suspender")
    public ResponseEntity<?> suspenderUsuario(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("BFF: PUT /api/usuarios/{}/suspender - reenviando a MS Catálogo");
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(request != null ? request : Map.of(), createHeaders(token));
        return restTemplate.exchange(usuariosUrl + "/" + id + "/suspender", HttpMethod.PUT, entity, Object.class);
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activarUsuario(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("BFF: PUT /api/usuarios/{}/activar - reenviando a MS Catálogo", id);
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));
        return restTemplate.exchange(usuariosUrl + "/" + id + "/activar", HttpMethod.PUT, entity, Object.class);
    }
}
