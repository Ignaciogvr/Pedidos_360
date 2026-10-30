package com.example.pedidos360_mensajeria.consumer;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class DominioConsumers {

    private final ProcesadorMensajes procesador;

    public DominioConsumers(ProcesadorMensajes procesador) {
        this.procesador = procesador;
    }

    @RabbitListener(queues = "pedidos360.notificaciones.queue", containerFactory = "manualAckListenerContainerFactory")
    public void consumeNotificaciones(Message message, Channel channel) throws IOException {
        procesador.procesar("notificaciones", message, channel);
    }

    @RabbitListener(queues = "pedidos360.auditoria.queue", containerFactory = "manualAckListenerContainerFactory")
    public void consumeAuditoria(Message message, Channel channel) throws IOException {
        procesador.procesar("auditoria", message, channel);
    }

    @RabbitListener(queues = "pedidos360.inventario.queue", containerFactory = "manualAckListenerContainerFactory")
    public void consumeInventario(Message message, Channel channel) throws IOException {
        procesador.procesar("inventario", message, channel);
    }
}
