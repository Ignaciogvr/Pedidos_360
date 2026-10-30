package com.example.pedidos360_bff.controller;

import com.example.pedidos360_bff.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidosController {

    private static final Logger log = LoggerFactory.getLogger(PedidosController.class);

    private final RestTemplate restTemplate;

    @Value("${ordenes.service.url:http://localhost:8081/api/pedidos}")
    private String ordenesUrl;

    @Value("${catalogo.service.url:http://localhost:8082/api/catalogo}")
    private String catalogoUrl;

    public PedidosController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerPedidos(@RequestHeader("Authorization") String token) {
        log.info("BFF: Recibida solicitud de obtener pedidos - agregando datos de catálogo");
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 1. Obtener Pedidos desde el Microservicio de Órdenes (obligatorio)
        log.info("BFF: Reenviando GET pedidos a MS Órdenes en {}", ordenesUrl);
        ResponseEntity<List> responseOrdenes = restTemplate.exchange(ordenesUrl, HttpMethod.GET, entity, List.class);
        List<Map<String, Object>> pedidos = (List<Map<String, Object>>) responseOrdenes.getBody();
        if (pedidos == null) pedidos = new ArrayList<>();
        log.info("BFF: Recibidos {} pedidos de MS Órdenes", pedidos.size());

        // 2. Intentar obtener Catálogo para enriquecer (opcional – si falla no rompe los pedidos)
        List<Map<String, Object>> catalogo = new ArrayList<>();
        try {
            log.info("BFF: Obteniendo catálogo de {}", catalogoUrl);
            ResponseEntity<List> responseCatalogo = restTemplate.exchange(catalogoUrl, HttpMethod.GET, entity, List.class);
            if (responseCatalogo.getBody() != null) {
                catalogo = (List<Map<String, Object>>) responseCatalogo.getBody();
                log.info("BFF: Catálogo obtenido - {} productos", catalogo.size());
            }
        } catch (Exception e) {
            // El catálogo no está disponible. Los pedidos igual se devuelven.
            log.warn("BFF: Catálogo no disponible - continuando sin enriquecimiento: {}", e.getMessage());
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

        log.info("BFF: Retornando {} pedidos enriquecidos", pedidos.size());
        return ResponseEntity.ok(pedidos);
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Map<String, Object> pedido, @RequestHeader("Authorization") String token) {
        log.info("BFF: Recibida solicitud de crear pedido - Payload: {}", pedido);
        
        // Validación básica
        if (!pedido.containsKey("producto") || !pedido.containsKey("cantidad") || !pedido.containsKey("total")) {
            log.error("BFF: Request inválido - faltan campos requeridos");
            throw new BadRequestException("Campos requeridos: producto, cantidad, total");
        }
        
        log.info("BFF: Reenviando pedido a MS Órdenes en {}", ordenesUrl);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(pedido, headers);
        
        ResponseEntity<?> response = restTemplate.exchange(ordenesUrl, HttpMethod.POST, entity, Object.class);
        
        log.info("BFF: Pedido creado exitosamente - Status: {}", response.getStatusCode());
        return response;
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader("Authorization") String token) {
        log.info("BFF: Recibida solicitud de actualizar estado de pedido con id: {}", id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        
        log.info("BFF: Reenviando actualización de estado a MS Órdenes");
        ResponseEntity<?> response = restTemplate.exchange(ordenesUrl + "/" + id + "/estado", HttpMethod.PUT, entity, Object.class);
        
        log.info("BFF: Estado actualizado exitosamente - Status: {}", response.getStatusCode());
        return response;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPedido(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        log.info("BFF: Recibida solicitud de eliminar pedido con id: {}", id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        log.info("BFF: Reenviando eliminación a MS Órdenes");
        ResponseEntity<?> response = restTemplate.exchange(ordenesUrl + "/" + id, HttpMethod.DELETE, entity, Object.class);
        
        log.info("BFF: Pedido eliminado exitosamente - Status: {}", response.getStatusCode());
        return response;
    }
}
