package com.example.pedidos360_bff.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private static final Logger log = LoggerFactory.getLogger(CatalogoController.class);

    private final RestTemplate restTemplate;

    @Value("${catalogo.service.url:http://localhost:8082/api/catalogo}")
    private String catalogoUrl;

    public CatalogoController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Endpoint legacy para compatibilidad
    @GetMapping
    public ResponseEntity<?> obtenerCatalogo(@RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: GET /api/catalogo - reenviando a MS Catálogo");
        HttpHeaders headers = new HttpHeaders();
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl, HttpMethod.GET, new HttpEntity<>(headers), Object.class);
    }

    // Endpoints nuevos para /productos
    @GetMapping("/productos")
    public ResponseEntity<?> listarProductos(@RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: GET /api/catalogo/productos - reenviando a MS Catálogo");
        HttpHeaders headers = new HttpHeaders();
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl, HttpMethod.GET, new HttpEntity<>(headers), Object.class);
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<?> obtenerProducto(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: GET /api/catalogo/productos/{} - reenviando a MS Catálogo", id);
        HttpHeaders headers = new HttpHeaders();
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl + "/" + id, HttpMethod.GET, new HttpEntity<>(headers), Object.class);
    }

    @PostMapping("/productos")
    public ResponseEntity<?> crearProducto(@RequestBody Object producto, @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: POST /api/catalogo/productos - reenviando a MS Catálogo");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl, HttpMethod.POST, new HttpEntity<>(producto, headers), Object.class);
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Object producto, @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: PUT /api/catalogo/productos/{} - reenviando a MS Catálogo", id);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl + "/" + id, HttpMethod.PUT, new HttpEntity<>(producto, headers), Object.class);
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: DELETE /api/catalogo/productos/{} - reenviando a MS Catálogo", id);
        HttpHeaders headers = new HttpHeaders();
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl + "/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), Object.class);
    }

    // Endpoints legacy para compatibilidad
    @PostMapping
    public ResponseEntity<?> crearProductoLegacy(@RequestBody Object producto, @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: POST /api/catalogo (legacy) - reenviando a MS Catálogo");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl, HttpMethod.POST, new HttpEntity<>(producto, headers), Object.class);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProductoLegacy(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("BFF: DELETE /api/catalogo/{} (legacy) - reenviando a MS Catálogo", id);
        HttpHeaders headers = new HttpHeaders();
        if (bearerToken != null) {
            headers.set("Authorization", bearerToken);
        }
        return restTemplate.exchange(catalogoUrl + "/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), Object.class);
    }
}
