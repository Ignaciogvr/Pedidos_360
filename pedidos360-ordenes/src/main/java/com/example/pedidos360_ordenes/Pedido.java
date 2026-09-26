package com.example.pedidos360_ordenes;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String clienteEmail;
    private String clienteNombre;
    private String producto;
    private Integer cantidad;
    private String estado;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    private String comentarioAdmin;

    public Pedido() {}

    public Pedido(String clienteEmail, String clienteNombre, String producto, Integer cantidad, String estado) {
        this.clienteEmail = clienteEmail;
        this.clienteNombre = clienteNombre;
        this.producto = producto;
        this.cantidad = cantidad;
        this.estado = estado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClienteEmail() { return clienteEmail; }
    public void setClienteEmail(String clienteEmail) { this.clienteEmail = clienteEmail; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getProducto() { return producto; }
    public void setProducto(String producto) { this.producto = producto; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public String getComentarioAdmin() { return comentarioAdmin; }
    public void setComentarioAdmin(String comentarioAdmin) { this.comentarioAdmin = comentarioAdmin; }
}
