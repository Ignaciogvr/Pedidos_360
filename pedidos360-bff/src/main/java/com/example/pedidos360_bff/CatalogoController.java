package com.example.pedidos360_bff;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final RestTemplate restTemplate;

    @Value("${servicios.catalogo.url:http://localhost:8082/api/catalogo}")
    private String catalogoUrl;

    public CatalogoController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Angular llama a esto con su token MSAL → BFF valida el token → reenvía al MS Catálogo
    @GetMapping
    public ResponseEntity<?> obtenerCatalogo(@RequestHeader("Authorization") String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken); // Reenviar token al MS Catálogo
        return restTemplate.exchange(catalogoUrl, HttpMethod.GET, new HttpEntity<>(headers), Object.class);
    }

    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Object producto, @RequestHeader("Authorization") String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        return restTemplate.exchange(catalogoUrl, HttpMethod.POST, new HttpEntity<>(producto, headers), Object.class);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id, @RequestHeader("Authorization") String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        return restTemplate.exchange(catalogoUrl + "/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), Object.class);
    }
}
