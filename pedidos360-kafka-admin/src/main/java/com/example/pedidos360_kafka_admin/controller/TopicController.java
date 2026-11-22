package com.example.pedidos360_kafka_admin.controller;

import com.example.pedidos360_kafka_admin.dto.TopicCreateRequest;
import com.example.pedidos360_kafka_admin.dto.TopicDescriptionDTO;
import com.example.pedidos360_kafka_admin.service.KafkaAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/kafka/topics")
@RequiredArgsConstructor
public class TopicController {

    private final KafkaAdminService kafkaAdminService;

    @PostMapping
    public ResponseEntity<?> createTopic(@RequestBody TopicCreateRequest request) {
        try {
            kafkaAdminService.createTopic(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Tópico creado exitosamente",
                    "topic", request.getName(),
                    "partitions", request.getPartitions(),
                    "replicas", request.getReplicas()
            ));
        } catch (Exception e) {
            log.error("Error creando tópico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Set<String>> listTopics() {
        try {
            Set<String> topics = kafkaAdminService.listTopics();
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            log.error("Error listando tópicos: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{name}")
    public ResponseEntity<TopicDescriptionDTO> describeTopic(@PathVariable String name) {
        try {
            TopicDescriptionDTO dto = kafkaAdminService.describeTopic(name);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error describiendo tópico: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteTopic(@PathVariable String name) {
        try {
            kafkaAdminService.deleteTopic(name);
            return ResponseEntity.ok(Map.of("message", "Tópico eliminado", "topic", name));
        } catch (Exception e) {
            log.error("Error eliminando tópico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
