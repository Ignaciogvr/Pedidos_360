package com.example.pedidos360_mensajeria.consumer;

import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class MonitoreoConsumer {

    private static final Logger log = LoggerFactory.getLogger(MonitoreoConsumer.class);

    @RabbitListener(queues = "pedidos360.monitoreo.queue")
    public void monitorear(Message message, Channel channel) throws IOException {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        String body = new String(message.getBody());
        
        log.info("[MONITOREO] Event observed - RoutingKey: {}, Body: {}", routingKey, body);
        
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }
}
