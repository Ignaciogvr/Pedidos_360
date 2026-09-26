package com.example.pedidos360_bff;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidosController {

    private final RestTemplate restTemplate;

    @Value("${servicios.ordenes.url:http://localhost:8081/api/pedidos}")
    private String ordenesUrl;

    @Value("${servicios.catalogo.url:http://localhost:8082/api/catalogo}")
    private String catalogoUrl;

    public PedidosController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerPedidos(@RequestHeader("Authorization") String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 1. Obtener Pedidos desde el Microservicio de Órdenes (obligatorio)
        ResponseEntity<List> responseOrdenes = restTemplate.exchange(ordenesUrl, HttpMethod.GET, entity, List.class);
        List<Map<String, Object>> pedidos = (List<Map<String, Object>>) responseOrdenes.getBody();
        if (pedidos == null) pedidos = new ArrayList<>();

        // 2. Intentar obtener Catálogo para enriquecer (opcional — si falla no rompe los pedidos)
        List<Map<String, Object>> catalogo = new ArrayList<>();
        try {
            ResponseEntity<List> responseCatalogo = restTemplate.exchange(catalogoUrl, HttpMethod.GET, entity, List.class);
            if (responseCatalogo.getBody() != null) {
                catalogo = (List<Map<String, Object>>) responseCatalogo.getBody();
            }
        } catch (Exception e) {
            // El catálogo no está disponible. Los pedidos igual se devuelven.
            System.out.println("[BFF] Catálogo no disponible: " + e.getMessage());
        }

        // 3. TRANSFORMACIÓN BFF: Fusionar pedidos con datos del catálogo
        for (Map<String, Object> pedido : pedidos) {
            pedido.put("procesadoPor", "BFF-Pedidos360");
            String nombreProd = (String) pedido.get("producto");
            if (nombreProd != null) {
                for (Map<String, Object> productoCat : catalogo) {
                    if (nombreProd.equals(productoCat.get("nombre"))) {
                        pedido.put("imagenEnriquecida", productoCat.get("imagen"));
                        pedido.put("categoriaEnriquecida", productoCat.get("categoria"));
                        break;
                    }
                }
            }
        }

        return ResponseEntity.ok(pedidos);
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Map<String, Object> pedido, @RequestHeader("Authorization") String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(pedido, headers);
        return restTemplate.exchange(ordenesUrl, HttpMethod.POST, entity, Object.class);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader("Authorization") String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        return restTemplate.exchange(ordenesUrl + "/" + id + "/estado", HttpMethod.PUT, entity, Object.class);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPedido(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(ordenesUrl + "/" + id, HttpMethod.DELETE, entity, Object.class);
    }
}
