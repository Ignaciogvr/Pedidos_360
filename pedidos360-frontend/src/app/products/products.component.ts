import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../services/pedido.service';
import { CartService } from '../services/cart.service';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  categoria: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">🛍️ Catálogo de Productos</h1>
          <p class="page-subtitle">{{ esAdminUOperador ? 'Gestiona el catálogo completo' : 'Selecciona productos para tu pedido' }}</p>
        </div>
        <div class="header-actions">
          <!-- Carrito -->
          <button class="btn-cart" (click)="mostrarCarrito.set(true)">
            🛒 Carrito
            <span class="cart-count" *ngIf="cart.totalItems() > 0">{{ cart.totalItems() }}</span>
          </button>
          <button *ngIf="esAdminUOperador" class="btn-primary" (click)="toggleFormulario()">
            {{ mostrarFormulario() ? '✕ Cancelar' : '➕ Nuevo Producto' }}
          </button>
        </div>
      </div>

      <!-- Formulario Admin/Operador -->
      <div class="glass-card create-form" *ngIf="mostrarFormulario() && esAdminUOperador">
        <h3 class="form-title">➕ Agregar Producto al Catálogo</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre del producto</label>
            <input id="prod-nombre" type="text" [(ngModel)]="form.nombre" placeholder="Ej: Laptop Pro X" class="form-input" />
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select id="prod-categoria" [(ngModel)]="form.categoria" class="form-input">
              <option value="Computación">Computación</option>
              <option value="Periféricos">Periféricos</option>
              <option value="Audio">Audio</option>
              <option value="Móviles">Móviles</option>
              <option value="Accesorios">Accesorios</option>
            </select>
          </div>
          <div class="form-group">
            <label>Precio (CLP $)</label>
            <input id="prod-precio" type="number" [(ngModel)]="form.precio" placeholder="0" class="form-input" min="0" />
          </div>
          <div class="form-group">
            <label>Stock disponible</label>
            <input id="prod-stock" type="number" [(ngModel)]="form.stock" placeholder="0" class="form-input" min="0" />
          </div>
          <div class="form-group form-group-full">
            <label>Descripción</label>
            <input id="prod-desc" type="text" [(ngModel)]="form.descripcion" placeholder="Breve descripción del producto..." class="form-input" />
          </div>
        </div>
        <div class="form-actions">
          <button id="btn-guardar-producto" class="btn-primary" (click)="agregarProducto()" [disabled]="!form.nombre || !form.precio">
            💾 Guardar Producto
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="glass-card filters-bar">
        <span class="filter-label">Categoría:</span>
        <button *ngFor="let cat of categorias" class="filter-btn"
          [class.active]="categoriaActiva() === cat" (click)="categoriaActiva.set(cat)">{{ cat }}</button>
      </div>

      <!-- Grid de productos -->
      <div class="products-grid">
        <div class="product-card" *ngFor="let p of productosFiltrados()" [class.sin-stock]="p.stock === 0">
          <div class="product-img-wrapper">
            <img [src]="p.imagen" [alt]="p.nombre" class="product-img" loading="lazy" />
            <span class="product-category">{{ p.categoria }}</span>
            <span class="stock-badge" [class.agotado]="p.stock === 0">
              {{ p.stock === 0 ? '⚠ Agotado' : '✓ Stock: ' + p.stock }}
            </span>
          </div>
          <div class="product-body">
            <h3 class="product-name">{{ p.nombre }}</h3>
            <p class="product-desc">{{ p.descripcion }}</p>
            <div class="product-footer">
              <span class="product-price">\$ {{ p.precio | number }}</span>
              <div class="product-actions">
                <div class="stock-admin" *ngIf="esAdminUOperador">
                  <button class="btn-stock" (click)="ajustarStock(p.id, -1)" [disabled]="p.stock === 0" title="Restar Stock">−1</button>
                  <button class="btn-stock" (click)="ajustarStock(p.id, 1)" title="Sumar Stock">+1</button>
                </div>
                <button *ngIf="esAdminUOperador" class="btn-danger" (click)="eliminarProducto(p.id)" title="Eliminar">🗑</button>
                <button
                  class="btn-add-cart"
                  (click)="agregarAlCarrito(p)"
                  [disabled]="p.stock === 0"
                >{{ p.stock === 0 ? 'Agotado' : '+ Carrito' }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="productosFiltrados().length === 0">
          <span class="empty-icon">📭</span>
          <p>No hay productos en esta categoría</p>
        </div>
      </div>

      <!-- ===== MODAL CARRITO ===== -->
      <div class="modal-overlay" *ngIf="mostrarCarrito()" (click)="mostrarCarrito.set(false)">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>🛒 Tu Carrito</h3>
            <button class="modal-close" (click)="mostrarCarrito.set(false)">✕</button>
          </div>

          <!-- Carrito vacío -->
          <div class="cart-empty" *ngIf="cart.items().length === 0">
            <span>🛒</span>
            <p>Tu carrito está vacío</p>
          </div>

          <!-- Items del carrito -->
          <div class="cart-items" *ngIf="cart.items().length > 0">
            <div class="cart-item" *ngFor="let item of cart.items()">
              <img [src]="item.imagen" [alt]="item.nombre" class="cart-item-img" />
              <div class="cart-item-info">
                <span class="cart-item-name">{{ item.nombre }}</span>
                <span class="cart-item-price">\$ {{ item.precio | number }} c/u</span>
              </div>
              <div class="cart-item-qty">
                <button class="qty-btn" (click)="cart.quitar(item.id)">−</button>
                <span class="qty-num">{{ item.cantidad }}</span>
                <button class="qty-btn" (click)="cart.agregar({id: item.id, nombre: item.nombre, precio: item.precio, imagen: item.imagen, stockMax: item.stockMax})" [disabled]="item.cantidad >= item.stockMax">+</button>
              </div>
              <span class="cart-item-total">\$ {{ (item.precio * item.cantidad) | number }}</span>
              <button class="btn-danger" (click)="cart.eliminar(item.id)">🗑</button>
            </div>
          </div>

          <!-- Total y botón pagar -->
          <div class="cart-footer" *ngIf="cart.items().length > 0">
            <div class="cart-total">
              <span class="total-label">Total:</span>
              <span class="total-price">\$ {{ cart.totalPrecio() | number }}</span>
            </div>
            <div class="cart-footer-actions">
              <button class="btn-outline" (click)="cart.vaciar()">Vaciar carrito</button>
              <button class="btn-primary" (click)="irAPagar()">💳 Proceder al pago</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MODAL PAGO ===== -->
      <div class="modal-overlay" *ngIf="mostrarPago()" (click)="mostrarPago.set(false)">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">

          <!-- Pantalla de éxito -->
          <div *ngIf="pagoExitoso()" class="pago-success">
            <div class="success-icon">✅</div>
            <h3>¡Pago realizado con éxito!</h3>
            <p>Tu pedido ha sido registrado en el sistema.</p>
            <p class="success-sub">Puedes verlo en la sección <strong>Pedidos</strong>.</p>
            <button class="btn-primary" (click)="cerrarPago()">Aceptar</button>
          </div>

          <!-- Formulario de pago -->
          <ng-container *ngIf="!pagoExitoso()">
            <div class="modal-header">
              <h3>💳 Pago Simulado</h3>
              <button class="modal-close" (click)="mostrarPago.set(false)">✕</button>
            </div>

            <div class="pago-resumen">
              <span>{{ cart.totalItems() }} producto(s)</span>
              <span class="total-price">\$ {{ cart.totalPrecio() | number }}</span>
            </div>

            <div class="pago-form">
              <div class="form-group">
                <label>Nombre en la tarjeta</label>
                <input id="card-name" type="text" [(ngModel)]="card.nombre" placeholder="JUAN PÉREZ" class="form-input" />
              </div>
              <div class="form-group">
                <label>Número de tarjeta</label>
                <input id="card-number" type="text" [(ngModel)]="card.numero" placeholder="1234 5678 9012 3456" maxlength="19" class="form-input" (input)="formatCard($event)" />
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Vencimiento</label>
                  <input id="card-exp" type="text" [(ngModel)]="card.vencimiento" placeholder="MM/AA" maxlength="5" class="form-input" />
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input id="card-cvv" type="text" [(ngModel)]="card.cvv" placeholder="123" maxlength="3" class="form-input" />
                </div>
              </div>
              <div class="pago-nota">
                🔒 Pago 100% simulado — No se realizan cargos reales
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-outline" (click)="mostrarPago.set(false)">Cancelar</button>
              <button
                id="btn-confirmar-pago"
                class="btn-primary"
                (click)="confirmarPago()"
                [disabled]="procesando() || !card.nombre || !card.numero || !card.vencimiento || !card.cvv"
              >
                {{ procesando() ? '⏳ Procesando...' : '💳 Confirmar Pago' }}
              </button>
            </div>
          </ng-container>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .products-page { display: flex; flex-direction: column; gap: 1.25rem; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
    .page-subtitle { color: #94a3b8; font-size: 0.88rem; margin-top: 0.25rem; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    .btn-cart {
      position: relative; background: rgba(99,102,241,0.15); color: #a78bfa;
      border: 1px solid rgba(99,102,241,0.3); padding: 0.55rem 1.2rem;
      border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-cart:hover { background: rgba(99,102,241,0.3); }
    .cart-count {
      position: absolute; top: -8px; right: -8px;
      background: #6366f1; color: white; border-radius: 50%;
      width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800;
    }

    .create-form { }
    .form-title { font-size: 1rem; font-weight: 700; color: #c4b5fd; margin-bottom: 1.2rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-group-full { grid-column: 1 / -1; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-input {
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
      color: #f1f5f9; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.9rem;
      transition: border-color 0.2s; width: 100%;
    }
    .form-input::placeholder { color: #64748b; }
    .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .form-input option { background: #1e1e35; }
    .form-actions { margin-top: 1.2rem; }

    .filters-bar { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 1rem 1.5rem; }
    .filter-label { font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 0.5rem; }
    .filter-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.3rem 0.9rem; border-radius: 20px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }
    .filter-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); color: #a78bfa; font-weight: 700; }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem; }

    .product-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; transition: all 0.25s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); border-color: rgba(99,102,241,0.3); }
    .product-card.sin-stock { opacity: 0.55; }

    .product-img-wrapper { position: relative; aspect-ratio: 16/10; overflow: hidden; }
    .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .product-card:hover .product-img { transform: scale(1.04); }
    .product-category { position: absolute; top: 0.6rem; left: 0.6rem; background: rgba(15,15,26,0.75); backdrop-filter: blur(8px); color: #a78bfa; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; border: 1px solid rgba(167,139,250,0.3); text-transform: uppercase; letter-spacing: 0.05em; }
    .stock-badge { position: absolute; bottom: 0.6rem; right: 0.6rem; background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.3); font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
    .stock-badge.agotado { background: rgba(239,68,68,0.2); color: #f87171; border-color: rgba(239,68,68,0.3); }

    .product-body { padding: 1rem 1.2rem; }
    .product-name { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.4rem; }
    .product-desc { font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-bottom: 0.9rem; height: 2.4em; overflow: hidden; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; }
    .product-price { font-size: 1.15rem; font-weight: 800; color: #a78bfa; }
    .product-actions { display: flex; gap: 0.5rem; align-items: center; }

    .stock-admin { display: flex; gap: 0.2rem; background: rgba(255,255,255,0.05); padding: 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
    .btn-stock { background: transparent; color: #f1f5f9; border: none; width: 28px; height: 28px; border-radius: 4px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-stock:hover:not(:disabled) { background: rgba(99,102,241,0.3); color: #a78bfa; }
    .btn-stock:disabled { opacity: 0.3; cursor: not-allowed; }

    .btn-add-cart { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.4rem 0.9rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; }
    .btn-add-cart:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
    .btn-add-cart:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; background: #475569; }

    .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.4rem 0.7rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
    .btn-danger:hover { background: rgba(239,68,68,0.3); }

    .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: #475569; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

    /* MODAL BASE */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal { background: #12121f; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; width: 100%; max-width: 460px; padding: 1.8rem; box-shadow: 0 30px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 1.2rem; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 560px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; }
    .modal-close { background: none; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer; padding: 0.2rem 0.5rem; transition: color 0.2s; }
    .modal-close:hover { color: #f1f5f9; }
    .modal-footer { display: flex; gap: 0.8rem; justify-content: flex-end; }

    /* CARRITO */
    .cart-empty { text-align: center; padding: 2rem; color: #475569; font-size: 1.2rem; }
    .cart-empty span { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .cart-items { display: flex; flex-direction: column; gap: 0.75rem; }
    .cart-item { display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); }
    .cart-item-img { width: 52px; height: 40px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
    .cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .cart-item-name { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cart-item-price { font-size: 0.75rem; color: #64748b; }
    .cart-item-qty { display: flex; align-items: center; gap: 0.4rem; }
    .qty-btn { width: 26px; height: 26px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #f1f5f9; border-radius: 6px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .qty-btn:hover { background: rgba(99,102,241,0.3); }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-num { font-weight: 700; font-size: 0.9rem; min-width: 20px; text-align: center; }
    .cart-item-total { font-weight: 700; color: #a78bfa; font-size: 0.9rem; min-width: 90px; text-align: right; }

    .cart-footer { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .cart-total { display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 0.9rem; color: #94a3b8; font-weight: 600; }
    .total-price { font-size: 1.4rem; font-weight: 800; color: #a78bfa; }
    .cart-footer-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }

    /* PAGO */
    .pago-resumen { display: flex; justify-content: space-between; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 0.9rem 1.2rem; color: #94a3b8; font-size: 0.9rem; align-items: center; }
    .pago-form { display: flex; flex-direction: column; gap: 1rem; }
    .pago-nota { text-align: center; font-size: 0.78rem; color: #475569; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.6rem; margin-top: 0.3rem; }

    .pago-success { text-align: center; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .success-icon { font-size: 4rem; }
    .pago-success h3 { font-size: 1.4rem; font-weight: 800; color: #34d399; }
    .pago-success p { color: #94a3b8; }
    .success-sub strong { color: #a78bfa; }

    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.55rem 1.3rem; border-radius: 8px; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(99,102,241,0.3); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 25px rgba(99,102,241,0.5); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-outline { background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); padding: 0.55rem 1.2rem; border-radius: 8px; font-weight: 500; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }
  `]
})
export class ProductsComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private http = inject(HttpClient);
  cart = inject(CartService);

  esAdminUOperador = false;
  mostrarFormulario = signal(false);
  categoriaActiva = signal('Todos');
  mostrarCarrito = signal(false);
  mostrarPago = signal(false);
  pagoExitoso = signal(false);
  procesando = signal(false);

  form = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Computación' };
  card = { nombre: '', numero: '', vencimiento: '', cvv: '' };

  categorias = ['Todos', 'Computación', 'Periféricos', 'Audio', 'Móviles', 'Accesorios'];

  productos = signal<Producto[]>([]);

  nextId = 9;

  ngOnInit() {
    this.esAdminUOperador = this.pedidoService.hasRole('Admin') || this.pedidoService.hasRole('Operador');
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    this.http.get<Producto[]>('https://6yhwhad3ea.execute-api.us-east-1.amazonaws.com/api/catalogo').subscribe({
      next: (data) => this.productos.set(data),
      error: (err) => console.error('Error cargando catálogo:', err)
    });
  }

  productosFiltrados() {
    const cat = this.categoriaActiva();
    if (cat === 'Todos') return this.productos();
    return this.productos().filter(p => p.categoria === cat);
  }

  toggleFormulario() { this.mostrarFormulario.update(v => !v); }

  agregarAlCarrito(p: Producto) {
    if (p.stock <= 0) return;
    // Descontar stock visualmente
    this.productos.update(lista =>
      lista.map(prod => prod.id === p.id ? { ...prod, stock: prod.stock - 1 } : prod)
    );
    this.cart.agregar({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, stockMax: p.stock });
  }

  agregarProducto() {
    if (!this.form.nombre || !this.form.precio) return;
    const seed = this.form.nombre.toLowerCase().replace(/\s/g, '') + this.nextId;
    this.productos.update(lista => [...lista, {
      id: this.nextId++,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion || 'Sin descripción',
      precio: this.form.precio,
      stock: this.form.stock,
      categoria: this.form.categoria,
      imagen: `https://picsum.photos/seed/${seed}/400/250`
    }]);
    this.form = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Computación' };
    this.mostrarFormulario.set(false);
  }

  eliminarProducto(id: number) {
    if (confirm('¿Eliminar este producto del catálogo?')) {
      this.productos.update(lista => lista.filter(p => p.id !== id));
    }
  }

  ajustarStock(id: number, cantidad: number) {
    this.productos.update(lista =>
      lista.map(prod => prod.id === id ? { ...prod, stock: Math.max(0, prod.stock + cantidad) } : prod)
    );
  }

  irAPagar() {
    this.mostrarCarrito.set(false);
    this.mostrarPago.set(true);
  }

  formatCard(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    this.card.numero = val;
  }

  confirmarPago() {
    this.procesando.set(true);
    const items = this.cart.items();

    // Crear un pedido por cada item del carrito en el backend
    let completados = 0;
    for (const item of items) {
      this.pedidoService.crearPedido({ producto: item.nombre, cantidad: item.cantidad }).subscribe({
        next: () => {
          completados++;
          if (completados === items.length) {
            this.cart.vaciar();
            this.procesando.set(false);
            this.pagoExitoso.set(true);
          }
        },
        error: () => {
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
}
