package com.example.pedidos360_kafka_admin.controller;

import com.example.pedidos360_kafka_admin.service.KafkaAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/kafka/consumer-groups")
@RequiredArgsConstructor
public class ConsumerGroupController {

    private final KafkaAdminService kafkaAdminService;

    @GetMapping
    public ResponseEntity<List<String>> listConsumerGroups() {
        try {
            List<String> groups = kafkaAdminService.listConsumerGroups();
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            log.error("Error listando consumer groups: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Map<String, Object>> describeConsumerGroup(@PathVariable String groupId) {
        try {
            Map<String, Object> info = kafkaAdminService.describeConsumerGroup(groupId);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Error describiendo consumer group: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
