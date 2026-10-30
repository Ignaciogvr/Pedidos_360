import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { PermissionService } from '@core/services/permission.service';
import { CartService } from '@core/services/cart.service';
import { MsalService } from '@azure/msal-angular';
import { ProductoService, Producto as ProductoBackend } from '../services/producto.service';
import { UserStore } from '../core/stores/user.store';

// Componentes reutilizables
import { ProductCardComponent, Producto } from '@shared/components/product-card/product-card.component';
import { CartModalComponent } from '@shared/components/cart-modal/cart-modal.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    CartModalComponent,
    ModalComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  private apiService = inject(ApiService);
  private permissionService = inject(PermissionService);
  private msalService = inject(MsalService);
  private productoService = inject(ProductoService);
  private userStore = inject(UserStore);
  cart = inject(CartService);

  canManageCatalog = false;
  mostrarFormulario = signal(false);
  categoriaActiva = signal('Todos');
  mostrarCarrito = signal(false);
  mostrarPago = signal(false);
  pagoExitoso = signal(false);
  procesando = signal(false);
  editando = signal(false);
  productoEditId = signal<number | null>(null);

  form = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Computación', imagen: '' };
  card = { nombre: '', numero: '', vencimiento: '', cvv: '' };

  categorias = ['Todos', 'Computación', 'Periféricos', 'Audio', 'Móviles', 'Accesorios'];
  productos = signal<Producto[]>([]);

  ngOnInit() {
    this.canManageCatalog = this.permissionService.canManageCatalog();
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    // Load from backend
    this.productoService.listarProductos().subscribe({
      next: (productosBackend) => {
        // Transform backend products to frontend format
        const productosFront: Producto[] = productosBackend.map(p => ({
          id: p.id!,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          stock: p.stock,
          categoria: p.categoria,
          imagen: p.imagen || `https://picsum.photos/seed/${p.id}/400/250`
        }));
        this.productos.set(productosFront);
      },
      error: (err) => {
        console.error('Error cargando catálogo desde backend:', err);
        // Fallback to old API if backend fails
        this.apiService.get<Producto[]>('/api/catalogo').subscribe({
          next: (data) => this.productos.set(data),
          error: (err2) => console.error('Error cargando catálogo:', err2)
        });
      }
    });
  }

  productosFiltrados() {
    const cat = this.categoriaActiva();
    if (cat === 'Todos') return this.productos();
    return this.productos().filter(p => p.categoria === cat);
  }

  toggleFormulario() {
    this.editando.set(false);
    this.productoEditId.set(null);
    this.form = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Computación', imagen: '' };
    this.mostrarFormulario.update(v => !v);
  }

  editarProducto(id: number) {
    const producto = this.productos().find(p => p.id === id);
    if (!producto) return;
    
    this.form = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
      imagen: producto.imagen
    };
    this.editando.set(true);
    this.productoEditId.set(id);
    this.mostrarFormulario.set(true);
  }

  agregarAlCarrito(producto: Producto) {
    if (producto.stock <= 0) return;
    this.productos.update(lista =>
      lista.map(p => p.id === producto.id ? { ...p, stock: p.stock - 1 } : p)
    );
    this.cart.agregar({ 
      id: producto.id, 
      nombre: producto.nombre, 
      precio: producto.precio, 
      imagen: producto.imagen, 
      stockMax: producto.stock 
    });
  }

  agregarProducto() {
    if (!this.form.nombre || !this.form.precio || this.form.precio <= 0) {
      alert('Nombre y precio (mayor a 0) son requeridos');
      return;
    }
    if (this.form.stock < 0) {
      alert('Stock no puede ser negativo');
      return;
    }

    const productoData: ProductoBackend = {
      nombre: this.form.nombre,
      descripcion: this.form.descripcion || 'Sin descripción',
      precio: this.form.precio,
      stock: this.form.stock,
      categoria: this.form.categoria,
      imagen: this.form.imagen || `https://picsum.photos/seed/${Date.now()}/400/250`
    };

    if (this.editando() && this.productoEditId()) {
      // Update existing product
      this.productoService.actualizarProducto(this.productoEditId()!, productoData).subscribe({
        next: () => {
          console.log('Producto actualizado exitosamente');
          this.cargarCatalogo();
          this.mostrarFormulario.set(false);
          this.editando.set(false);
          this.productoEditId.set(null);
          this.form = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Computación', imagen: '' };
        },
        error: (err) => {
          console.error('Error actualizando producto:', err);
          alert('Error al actualizar producto');
        }
      });
    } else {
      // Create new product
      this.productoService.crearProducto(productoData).subscribe({
        next: () => {
          console.log('Producto creado exitosamente');
          this.cargarCatalogo();
          this.mostrarFormulario.set(false);
          this.form = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Computación', imagen: '' };
        },
        error: (err) => {
          console.error('Error creando producto:', err);
          alert('Error al crear producto');
        }
      });
    }
  }

  eliminarProducto(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    
    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        console.log('Producto eliminado exitosamente');
        this.cargarCatalogo();
      },
      error: (err) => {
        console.error('Error eliminando producto:', err);
        alert('Error al eliminar producto');
      }
    });
  }

  ajustarStock(id: number, cantidad: number) {
    const producto = this.productos().find(p => p.id === id);
    if (!producto) return;
    
    const nuevoStock = Math.max(0, producto.stock + cantidad);
    const productoActualizado: ProductoBackend = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: nuevoStock,
      categoria: producto.categoria,
      imagen: producto.imagen
    };
    
    this.productoService.actualizarProducto(id, productoActualizado).subscribe({
      next: () => {
        console.log('Stock actualizado');
        this.productos.update(lista =>
          lista.map(p => p.id === id ? { ...p, stock: nuevoStock } : p)
        );
      },
      error: (err) => {
        console.error('Error actualizando stock:', err);
      }
    });
  }

  isAdminOrOperador(): boolean {
    return this.userStore.isAdmin() || this.userStore.isOperador();
  }

  irAPagar() {
    this.mostrarCarrito.set(false);
    this.mostrarPago.set(true);
  }

  confirmarPago() {
    this.procesando.set(true);
    
    // Obtener información del usuario autenticado
    const account = this.msalService.instance.getAllAccounts()[0];
    const clienteEmail = account?.username || 'usuario@pedidos360.com';
    const clienteNombre = account?.name || 'Usuario Pedidos360';
    
    const items = this.cart.items();
    let completados = 0;

    console.log('[ProductsComponent] Creando pedidos:', items.length);
    
    for (const item of items) {
      const total = item.precio * item.cantidad;
      const pedido = {
        producto: item.nombre,
        cantidad: item.cantidad,
        total: total,
        clienteEmail: clienteEmail,
        clienteNombre: clienteNombre
      };
      
      console.log('[ProductsComponent] Enviando pedido:', pedido);
      
      this.apiService.post('/api/pedidos', pedido).subscribe({
        next: (response) => {
          console.log('[ProductsComponent] Pedido creado exitosamente:', response);
          completados++;
          if (completados === items.length) {
            this.cart.vaciar();
            this.procesando.set(false);
            this.pagoExitoso.set(true);
          }
        },
        error: (err) => {
          console.error('[ProductsComponent] Error creando pedido:', err);
          this.procesando.set(false);
        }
      });
    }
  }

  cerrarPago() {
    this.mostrarPago.set(false);
    this.pagoExitoso.set(false);
    this.card = { nombre: '', numero: '', vencimiento: '', cvv: '' };
  }

  // TrackBy functions for performance
  trackByProductId(index: number, producto: Producto): number {
    return producto.id;
  }

  trackByCategory(index: number, categoria: string): string {
    return categoria;
  }
}
