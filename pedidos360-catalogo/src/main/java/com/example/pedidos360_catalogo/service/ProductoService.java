package com.example.pedidos360_catalogo.service;

import com.example.pedidos360_catalogo.entity.Producto;
import com.example.pedidos360_catalogo.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductoService {
    
    private static final Logger log = LoggerFactory.getLogger(ProductoService.class);
    private final ProductoRepository productoRepository;
    
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }
    
    public List<Producto> obtenerTodos() {
        log.info("Obteniendo todos los productos");
        return productoRepository.findAll();
    }
    
    public Producto obtenerPorId(Long id) {
        log.info("Obteniendo producto con id: {}", id);
        return productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
    }
    
    public List<Producto> obtenerPorCategoria(String categoria) {
        log.info("Obteniendo productos de categoría: {}", categoria);
        return productoRepository.findByCategoria(categoria);
    }
    
    public Producto crear(Producto producto) {
        log.info("Creando producto: {}", producto.getNombre());
        validar(producto);
        return productoRepository.save(producto);
    }
    
    public Producto actualizar(Long id, Producto productoActualizado) {
        log.info("Actualizando producto con id: {}", id);
        Producto productoExistente = obtenerPorId(id);
        
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setDescripcion(productoActualizado.getDescripcion());
        productoExistente.setPrecio(productoActualizado.getPrecio());
        productoExistente.setStock(productoActualizado.getStock());
        productoExistente.setCategoria(productoActualizado.getCategoria());
        productoExistente.setImagen(productoActualizado.getImagen());
        
        validar(productoExistente);
        return productoRepository.save(productoExistente);
    }
    
    public void eliminar(Long id) {
        log.info("Eliminando producto con id: {}", id);
        Producto producto = obtenerPorId(id);
        productoRepository.delete(producto);
    }
    
    private void validar(Producto producto) {
        if (producto.getPrecio() == null || producto.getPrecio() <= 0) {
            throw new RuntimeException("El precio debe ser mayor a 0");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new RuntimeException("El stock no puede ser negativo");
        }
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        if (producto.getCategoria() == null || producto.getCategoria().trim().isEmpty()) {
            throw new RuntimeException("La categoría es obligatoria");
        }
    }
}