package com.example.pedidos360_kafka_admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicDescriptionDTO {
    private String name;
    private int partitions;
    private int replicas;
    private boolean internal;
}
