package com.example.pedidos360_kafka_admin.service;

import com.example.pedidos360_kafka_admin.dto.TopicCreateRequest;
import com.example.pedidos360_kafka_admin.dto.TopicDescriptionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.config.TopicConfig;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaAdminService {

    private final AdminClient adminClient;

    /**
     * Crear tópico con configuración personalizada
     */
    public void createTopic(TopicCreateRequest request) throws ExecutionException, InterruptedException {
        
        Map<String, String> configs = new HashMap<>();
        configs.put(TopicConfig.RETENTION_MS_CONFIG, request.getRetentionMs().toString());
        configs.put(TopicConfig.CLEANUP_POLICY_CONFIG, request.getCleanupPolicy());
        configs.put(TopicConfig.MIN_IN_SYNC_REPLICAS_CONFIG, "2");
        
        NewTopic topic = new NewTopic(request.getName(), request.getPartitions(), request.getReplicas())
                .configs(configs);
        
        CreateTopicsResult result = adminClient.createTopics(Collections.singleton(topic));
        result.all().get();
        
        log.info("✅ Tópico creado: {} con {} particiones y {} réplicas", 
                request.getName(), request.getPartitions(), request.getReplicas());
    }

    /**
     * Listar todos los tópicos
     */
    public Set<String> listTopics() throws ExecutionException, InterruptedException {
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    /**
     * Describir tópico
     */
    public TopicDescriptionDTO describeTopic(String topicName) 
            throws ExecutionException, InterruptedException {
        
        DescribeTopicsResult result = adminClient.describeTopics(Collections.singleton(topicName));
        TopicDescription desc = result.allTopicNames().get().get(topicName);
        
        return TopicDescriptionDTO.builder()
                .name(desc.name())
                .partitions(desc.partitions().size())
                .replicas(desc.partitions().get(0).replicas().size())
                .internal(desc.isInternal())
                .build();
    }

    /**
     * Eliminar tópico
     */
    public void deleteTopic(String topicName) throws ExecutionException, InterruptedException {
        DeleteTopicsResult result = adminClient.deleteTopics(Collections.singleton(topicName));
        result.all().get();
        log.info("🗑️ Tópico eliminado: {}", topicName);
    }

    /**
     * Listar consumer groups
     */
    public List<String> listConsumerGroups() throws ExecutionException, InterruptedException {
        ListConsumerGroupsResult result = adminClient.listConsumerGroups();
        return result.all().get().stream()
                .map(ConsumerGroupListing::groupId)
                .collect(Collectors.toList());
    }

    /**
     * Describir consumer group
     */
    public Map<String, Object> describeConsumerGroup(String groupId) 
            throws ExecutionException, InterruptedException {
        
        DescribeConsumerGroupsResult result = adminClient.describeConsumerGroups(
                Collections.singleton(groupId)
        );
        
        ConsumerGroupDescription desc = result.all().get().get(groupId);
        
        Map<String, Object> info = new HashMap<>();
        info.put("groupId", desc.groupId());
        info.put("state", desc.state().toString());
        info.put("members", desc.members().size());
        info.put("coordinator", desc.coordinator().host());
        
        return info;
    }
}
