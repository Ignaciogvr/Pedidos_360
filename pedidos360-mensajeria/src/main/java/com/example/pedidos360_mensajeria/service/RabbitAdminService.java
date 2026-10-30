package com.example.pedidos360_mensajeria.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.stereotype.Service;

/**
 * Service for RabbitMQ administration operations (Requirement 1)
 * Encapsulates all RabbitAdmin logic
 */
@Service
public class RabbitAdminService {

    private static final Logger log = LoggerFactory.getLogger(RabbitAdminService.class);
    
    private final RabbitAdmin rabbitAdmin;

    public RabbitAdminService(RabbitAdmin rabbitAdmin) {
        this.rabbitAdmin = rabbitAdmin;
    }

    public void createQueue(String queueName) {
        Queue queue = QueueBuilder.durable(queueName).build();
        rabbitAdmin.declareQueue(queue);
        log.info("Queue created: {}", queueName);
    }

    public void deleteQueue(String queueName) {
        rabbitAdmin.deleteQueue(queueName);
        log.info("Queue deleted: {}", queueName);
    }

    public QueueInformation getQueueInfo(String queueName) {
        QueueInformation info = rabbitAdmin.getQueueInfo(queueName);
        if (info != null) {
            log.info("Queue info retrieved: {} - Messages: {}, Consumers: {}", 
                queueName, info.getMessageCount(), info.getConsumerCount());
        }
        return info;
    }

    public void purgeQueue(String queueName) {
        rabbitAdmin.purgeQueue(queueName);
        log.info("Queue purged: {}", queueName);
    }

    public void createExchange(String exchangeName) {
        DirectExchange exchange = new DirectExchange(exchangeName, true, false);
        rabbitAdmin.declareExchange(exchange);
        log.info("Exchange created: {}", exchangeName);
    }

    public void deleteExchange(String exchangeName) {
        rabbitAdmin.deleteExchange(exchangeName);
        log.info("Exchange deleted: {}", exchangeName);
    }

    public void createBinding(String queueName, String exchangeName, String routingKey) {
        Queue queue = new Queue(queueName);
        DirectExchange exchange = new DirectExchange(exchangeName);
        Binding binding = BindingBuilder.bind(queue).to(exchange).with(routingKey);
        rabbitAdmin.declareBinding(binding);
        log.info("Binding created: Queue={}, Exchange={}, RoutingKey={}", 
            queueName, exchangeName, routingKey);
    }
}
