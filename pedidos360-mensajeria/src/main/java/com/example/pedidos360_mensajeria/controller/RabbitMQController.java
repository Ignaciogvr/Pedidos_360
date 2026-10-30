package com.example.pedidos360_mensajeria.controller;

import com.example.pedidos360_mensajeria.service.RabbitAdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.QueueInformation;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for RabbitMQ administration (Requirement 1)
 */
@RestController
@RequestMapping("/api/mensajeria")
@CrossOrigin(origins = {"https://54.235.23.71", "https://54.145.51.231", "http://localhost:4200"})
public class RabbitMQController {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQController.class);

    private final RabbitAdminService adminService;
    private final RabbitTemplate rabbitTemplate;

    public RabbitMQController(RabbitAdminService adminService, RabbitTemplate rabbitTemplate) {
        this.adminService = adminService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping("/queues")
    public ResponseEntity<String> createQueue(@RequestParam String queueName) {
        if (queueName == null || queueName.isBlank()) {
            return ResponseEntity.badRequest().body("Queue name cannot be empty");
        }
        adminService.createQueue(queueName);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body("Queue '" + queueName + "' created successfully");
    }

    @DeleteMapping("/queues/{queueName}")
    public ResponseEntity<String> deleteQueue(@PathVariable String queueName) {
        adminService.deleteQueue(queueName);
        return ResponseEntity.ok("Queue '" + queueName + "' deleted successfully");
    }

    @GetMapping("/queues/{queueName}")
    public ResponseEntity<?> getQueueInfo(@PathVariable String queueName) {
        QueueInformation info = adminService.getQueueInfo(queueName);
        if (info == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(info);
    }

    @PostMapping("/queues/{queueName}/purge")
    public ResponseEntity<String> purgeQueue(@PathVariable String queueName) {
        adminService.purgeQueue(queueName);
        return ResponseEntity.ok("Queue '" + queueName + "' purged successfully");
    }

    @PostMapping("/exchanges")
    public ResponseEntity<String> createExchange(@RequestParam String exchangeName) {
        if (exchangeName == null || exchangeName.isBlank()) {
            return ResponseEntity.badRequest().body("Exchange name cannot be empty");
        }
        adminService.createExchange(exchangeName);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body("Exchange '" + exchangeName + "' created successfully");
    }

    @DeleteMapping("/exchanges/{exchangeName}")
    public ResponseEntity<String> deleteExchange(@PathVariable String exchangeName) {
        adminService.deleteExchange(exchangeName);
        return ResponseEntity.ok("Exchange '" + exchangeName + "' deleted successfully");
    }

    @PostMapping("/bindings")
    public ResponseEntity<String> createBinding(
            @RequestParam String queueName,
            @RequestParam String exchangeName,
            @RequestParam String routingKey) {
        adminService.createBinding(queueName, exchangeName, routingKey);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body("Binding created successfully");
    }

    @PostMapping("/publish")
    public ResponseEntity<String> publishMessage(
            @RequestParam String exchange,
            @RequestParam String routingKey,
            @RequestParam String message) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
        log.info("Message published to exchange={}, routingKey={}", exchange, routingKey);
        return ResponseEntity.ok("Message published successfully");
    }
}
