package com.example.pedidos360_kafka_admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicCreateRequest {
    private String name;
    private int partitions = 3;
    private short replicas = 3;
    private Long retentionMs = 604800000L; // 7 días por defecto
    private String cleanupPolicy = "delete";
}
